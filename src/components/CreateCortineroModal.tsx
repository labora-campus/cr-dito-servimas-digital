import { useState } from 'react';
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

const formSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    zona: z.string().min(2, 'La zona debe tener al menos 2 caracteres'),
    telefono: z.string().optional(),
    limiteCredito: z.string().refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
        message: 'El límite debe ser un número positivo',
    }),
});

interface CreateCortineroModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { nombre: string; zona: string; telefono?: string; limiteCredito: number }) => Promise<void>;
}

export function CreateCortineroModal({ isOpen, onClose, onSubmit }: CreateCortineroModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: '',
            zona: '',
            telefono: '',
            limiteCredito: '0',
        },
    });

    const handleSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setIsSubmitting(true);
            await onSubmit({
                nombre: values.nombre,
                zona: values.zona,
                telefono: values.telefono || undefined,
                limiteCredito: Number(values.limiteCredito),
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Cortinero</DialogTitle>
                    <DialogDescription>
                        Ingresa los datos del nuevo cortinero para registrarlo en el sistema.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="nombre"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Juan Pérez" {...field} />
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
                                    <FormLabel>Zona / Barrio</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Centro" {...field} />
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
                                    <FormLabel>Teléfono (Opcional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: 0981..." {...field} />
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
                                        <Input type="number" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
