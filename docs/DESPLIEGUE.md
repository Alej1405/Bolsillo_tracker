# Despliegue

Cada push a `main` publica el sitio en <https://bolsillo.mashaec.net> sin intervención
manual. Este documento explica cómo está montado, qué protege qué, y cómo rehacerlo
si hay que rotar la clave o mover el servidor.

```
push a main
   ↓
GitHub Actions · trabajo "validar"      npm ci → oxlint → tsc -b → vite build
   ↓                                     (también corre en cada pull request)
GitHub Actions · trabajo "desplegar"    rsync del dist/ por SSH
   ↓                                     (nunca corre desde un pull request)
nginx · /var/www/bolsillo.mashaec.net
```

El servidor recibe **solo el `dist/` ya compilado**. No hay Node ni `npm install` en
producción: menos superficie de ataque y despliegues de segundos.

---

## Por qué está escrito así

El repositorio es público. Cualquiera puede leer el workflow y cualquiera puede abrir
un pull request contra él, así que el diseño parte de esa base.

### 1. Nada del servidor está en el código

Host, usuario y huella viven en los *Secrets* del repositorio. GitHub **no entrega
secretos a workflows disparados desde un fork**, así que un pull request hostil que
modifique el workflow para filtrarlos recibe cadenas vacías.

### 2. Validar y desplegar son trabajos separados

El trabajo que toca los secretos lleva esta condición:

```yaml
if: >-
  github.event_name != 'pull_request' &&
  github.ref == 'refs/heads/main' &&
  github.repository == 'Alej1405/Bolsillo_tracker'
```

Un pull request se queda en la validación. Y si alguien forkea el repositorio, la
comprobación de `github.repository` impide que su copia despliegue en nuestro servidor.

### 3. La clave de despliegue casi no puede hacer nada

Es una clave dedicada — **no la personal** — y en el servidor está restringida así:

```
restrict,command="/usr/bin/rrsync -wo /var/www/bolsillo.mashaec.net" ssh-ed25519 AAAA…
```

| Restricción | Qué impide |
|---|---|
| `restrict` | Terminal interactiva, túneles de puertos, reenvío de agente, X11 |
| `command="…"` | Ejecutar cualquier cosa que no sea `rrsync`, aunque se pida otro comando |
| `rrsync /var/www/…` | Salir de ese directorio, aunque la ruta que llegue diga `../..` |
| `-wo` | **Leer o descargar** cualquier archivo del servidor |

El peor escenario si la clave se filtrara es que alguien sobrescriba los archivos de
esa carpeta. No puede leer el servidor, entrar por consola ni tocar el resto del VPS.

Comprobado en el servidor:

```
$ ssh -i clave alej1405mc@…  'cat /etc/passwd'
/usr/bin/rrsync error: SSH_ORIGINAL_COMMAND does not run rsync

$ (intento de descarga)
/usr/bin/rrsync error: reading from write-only server is not allowed
```

### 4. El host se verifica, no se acepta a ciegas

El workflow escribe un `known_hosts` desde un secreto y usa `StrictHostKeyChecking=yes`.
La alternativa habitual — `StrictHostKeyChecking=no` — acepta a cualquiera que responda
en esa IP, que es justo lo que permite un ataque de intermediario. La huella se verificó
contra la que reporta el propio servidor por un canal ya autenticado:

```
SHA256:2wkCWMT+hJUJHjJvOdSXwtLKp4MZLBAUbgA1BJl9nbg  (ED25519)
```

### 5. Las acciones van fijadas por SHA

`actions/checkout@3d3c42e…` en vez de `@v7`. Una etiqueta se puede reapuntar a otro
commit; un SHA no. Es la defensa contra que una acción de terceros sea comprometida.
El comentario al lado (`# v7.0.1`) dice qué versión es ese SHA.

### 6. Otros seguros

- `permissions: contents: read` — el workflow no puede escribir en el repositorio.
- `concurrency` con `cancel-in-progress` — dos pushes seguidos no se pisan a medias.
- La clave se borra del runner con `if: always()`, incluso si el despliegue falla.
- `npm ci` en vez de `npm install` — instala exactamente el `package-lock.json`.
- Verificación final por HTTP: si el sitio no responde 200, el despliegue sale en rojo.

