import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddNoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (nota: string) => Promise<void>;
}

export function AddNoteModal({ isOpen, onClose, onSubmit }: AddNoteModalProps) {
    const [nota, setNota] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nota.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(nota);
            setNota('');
            onClose();
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'No se pudo guardar la nota', variant: 'destructive' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Agregar Nota</DialogTitle>
                    <DialogDescription>
                        Agrega un comentario al historial del cortinero.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <Textarea
                        placeholder="Escribe tu nota aquí..."
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                        rows={4}
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitting || !nota.trim()}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar Nota
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
