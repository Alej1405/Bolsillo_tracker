import { DashboardAPIResponseSchema } from '@/utils/dashboard-schema'
import type { Dashboard } from '@/types'

/*
  Datos ficticios del dashboard, mientras se monta pantalla por pantalla.

  Pasan por el mismo schema que la respuesta real: si el contrato del backend
  cambia, este mock falla igual que fallaría la API. Un mock escrito a mano y
  sin validar se desincroniza en silencio y la pantalla se rompe el día de la
  conexión, no antes.

  Los montos son cadenas ya formateadas y `percentage` viene calculado, porque
  así los manda el backend: el frontend no suma ni promedia.
*/
export const DASHBOARD_FICTICIO: Dashboard = DashboardAPIResponseSchema.parse({
  current_month: '2026-08',
  total_balance: '1.248,50',
  summary: {
    total_income: '2.400,00',
    total_expense: '1.151,50',
    net: '1.248,50',
    total_saved: '268,00',
  },
  accounts: [
    { id: 'cta-1', name: 'Efectivo', type: 'cash', balance: '320,00', icon: null },
    { id: 'cta-2', name: 'Banco Pichincha', type: 'bank', balance: '780,50', icon: null },
    { id: 'cta-3', name: 'Tarjeta Visa', type: 'card', balance: '-120,00', icon: null },
    { id: 'cta-4', name: 'Viaje a la playa', type: 'savings', balance: '268,00', icon: null },
  ],
  top_expense_categories: [
    { category: { id: 'cat-1', name: 'Comida', icon: null, color: '#ea580c' }, amount: '412,30', percentage: 35.8 },
    { category: { id: 'cat-2', name: 'Transporte', icon: null, color: '#2563eb' }, amount: '268,00', percentage: 23.3 },
    { category: { id: 'cat-3', name: 'Servicios', icon: null, color: '#0d9488' }, amount: '215,20', percentage: 18.7 },
    { category: { id: 'cat-4', name: 'Ocio', icon: null, color: '#7c3aed' }, amount: '156,00', percentage: 13.5 },
    { category: { id: 'cat-5', name: 'Salud', icon: null, color: '#65a30d' }, amount: '100,00', percentage: 8.7 },
  ],
  recent_transactions: [
    {
      id: 'mov-1', type: 'expense', amount: '24,50', currency: 'USD',
      occurred_at: '2026-08-28T13:20:00Z', note: 'Almuerzo',
      account: { id: 'cta-1', name: 'Efectivo', type: 'cash', icon: null },
      counter_account: null,
      category: { id: 'cat-1', name: 'Comida', icon: null, color: '#ea580c' },
    },
    {
      id: 'mov-2', type: 'income', amount: '1.200,00', currency: 'USD',
      occurred_at: '2026-08-27T09:00:00Z', note: 'Sueldo',
      account: { id: 'cta-2', name: 'Banco Pichincha', type: 'bank', icon: null },
      counter_account: null, category: null,
    },
    {
      id: 'mov-3', type: 'expense', amount: '38,00', currency: 'USD',
      occurred_at: '2026-08-26T18:45:00Z', note: 'Gasolina',
      account: { id: 'cta-3', name: 'Tarjeta Visa', type: 'card', icon: null },
      counter_account: null,
      category: { id: 'cat-2', name: 'Transporte', icon: null, color: '#2563eb' },
    },
    {
      id: 'mov-4', type: 'transfer', amount: '150,00', currency: 'USD',
      occurred_at: '2026-08-25T11:10:00Z', note: 'Al ahorro',
      account: { id: 'cta-2', name: 'Banco Pichincha', type: 'bank', icon: null },
      counter_account: { id: 'cta-4', name: 'Viaje a la playa', type: 'savings', icon: null },
      category: null,
    },
    {
      id: 'mov-5', type: 'expense', amount: '62,40', currency: 'USD',
      occurred_at: '2026-08-24T16:30:00Z', note: 'Luz y agua',
      account: { id: 'cta-2', name: 'Banco Pichincha', type: 'bank', icon: null },
      counter_account: null,
      category: { id: 'cat-3', name: 'Servicios', icon: null, color: '#0d9488' },
    },
  ],
})
