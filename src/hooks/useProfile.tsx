import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  clinic_name: string | null;
  clinic_address: string | null;
  professional_name: string | null;
  registration_number: string | null;
  signature_url: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  clinic_name?: string;
  clinic_address?: string;
  professional_name?: string;
  registration_number?: string;
  signature_url?: string;
  logo_url?: string;
}

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });
}

export function useUpsertProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      if (!user) throw new Error('User not authenticated');

      // Check if profile exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update
        const { data: profile, error } = await supabase
          .from('profiles')
          .update(data)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return profile;
      } else {
        // Insert
        const { data: profile, error } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            ...data
          })
          .select()
          .single();

        if (error) throw error;
        return profile;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Perfil actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Error al actualizar el perfil');
    }
  });
}

export function useUploadProfileImage() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'logo' | 'signature' }) => {
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;
      
      // First, we need to create a bucket or use an existing one
      // For now, we'll store in the recomendaciones bucket which is public
      const { data, error } = await supabase.storage
        .from('recomendaciones')
        .upload(`profiles/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('recomendaciones')
        .getPublicUrl(`profiles/${fileName}`);

      return urlData.publicUrl;
    },
    onError: (error) => {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    }
  });
}
