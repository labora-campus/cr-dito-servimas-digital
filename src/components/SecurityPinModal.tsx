import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface SecurityPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CORRECT_PIN = '1007';

export function SecurityPinModal({ isOpen, onClose, onSuccess }: SecurityPinModalProps) {
    const [pin, setPin] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === CORRECT_PIN) {
            setPin('');
            onSuccess();
            onClose();
        } else {
            toast({
                title: 'PIN Incorrecto',
                description: 'El código de seguridad no es válido.',
                variant: 'destructive',
            });
            setPin('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Control de Seguridad
                    </DialogTitle>
                    <DialogDescription>
                        Ingrese el PIN para autorizar la edición.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <Input
                        type="password"
                        placeholder="****"
                        className="text-center text-2xl tracking-widest"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        autoFocus
                    />

                    <DialogFooter>
                        <Button type="submit" className="w-full">
                            Verificar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
