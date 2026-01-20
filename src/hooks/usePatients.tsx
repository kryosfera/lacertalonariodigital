import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  recipe_count?: number;
  last_recipe_date?: string | null;
}

export interface CreatePatientData {
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface UpdatePatientData {
  name?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export function usePatients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async (): Promise<Patient[]> => {
      if (!user) return [];

      // Fetch patients
      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;

      // Fetch recipe counts and last recipe date for each patient
      const patientsWithStats = await Promise.all(
        (patients || []).map(async (patient) => {
          const { count } = await supabase
            .from('recipes')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', patient.id);

          const { data: lastRecipe } = await supabase
            .from('recipes')
            .select('created_at')
            .eq('patient_id', patient.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          return {
            ...patient,
            recipe_count: count || 0,
            last_recipe_date: lastRecipe?.created_at || null
          };
        })
      );

      return patientsWithStats;
    },
    enabled: !!user
  });
}

export function useCreatePatient() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientData) => {
      if (!user) throw new Error('User not authenticated');

      const { data: patient, error } = await supabase
        .from('patients')
        .insert({
          user_id: user.id,
          name: data.name,
          phone: data.phone || null,
          email: data.email || null,
          notes: data.notes || null
        })
        .select()
        .single();

      if (error) throw error;
      return patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating patient:', error);
      toast.error('Error al crear el paciente');
    }
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePatientData }) => {
      const { data: patient, error } = await supabase
        .from('patients')
        .update({
          name: data.name,
          phone: data.phone,
          email: data.email,
          notes: data.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
      toast.error('Error al actualizar el paciente');
    }
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting patient:', error);
      toast.error('Error al eliminar el paciente');
    }
  });
}
