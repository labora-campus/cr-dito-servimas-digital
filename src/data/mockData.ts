import { Cortinero, Movimiento } from '@/types/cortinero';

export const cortineros: Cortinero[] = [
  {
    id: '1',
    nombre: 'Carlos Mendoza',
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    telefono: '+54 11 4567-8901',
    zona: 'Zona Norte',
    limiteCredito: 150000,
    saldo: -45000,
    ultimoMovimiento: new Date('2024-12-01'),
  },
  {
    id: '2',
    nombre: 'María González',
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    telefono: '+54 11 5678-9012',
    zona: 'Zona Sur',
    limiteCredito: 200000,
    saldo: 0,
    ultimoMovimiento: new Date('2024-12-03'),
  },
  {
    id: '3',
    nombre: 'Roberto Fernández',
    foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    telefono: '+54 11 6789-0123',
    zona: 'Zona Oeste',
    limiteCredito: 180000,
    saldo: -120000,
    ultimoMovimiento: new Date('2024-11-28'),
  },
  {
    id: '4',
    nombre: 'Ana Martínez',
    foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
    telefono: '+54 11 7890-1234',
    zona: 'Centro',
    limiteCredito: 100000,
    saldo: -25000,
    ultimoMovimiento: new Date('2024-12-04'),
  },
  {
    id: '5',
    nombre: 'Diego López',
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    telefono: '+54 11 8901-2345',
    zona: 'Zona Norte',
    limiteCredito: 250000,
    saldo: -180000,
    ultimoMovimiento: new Date('2024-12-02'),
  },
  {
    id: '6',
    nombre: 'Laura Sánchez',
    foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    telefono: '+54 11 9012-3456',
    zona: 'Zona Sur',
    limiteCredito: 120000,
    saldo: 5000,
    ultimoMovimiento: new Date('2024-12-05'),
  },
];

export const movimientos: Movimiento[] = [
  {
    id: 'm1',
    cortineroId: '1',
    fecha: new Date('2024-12-01'),
    tipo: 'entrega',
    descripcion: 'Paño microperforado 50m',
    importe: 35000,
    saldoResultante: -45000,
  },
  {
    id: 'm2',
    cortineroId: '1',
    fecha: new Date('2024-11-28'),
    tipo: 'pago',
    descripcion: 'Pago parcial',
    importe: 20000,
    saldoResultante: -10000,
    metodoPago: 'Transferencia',
  },
  {
    id: 'm3',
    cortineroId: '1',
    fecha: new Date('2024-11-25'),
    tipo: 'entrega',
    descripcion: 'Rieles aluminio x10',
    importe: 30000,
    saldoResultante: -30000,
  },
  {
    id: 'm4',
    cortineroId: '3',
    fecha: new Date('2024-11-28'),
    tipo: 'entrega',
    descripcion: 'Cortinas blackout x20',
    importe: 80000,
    saldoResultante: -120000,
  },
  {
    id: 'm5',
    cortineroId: '3',
    fecha: new Date('2024-11-20'),
    tipo: 'entrega',
    descripcion: 'Tela sunscreen 100m',
    importe: 40000,
    saldoResultante: -40000,
  },
  {
    id: 'm6',
    cortineroId: '5',
    fecha: new Date('2024-12-02'),
    tipo: 'entrega',
    descripcion: 'Kit motorización x5',
    importe: 100000,
    saldoResultante: -180000,
  },
  {
    id: 'm7',
    cortineroId: '5',
    fecha: new Date('2024-11-30'),
    tipo: 'pago',
    descripcion: 'Pago mensual',
    importe: 50000,
    saldoResultante: -80000,
    metodoPago: 'Efectivo',
  },
  {
    id: 'm8',
    cortineroId: '6',
    fecha: new Date('2024-12-05'),
    tipo: 'pago',
    descripcion: 'Cancelación total + adelanto',
    importe: 45000,
    saldoResultante: 5000,
    metodoPago: 'Transferencia',
  },
];

export const getMovimientosByCortinero = (cortineroId: string): Movimiento[] => {
  return movimientos
    .filter((m) => m.cortineroId === cortineroId)
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
};

export const getCortineroById = (id: string): Cortinero | undefined => {
  return cortineros.find((c) => c.id === id);
};
