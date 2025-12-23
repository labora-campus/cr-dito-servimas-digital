import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Movimiento } from '@/types/cortinero';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Calendar, Clock, CreditCard, DollarSign, FileText, User } from 'lucide-react';

interface ViewMovimientoModalProps {
    isOpen: boolean;
    onClose: () => void;
    movimiento: Movimiento | null;
}

export function ViewMovimientoModal({ isOpen, onClose, movimiento }: ViewMovimientoModalProps) {
    if (!movimiento) return null;

    const isPago = movimiento.tipo === 'pago';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Detalle del Movimiento</DialogTitle>
                    <DialogDescription>
                        ID: {movimiento.id}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Header Card */}
                    <div className={`p-4 rounded-lg border ${isPago ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'} flex justify-between items-center`}>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase">{movimiento.tipo}</p>
                            <h3 className={`text-2xl font-bold ${isPago ? 'text-success' : 'text-destructive'}`}>
                                {isPago ? '+' : '-'}{formatCurrency(movimiento.importe)}
                            </h3>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-muted-foreground">Saldo Resultante</p>
                            <p className="font-semibold">{formatCurrency(movimiento.saldoResultante)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Fecha
                            </label>
                            <p className="text-sm">{formatDate(movimiento.fecha)}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Hora Registro
                            </label>
                            <p className="text-sm">{movimiento.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Descripción
                        </label>
                        <p className="text-sm font-medium">{movimiento.descripcion}</p>
                    </div>

                    {movimiento.metodoPago && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <CreditCard className="h-3 w-3" /> Método de Pago
                            </label>
                            <p className="text-sm">{movimiento.metodoPago}</p>
                        </div>
                    )}

                    {movimiento.nota && (
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" /> Comentarios / Notas
                            </label>
                            <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap">
                                {movimiento.nota}
                            </div>
                        </div>
                    )}

                    <div className="pt-2 border-t mt-2">
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> Registrado por usuario:
                            </span>
                            <span>{movimiento.id.slice(0, 8)}...</span>
                            {/* In real app we might want to fetch user name, but we only have ID in movimiento struct currently unless we join */}
                        </div>
                    </div>

                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose}>Cerrar</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
