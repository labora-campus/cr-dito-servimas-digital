import { useState } from 'react';
import { X, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface DeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  cortineroNombre: string;
  onSubmit: (data: { monto: number; descripcion: string; fecha: string; pagoInicial?: number; metodoPago?: string }) => void | Promise<void>;
}

export function DeliveryModal({ isOpen, onClose, cortineroNombre, onSubmit }: DeliveryModalProps) {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [pagoInicial, setPagoInicial] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || !descripcion) {
      toast({
        title: 'Error',
        description: 'Complete los campos requeridos',
        variant: 'destructive',
      });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        monto: parseFloat(monto),
        descripcion,
        fecha,
        pagoInicial: pagoInicial ? parseFloat(pagoInicial) : undefined,
        metodoPago: pagoInicial ? metodoPago : undefined,
      });
      setMonto('');
      setDescripcion('');
      setPagoInicial('');
      setMetodoPago('efectivo');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo registrar la entrega';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl animate-scale-in">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Registrar Entrega</h2>
            <p className="text-sm text-muted-foreground">{cortineroNombre}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monto">Monto Total *</Label>
              <Input
                id="monto"
                type="number"
                placeholder="0.00"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
            <h3 className="text-sm font-medium text-foreground">Pago Inicial (Opcional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pagoInicial">Monto a pagar ahora</Label>
                <Input
                  id="pagoInicial"
                  type="number"
                  placeholder="0.00"
                  value={pagoInicial}
                  onChange={(e) => setPagoInicial(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metodoPago">Método de Pago</Label>
                <select
                  id="metodoPago"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              placeholder="Ej: Paño microperforado 50m, Rieles aluminio..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Registrando...' : 'Registrar Entrega'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
