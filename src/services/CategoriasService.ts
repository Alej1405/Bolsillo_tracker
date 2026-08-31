import { api } from '@/services/api'
import {
  ActualizarCategoriaSchema,
  CategoriaSchema,
  CrearCategoriaSchema,
  ListaCategoriasAPIResponseSchema,
} from '@/utils/movimientos-schema'
import type { Categoria, DatosActualizarCategoria, DatosCrearCategoria } from '@/types'

/*
  Llamadas a /categories del backend.

  Las categorías llegan en árbol: cada raíz trae sus subcategorías en
  `children`. Las del sistema (`is_system`) las comparten todos los usuarios y
  no se pueden editar ni borrar — el backend responde 403.
*/

/** El catálogo, filtrable por tipo. Sin `tipo` devuelve gastos e ingresos. */
export async function listarCategorias(
  tipo?: 'income' | 'expense',
  incluirArchivadas = false,
): Promise<Categoria[]> {
  const { data } = await api.get('/categories', {
    params: {
      ...(tipo ? { kind: tipo } : {}),
      ...(incluirArchivadas ? { include_archived: true } : {}),
    },
  })
  return ListaCategoriasAPIResponseSchema.parse(data).items as Categoria[]
}

/** Crea una categoría propia. Con `parent_id` cuelga de otra. */
export async function crearCategoria(datos: DatosCrearCategoria): Promise<Categoria> {
  const cuerpo = CrearCategoriaSchema.parse(datos)
  const { data } = await api.post('/categories', cuerpo)
  return CategoriaSchema.parse(data) as Categoria
}

/** Edita una categoría propia. El tipo no se cambia una vez creada. */
export async function actualizarCategoria(
  id: string,
  datos: DatosActualizarCategoria,
): Promise<Categoria> {
  const cuerpo = ActualizarCategoriaSchema.parse(datos)
  const { data } = await api.patch(`/categories/${id}`, cuerpo)
  return CategoriaSchema.parse(data) as Categoria
}

/**
 * Borra una categoría propia.
 *
 * El backend responde 409 si tiene movimientos y 403 si es del sistema: las
 * del sistema son una fila compartida, y archivarlas las escondería para todos.
 */
export async function borrarCategoria(id: string): Promise<void> {
  await api.delete(`/categories/${id}`)
}
