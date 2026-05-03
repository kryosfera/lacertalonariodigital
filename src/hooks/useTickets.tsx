import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TicketRow = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];
type TicketMessageRow = Database['public']['Tables']['ticket_messages']['Row'];
type TicketCategory = Database['public']['Enums']['ticket_category'];
type TicketPriority = Database['public']['Enums']['ticket_priority'];
type TicketStatus = Database['public']['Enums']['ticket_status'];

export type Ticket = TicketRow;
export type TicketMessage = TicketMessageRow;
export type TicketFilters = {
  search?: string;
  status?: TicketStatus | 'all';
  category?: TicketCategory | 'all';
  priority?: TicketPriority | 'all';
};

const TICKETS_STALE_TIME = 30_000;

const applyTicketFilters = (tickets: Ticket[], filters?: TicketFilters) => {
  if (!filters) return tickets;

  const search = filters.search?.trim().toLowerCase();

  return tickets.filter((ticket) => {
    const matchesSearch = !search
      || ticket.title.toLowerCase().includes(search)
      || ticket.description.toLowerCase().includes(search);
    const matchesStatus = !filters.status || filters.status === 'all' || ticket.status === filters.status;
    const matchesCategory = !filters.category || filters.category === 'all' || ticket.category === filters.category;
    const matchesPriority = !filters.priority || filters.priority === 'all' || ticket.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });
};

export function useTickets(filters?: TicketFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tickets', 'mine', user?.id, filters],
    queryFn: async () => {
      if (!user) return [] as Ticket[];

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return applyTicketFilters((data ?? []) as Ticket[], filters);
    },
    enabled: !!user,
    staleTime: TICKETS_STALE_TIME,
  });
}

export function useAdminTickets(filters?: TicketFilters) {
  const { user, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['tickets', 'admin', user?.id, filters],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return applyTicketFilters((data ?? []) as Ticket[], filters);
    },
    enabled: !!user && isAdmin,
    staleTime: TICKETS_STALE_TIME,
  });
}

export function useTicketMessages(ticketId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: async () => {
      if (!ticketId) return [] as TicketMessage[];

      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as TicketMessage[];
    },
    enabled: !!user && !!ticketId,
    staleTime: TICKETS_STALE_TIME,
  });
}

export function useOpenTicketsCount() {
  const { user, isAdmin } = useAuth();

  return useQuery({
    queryKey: ['tickets', 'open-count', user?.id, isAdmin],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user && isAdmin,
    staleTime: TICKETS_STALE_TIME,
  });
}

export function useCreateTicket() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Omit<TicketInsert, 'user_id'>) => {
      if (!user) throw new Error('Debes iniciar sesión');

      const { data, error } = await supabase
        .from('tickets')
        .insert({ ...payload, user_id: user.id })
        .select('*')
        .single();

      if (error) throw error;
      return data as Ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Incidencia enviada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'No se pudo crear la incidencia');
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: TicketUpdate }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(values)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data as Ticket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'No se pudo actualizar la incidencia');
    },
  });
}

export function useCreateTicketMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      if (!user) throw new Error('Debes iniciar sesión');

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          message,
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as TicketMessage;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'No se pudo enviar el mensaje');
    },
  });
}

export function useUploadTicketAttachment() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('Debes iniciar sesión');

      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const safeBaseName = file.name
        .replace(/\.[^.]+$/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .slice(0, 60) || 'captura';
      const path = `${user.id}/${Date.now()}-${safeBaseName}.${ext}`;

      const { error } = await supabase.storage
        .from('ticket-attachments')
        .upload(path, file, {
          upsert: false,
          cacheControl: '3600',
          contentType: file.type,
        });

      if (error) throw error;
      return path;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'No se pudo subir la captura');
    },
  });
}

export function useTicketAttachmentUrl(path?: string | null) {
  return useQuery({
    queryKey: ['ticket-attachment', path],
    queryFn: async () => {
      if (!path) return null;

      const { data, error } = await supabase.storage
        .from('ticket-attachments')
        .createSignedUrl(path, 60 * 30);

      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!path,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTicketsRealtime() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`tickets-realtime-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ticket_messages' },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
          const ticketId = (payload.new as { ticket_id?: string } | null)?.ticket_id
            || (payload.old as { ticket_id?: string } | null)?.ticket_id;
          if (ticketId) {
            queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] });
          } else {
            queryClient.invalidateQueries({ queryKey: ['ticket-messages'] });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, user]);
}
