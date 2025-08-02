import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Cliente {
  id: string;
  nome: string;
  contacto: string;
  endereco: string;
  documento?: string;
  created_at: string;
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar clientes",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (cliente: Omit<Cliente, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          ...cliente,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setClientes(prev => [data, ...prev]);
      toast({
        title: "Cliente criado",
        description: "Cliente adicionado com sucesso.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setClientes(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Cliente atualizado",
        description: "Informações do cliente atualizadas com sucesso.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setClientes(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  return {
    clientes,
    loading,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes,
  };
}