
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TimeEntry {
  id: string;
  user_id: string;
  task_id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeEntryData {
  task_id: string;
  start_time: string;
}

export const useTimeEntries = () => {
  return useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) {
        toast.error('Failed to fetch time entries');
        throw error;
      }

      return data as TimeEntry[];
    }
  });
};

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryData: CreateTimeEntryData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          ...entryData,
          user_id: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast.success('Timer started!');
    },
    onError: (error) => {
      toast.error('Failed to start timer');
      console.error('Create time entry error:', error);
    }
  });
};

export const useStopTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, duration }: { id: string; duration: number }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          duration,
          is_active: false
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast.success('Timer stopped!');
    },
    onError: (error) => {
      toast.error('Failed to stop timer');
      console.error('Stop time entry error:', error);
    }
  });
};
