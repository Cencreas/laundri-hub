import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pagamento {
  id: string;
  ordem_id: string;
  user_id: string;
  valor_pago: number;
  forma_pagamento: string;
  data_pagamento: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface PagamentoWithOrdem extends Pagamento {
  ordens_servico: {
    id: string;
    tipo_roupa: string;
    quantidade: number;
    total: number;
    clientes: {
      id: string;
      nome: string;
      contacto: string;
    };
  };
}

export function usePagamentos() {
  const [pagamentos, setPagamentos] = useState<PagamentoWithOrdem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          ordens_servico!ordem_id (
            id,
            tipo_roupa,
            quantidade,
            total,
            clientes!cliente_id (
              id,
              nome,
              contacto
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPagamentos(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar pagamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPagamento = async (pagamento: {
    ordem_id: string;
    valor_pago: number;
    forma_pagamento: string;
    data_pagamento: string;
    observacoes?: string;
  }) => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { data, error } = await supabase
        .from('pagamentos')
        .insert({
          id: `PAG-${Date.now()}`,
          ordem_id: pagamento.ordem_id,
          valor_pago: pagamento.valor_pago,
          forma_pagamento: pagamento.forma_pagamento as any,
          data_pagamento: pagamento.data_pagamento,
          observacoes: pagamento.observacoes,
          user_id: userId
        })
        .select(`
          *,
          ordens_servico!ordem_id (
            id,
            tipo_roupa,
            quantidade,
            total,
            clientes!cliente_id (
              id,
              nome,
              contacto
            )
          )
        `)
        .single();

      if (error) throw error;

      setPagamentos(prev => [data, ...prev]);
      toast({
        title: "Pagamento registrado",
        description: "Pagamento registrado com sucesso.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePagamento = async (id: string, updates: {
    ordem_id?: string;
    valor_pago?: number;
    forma_pagamento?: string;
    data_pagamento?: string;
    observacoes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .update(updates as any)
        .eq('id', id)
        .select(`
          *,
          ordens_servico!ordem_id (
            id,
            tipo_roupa,
            quantidade,
            total,
            clientes!cliente_id (
              id,
              nome,
              contacto
            )
          )
        `)
        .single();

      if (error) throw error;

      setPagamentos(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Pagamento atualizado",
        description: "Pagamento atualizado com sucesso.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar pagamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePagamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pagamentos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPagamentos(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Pagamento removido",
        description: "Pagamento removido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover pagamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPagamentos();
  }, []);

  return {
    pagamentos,
    loading,
    createPagamento,
    updatePagamento,
    deletePagamento,
    refetch: fetchPagamentos,
  };
}