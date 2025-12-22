import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Movimiento } from '@/types/cortinero';

const formSchema = z.object({
    monto: z.string().refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
        message: 'El monto debe ser mayor a 0',
    }),
    descripcion: z.string().optional(), // For deliveries or generic
    metodoPago: z.string().optional(), // For payments
    comentarios: z.string().optional(),
    fecha: z.string().min(1, 'La fecha es requerida'),
});

interface EditMovimientoModalProps {
    isOpen: boolean;
    onClose: () => void;
    movimiento: Movimiento | null;
    onSubmit: (id: string, data: { monto: number; descripcion?: string; metodoPago?: string; comentarios?: string; fecha: string }) => Promise<void>;
}

export function EditMovimientoModal({ isOpen, onClose, movimiento, onSubmit }: EditMovimientoModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            monto: '0',
            descripcion: '',
            metodoPago: 'efectivo',
            comentarios: '',
            fecha: new Date().toISOString().split('T')[0],
        },
    });

    useEffect(() => {
        if (movimiento) {
            form.reset({
                monto: movimiento.importe.toString(),
                descripcion: movimiento.descripcion || '',
                metodoPago: movimiento.metodoPago || 'efectivo',
                comentarios: movimiento.nota || '',
                fecha: movimiento.fecha.toISOString().split('T')[0],
            });
        }
    }, [movimiento, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!movimiento) return;
        try {
            setIsSubmitting(true);
            await onSubmit(movimiento.id, {
                monto: Number(values.monto),
                descripcion: values.descripcion,
                metodoPago: values.metodoPago,
                comentarios: values.comentarios,
                fecha: values.fecha,
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!movimiento) return null;

    const isPago = movimiento.tipo === 'pago';

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar {isPago ? 'Pago' : 'Movimiento'}</DialogTitle>
                    <DialogDescription>
                        Modifique los detalles del movimiento. ID: {movimiento.id.slice(0, 8)}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="monto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fecha"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {isPago ? (
                            // Fields specific to Payment
                            <>
                                <FormField
                                    control={form.control}
                                    name="metodoPago"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Método de Pago</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un método" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="efectivo">Efectivo</SelectItem>
                                                    <SelectItem value="transferencia">Transferencia</SelectItem>
                                                    <SelectItem value="cheque">Cheque</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="comentarios"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Comentarios</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Notas adicionales..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </>
                        ) : (
                            // Fields specific to Delivery/Other
                            <FormField
                                control={form.control}
                                name="descripcion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Detalle de la entrega" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
