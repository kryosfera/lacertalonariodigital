import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [professionalName, setProfessionalName] = useState('');
  const [province, setProvince] = useState('');
  const [locality, setLocality] = useState('');

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: {
          action: 'create_user',
          email: email.trim(),
          password,
          clinic_name: clinicName.trim() || null,
          professional_name: professionalName.trim() || null,
          province: province.trim() || null,
          locality: locality.trim() || null,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Usuario creado', description: 'La cuenta queda confirmada y lista para iniciar sesión.' });
      qc.invalidateQueries({ queryKey: ['admin-profiles'] });
      qc.invalidateQueries({ queryKey: ['admin-user-emails'] });
      setEmail(''); setPassword(''); setClinicName(''); setProfessionalName(''); setProvince(''); setLocality('');
      onOpenChange(false);
    },
    onError: (e: Error) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 8;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear usuario sin email</DialogTitle>
          <DialogDescription>
            La cuenta se crea ya confirmada. No se envía email de verificación.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="cu-email">Email *</Label>
            <Input id="cu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </div>
          <div>
            <Label htmlFor="cu-pass">Contraseña inicial * (mín. 8)</Label>
            <Input id="cu-pass" type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Comparte esta contraseña con el usuario" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cu-clinic">Clínica</Label>
              <Input id="cu-clinic" value={clinicName} onChange={(e) => setClinicName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cu-prof">Profesional</Label>
              <Input id="cu-prof" value={professionalName} onChange={(e) => setProfessionalName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cu-prov">Provincia</Label>
              <Input id="cu-prov" value={province} onChange={(e) => setProvince(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="cu-loc">Localidad</Label>
              <Input id="cu-loc" value={locality} onChange={(e) => setLocality(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => create.mutate()} disabled={!valid || create.isPending}>
            {create.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Crear usuario
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
