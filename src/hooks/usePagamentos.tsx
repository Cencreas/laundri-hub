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
      
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao buscar pagamentos');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('📥 Buscando pagamentos para usuário:', user.id);
      
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

      if (error) {
        console.error('❌ Erro ao buscar pagamentos:', error);
        throw error;
      }
      
      console.log('✅ Pagamentos carregados:', data?.length || 0);
      setPagamentos(data || []);
    } catch (error: any) {
      console.error('❌ Erro completo ao carregar pagamentos:', error);
      toast({
        title: "Erro ao carregar pagamentos",
        description: error.message || 'Erro desconhecido ao carregar dados',
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
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao criar pagamento');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('➕ Criando pagamento para usuário:', user.id, pagamento);

      // Validar dados obrigatórios
      if (!pagamento.ordem_id) {
        throw new Error('Ordem é obrigatória');
      }
      if (pagamento.valor_pago <= 0) {
        throw new Error('Valor do pagamento deve ser maior que zero');
      }
      if (!pagamento.forma_pagamento) {
        throw new Error('Forma de pagamento é obrigatória');
      }

      const { data, error } = await supabase
        .from('pagamentos')
        .insert({
          id: `PAG-${Date.now()}`,
          ordem_id: pagamento.ordem_id,
          valor_pago: pagamento.valor_pago,
          forma_pagamento: pagamento.forma_pagamento as any,
          data_pagamento: pagamento.data_pagamento,
          observacoes: pagamento.observacoes,
          user_id: user.id
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

      if (error) {
        console.error('❌ Erro Supabase ao criar pagamento:', error);
        throw error;
      }

      console.log('✅ Pagamento criado com sucesso:', data);
      setPagamentos(prev => [data, ...prev]);
      toast({
        title: "Pagamento registrado",
        description: "Pagamento registrado com sucesso.",
      });
      return data;
    } catch (error: any) {
      console.error('❌ Erro completo ao criar pagamento:', error);
      toast({
        title: "Erro ao registrar pagamento",
        description: error.message || 'Erro desconhecido ao registrar pagamento',
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
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao atualizar pagamento');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('📝 Atualizando pagamento:', id, updates);

      // Validar dados se fornecidos
      if (updates.valor_pago !== undefined && updates.valor_pago <= 0) {
        throw new Error('Valor do pagamento deve ser maior que zero');
      }

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

      if (error) {
        console.error('❌ Erro Supabase ao atualizar pagamento:', error);
        throw error;
      }

      console.log('✅ Pagamento atualizado com sucesso:', data);
      setPagamentos(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Pagamento atualizado",
        description: "Pagamento atualizado com sucesso.",
      });
      return data;
    } catch (error: any) {
      console.error('❌ Erro completo ao atualizar pagamento:', error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: error.message || 'Erro desconhecido ao atualizar pagamento',
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePagamento = async (id: string) => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao deletar pagamento');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('🗑️ Deletando pagamento:', id);

      const { error } = await supabase
        .from('pagamentos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro Supabase ao deletar pagamento:', error);
        throw error;
      }

      console.log('✅ Pagamento deletado com sucesso:', id);
      setPagamentos(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Pagamento removido",
        description: "Pagamento removido com sucesso.",
      });
    } catch (error: any) {
      console.error('❌ Erro completo ao deletar pagamento:', error);
      toast({
        title: "Erro ao remover pagamento",
        description: error.message || 'Erro desconhecido ao remover pagamento',
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