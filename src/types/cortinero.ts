export interface Cortinero {
  id: string;
  nombre: string;
  foto: string;
  telefono?: string;
  zona: string;
  limiteCredito: number;
  saldo: number;
  ultimoMovimiento: Date;
}

export interface Movimiento {
  id: string;
  cortineroId: string;
  fecha: Date;
  tipo: 'entrega' | 'pago' | 'ajuste';
  descripcion: string;
  importe: number;
  saldoResultante: number;
  metodoPago?: string;
  nota?: string;
}

export type FiltroTipo = 'todos' | 'deben' | 'al-dia' | 'deuda-alta' | 'pagos-recientes';
