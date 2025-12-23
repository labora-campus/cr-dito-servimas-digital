import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const formSchema = z.object({
    destinatario: z.enum(['servimas', 'cortinero'], {
        required_error: "Debes seleccionar quién recibió el dinero",
    }),
    monto: z.string().refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
        message: 'El monto debe ser mayor a 0',
    }),
    nroFactura: z.string().min(1, 'El número de factura es requerido'),
    razonSocial: z.string().min(2, 'La razón social es requerida'),
    neto: z.string().refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
        message: 'El neto debe ser un número válido',
    }),
    iva: z.string().refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
        message: 'El IVA debe ser un número válido',
    }),
    fecha: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
        message: 'Fecha inválida',
    }),
});

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        destinatario: 'servimas' | 'cortinero';
        monto: number;
        nroFactura: string;
        razonSocial: string;
        neto: number;
        iva: number;
        fecha: string;
    }) => Promise<void>;
}

export function BillingModal({ isOpen, onClose, onSubmit }: BillingModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            destinatario: 'servimas',
            monto: '',
            nroFactura: '',
            razonSocial: '',
            neto: '',
            iva: '',
            fecha: new Date().toISOString().split('T')[0],
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            await onSubmit({
                destinatario: values.destinatario,
                monto: Number(values.monto),
                nroFactura: values.nroFactura,
                razonSocial: values.razonSocial,
                neto: Number(values.neto),
                iva: Number(values.iva),
                fecha: values.fecha,
            });
            form.reset();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Facturar a Tercero</DialogTitle>
                    <DialogDescription>
                        Registra la factura y define quién recibió el dinero.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="destinatario"
                            render={({ field }) => (
                                <FormItem className="space-y-3">
                                    <FormLabel>¿Quién cobró el dinero?</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex flex-col space-y-1"
                                        >
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="servimas" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Cobró Servimas <span className="text-muted-foreground text-xs">(Se abona el NETO al cortinero)</span>
                                                </FormLabel>
                                            </FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value="cortinero" />
                                                </FormControl>
                                                <FormLabel className="font-normal">
                                                    Cobró el Cortinero <span className="text-muted-foreground text-xs">(Se le cobra el IVA al cortinero)</span>
                                                </FormLabel>
                                            </FormItem>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="monto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto Total Factura (Ingreso)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Ej: 1800000"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                const total = Number(e.target.value);
                                                if (!isNaN(total) && total > 0) {
                                                    const neto = Math.round(total / 1.21);
                                                    const iva = total - neto;
                                                    form.setValue('neto', neto.toString());
                                                    form.setValue('iva', iva.toString());
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nroFactura"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nº Factura</FormLabel>
                                        <FormControl>
                                            <Input placeholder="001-00001" {...field} />
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
                        </div>

                        <FormField
                            control={form.control}
                            name="razonSocial"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Razón Social (Cliente)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Empresa S.A." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="neto"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Neto</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="iva"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>IVA</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Registrar Factura
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
