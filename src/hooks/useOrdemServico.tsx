import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OrdemServico {
  id: string;
  cliente_id: string;
  user_id: string;
  tipo_servico: string;
  tipo_roupa: string;
  quantidade: number;
  preco_unitario: number;
  total: number;
  data_entrega_prevista: string;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrdemServicoWithCliente extends OrdemServico {
  clientes: {
    id: string;
    nome: string;
    contacto: string;
    endereco: string;
  };
}

export function useOrdemServico() {
  const [ordens, setOrdens] = useState<OrdemServicoWithCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrdens = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          *,
          clientes!cliente_id (
            id,
            nome,
            contacto,
            endereco
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrdens(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ordens",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrdem = async (ordem: {
    cliente_id: string;
    tipo_servico: string;
    tipo_roupa: string;
    quantidade: number;
    preco_unitario: number;
    total: number;
    data_entrega_prevista: string;
    status: string;
    observacoes?: string;
  }) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from('ordens_servico')
        .insert({
          id: `ORD-${Date.now()}`,
          cliente_id: ordem.cliente_id,
          tipo_servico: ordem.tipo_servico as any,
          tipo_roupa: ordem.tipo_roupa,
          quantidade: ordem.quantidade,
          preco_unitario: ordem.preco_unitario,
          total: ordem.total,
          data_entrega_prevista: ordem.data_entrega_prevista,
          status: ordem.status as any,
          observacoes: ordem.observacoes,
          user_id: userId
        })
        .select(`
          *,
          clientes!cliente_id (
            id,
            nome,
            contacto,
            endereco
          )
        `)
        .single();

      if (error) throw error;

      setOrdens(prev => [data, ...prev]);
      toast({
        title: "Ordem criada",
        description: "Ordem de serviço criada com sucesso.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao criar ordem",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateOrdem = async (id: string, updates: {
    cliente_id?: string;
    tipo_servico?: string;
    tipo_roupa?: string;
    quantidade?: number;
    preco_unitario?: number;
    total?: number;
    data_entrega_prevista?: string;
    status?: string;
    observacoes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('ordens_servico')
        .update(updates as any)
        .eq('id', id)
        .select(`
          *,
          clientes!cliente_id (
            id,
            nome,
            contacto,
            endereco
          )
        `)
        .single();

      if (error) throw error;

      setOrdens(prev => prev.map(o => o.id === id ? data : o));
      toast({
        title: "Ordem atualizada",
        description: "Ordem de serviço atualizada com sucesso.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar ordem",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOrdem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOrdens(prev => prev.filter(o => o.id !== id));
      toast({
        title: "Ordem removida",
        description: "Ordem de serviço removida com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover ordem",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchOrdens();
  }, []);

  return {
    ordens,
    loading,
    createOrdem,
    updateOrdem,
    deleteOrdem,
    refetch: fetchOrdens,
  };
}