---

## Secrets del repositorio

En **Settings → Secrets and variables → Actions**:

| Secreto | Valor | Obligatorio |
|---|---|---|
| `VPS_HOST` | `138.68.45.117` | Sí |
| `VPS_USUARIO` | `alej1405mc` | Sí |
| `VPS_SSH_KEY` | Clave **privada** de despliegue, completa | Sí |
| `VPS_KNOWN_HOSTS` | `138.68.45.117 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINBNneJxEKnu2slZZ48lq/uebxmPsWkcJjM2E7Ths4zz` | Sí |
| `VPS_PUERTO` | Puerto SSH, si no es el 22 | No |
| `CF_ZONA` | ID de zona de Cloudflare | No |
| `CF_TOKEN` | Token con permiso *Cache Purge* | No |

`VPS_SSH_KEY` va con las líneas `-----BEGIN…` y `-----END…` incluidas, y con salto de
línea final. Sin los dos secretos de Cloudflare el paso de purga se salta solo.

> El dominio pasa por Cloudflare. Sin purgar la caché, un archivo nuevo puede tardar en
> verse aunque el despliegue haya salido bien. Los nombres de `dist/assets/` llevan hash,
> así que el problema afecta sobre todo a `index.html`.

---

## Rehacer la clave de despliegue

Si hay que rotarla — por sospecha de filtración o por mantenimiento:

```bash
# 1. Generar una clave nueva, sin passphrase (Actions no puede teclearla)
ssh-keygen -t ed25519 -N "" -C "actions-despliegue-bolsillo" -f ./despliegue_bolsillo

# 2. Instalarla restringida en el servidor
PUB=$(cat despliegue_bolsillo.pub)
ssh masha_mc "
  cp ~/.ssh/authorized_keys ~/.ssh/authorized_keys.bak.\$(date +%Y%m%d-%H%M%S)
  grep -v 'actions-despliegue-bolsillo' ~/.ssh/authorized_keys > ~/.ssh/ak.tmp || true
  echo 'restrict,command=\"/usr/bin/rrsync -wo /var/www/bolsillo.mashaec.net\" $PUB' >> ~/.ssh/ak.tmp
  mv ~/.ssh/ak.tmp ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
"

# 3. Copiar la privada al secreto VPS_SSH_KEY
cat despliegue_bolsillo | pbcopy

# 4. Borrarla del disco local: ya no hace falta en ningún lado
rm -f despliegue_bolsillo despliegue_bolsillo.pub
```

---

## Permisos del directorio

El destino debe pertenecer al usuario de despliegue y poder leerlo nginx (`www-data`):

```bash
sudo chown -R alej1405mc:www-data /var/www/bolsillo.mashaec.net
sudo chmod -R u=rwX,g=rX,o=rX /var/www/bolsillo.mashaec.net
```

---

## Si algo falla

| Síntoma en Actions | Causa habitual |
|---|---|
| `Permission denied (publickey)` | `VPS_SSH_KEY` incompleta o sin salto de línea final |
| `Host key verification failed` | `VPS_KNOWN_HOSTS` vacío o la huella del servidor cambió |
| `rrsync error: invalid rsync-command syntax` | Cliente rsync incompatible (le pasa a openrsync, el de macOS) |
| `rsync: mkstemp failed: Permission denied` | Falta el `chown` del directorio |
| `SSH_ORIGINAL_COMMAND does not run rsync` | La restricción hizo su trabajo: se intentó otro comando |
| El sitio no responde 200 | nginx caído, o Cloudflare sirviendo una versión cacheada |

Los registros de la restricción quedan en el servidor si existe `/var/log/rrsync.log`.

---

## Probar el despliegue a mano

```bash
npm run build
rsync -rlptz --delete --checksum \
  -e "ssh -i ~/.ssh/despliegue_bolsillo -o IdentitiesOnly=yes" \
  dist/ alej1405mc@138.68.45.117:.
```

El destino es `:.` — un punto, sin ruta. `rrsync` ancla la carpeta en el servidor, así
que la ruta real nunca viaja en el comando. Ojo en macOS: el `rsync` del sistema es
openrsync y no sirve para esto; hace falta el de Samba (`brew install rsync`).
