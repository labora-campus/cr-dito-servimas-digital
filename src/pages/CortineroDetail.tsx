import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, CreditCard, DollarSign, Package, FileDown, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MovimientoRow } from '@/components/MovimientoRow';
import { PaymentModal } from '@/components/PaymentModal';
import { DeliveryModal } from '@/components/DeliveryModal';
import { getCortineroById, getMovimientosByCortinero } from '@/data/mockData';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function CortineroDetail() {
  const { id } = useParams<{ id: string }>();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  const cortinero = getCortineroById(id || '');
  const movimientos = getMovimientosByCortinero(id || '');

  if (!cortinero) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-foreground">Cortinero no encontrado</h2>
        <Link to="/cortineros" className="text-primary hover:underline mt-2 inline-block">
          Volver al listado
        </Link>
      </div>
    );
  }

  const isDebt = cortinero.saldo < 0;
  const isPositive = cortinero.saldo > 0;

  const handlePayment = (data: { monto: number; metodoPago: string; comentarios: string; fecha: string }) => {
    toast({
      title: 'Pago registrado',
      description: `Se registró un pago de ${formatCurrency(data.monto)} para ${cortinero.nombre}`,
    });
  };

  const handleDelivery = (data: { monto: number; descripcion: string; fecha: string }) => {
    toast({
      title: 'Entrega registrada',
      description: `Se registró una entrega de ${formatCurrency(data.monto)} para ${cortinero.nombre}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/cortineros"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al listado
      </Link>

      {/* Profile Header */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden animate-fade-in">
        <div className="gradient-primary h-24 md:h-32" />
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            <img
              src={cortinero.foto}
              alt={cortinero.nombre}
              className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover ring-4 ring-card shadow-xl"
            />
            <div className="flex-1 md:pb-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{cortinero.nombre}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-muted-foreground">
                {cortinero.telefono && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {cortinero.telefono}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {cortinero.zona}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4" />
                  Límite: {formatCurrency(cortinero.limiteCredito)}
                </span>
              </div>
            </div>
            <div className="md:pb-2 text-left md:text-right">
              <p className="text-sm text-muted-foreground">Saldo actual</p>
              <p className={cn(
                'text-3xl md:text-4xl font-bold',
                isDebt && 'text-destructive',
                isPositive && 'text-success',
                !isDebt && !isPositive && 'text-muted-foreground'
              )}>
                {isDebt && '-'}{formatCurrency(Math.abs(cortinero.saldo))}
              </p>
              <p className={cn(
                'text-sm font-medium',
                isDebt ? 'text-destructive' : isPositive ? 'text-success' : 'text-muted-foreground'
              )}>
                {isDebt ? 'Debe' : isPositive ? 'A favor' : 'Al día'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setShowPaymentModal(true)}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Registrar Pago
        </Button>
        <Button onClick={() => setShowDeliveryModal(true)}>
          <Package className="h-4 w-4 mr-2" />
          Registrar Entrega
        </Button>
        <Button variant="outline">
          <FileDown className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
        <Button variant="outline">
          <StickyNote className="h-4 w-4 mr-2" />
          Agregar Nota
        </Button>
      </div>

      {/* Movements Table */}
      <div className="rounded-2xl bg-card border border-border overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Historial de Movimientos</h2>
          <p className="text-sm text-muted-foreground mt-1">{movimientos.length} movimientos registrados</p>
        </div>

        {movimientos.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Fecha
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Tipo
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Descripción
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Importe
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider py-3 px-4">
                    Saldo
                  </th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((movimiento) => (
                  <MovimientoRow key={movimiento.id} movimiento={movimiento} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        cortineroNombre={cortinero.nombre}
        onSubmit={handlePayment}
      />
      <DeliveryModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        cortineroNombre={cortinero.nombre}
        onSubmit={handleDelivery}
      />
    </div>
  );
}
