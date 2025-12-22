import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { Cortinero } from '@/types/cortinero';

const formSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    zona: z.string().min(2, 'La zona es requerida'),
    telefono: z.string().optional(),
    foto: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
    limiteCredito: z.string().refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
        message: 'El límite debe ser un número positivo',
    }),
});

interface EditCortineroModalProps {
    isOpen: boolean;
    onClose: () => void;
    cortinero: Cortinero;
    onSubmit: (data: any) => Promise<void>;
}

export function EditCortineroModal({ isOpen, onClose, cortinero, onSubmit }: EditCortineroModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: '',
            zona: '',
            telefono: '',
            foto: '',
            limiteCredito: '0',
        },
    });

    useEffect(() => {
        if (cortinero) {
            form.reset({
                nombre: cortinero.nombre,
                zona: cortinero.zona,
                telefono: cortinero.telefono || '',
                foto: cortinero.foto,
                limiteCredito: cortinero.limiteCredito.toString(),
            });
        }
    }, [cortinero, form]);

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            await onSubmit({
                ...values,
                limiteCredito: Number(values.limiteCredito),
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Perfil</DialogTitle>
                    <DialogDescription>
                        Actualiza la información del cortinero.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="zona"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zona</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="telefono"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="foto"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL de Foto</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="limiteCredito"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Límite de Crédito</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
