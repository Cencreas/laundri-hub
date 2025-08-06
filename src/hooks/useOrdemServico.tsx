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
      
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao buscar ordens');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('📥 Buscando ordens para usuário:', user.id);
      
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

      if (error) {
        console.error('❌ Erro ao buscar ordens:', error);
        throw error;
      }
      
      console.log('✅ Ordens carregadas:', data?.length || 0);
      setOrdens(data || []);
    } catch (error: any) {
      console.error('❌ Erro completo ao carregar ordens:', error);
      toast({
        title: "Erro ao carregar ordens",
        description: error.message || 'Erro desconhecido ao carregar dados',
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
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao criar ordem');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('➕ Criando ordem para usuário:', user.id, ordem);

      // Validar dados obrigatórios
      if (!ordem.cliente_id) {
        throw new Error('Cliente é obrigatório');
      }
      if (!ordem.tipo_servico) {
        throw new Error('Tipo de serviço é obrigatório');
      }
      if (!ordem.tipo_roupa?.trim()) {
        throw new Error('Tipo de roupa é obrigatório');
      }
      if (ordem.quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      if (ordem.preco_unitario <= 0) {
        throw new Error('Preço unitário deve ser maior que zero');
      }

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
          user_id: user.id
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

      if (error) {
        console.error('❌ Erro Supabase ao criar ordem:', error);
        throw error;
      }

      console.log('✅ Ordem criada com sucesso:', data);
      // Atualizar cache imediatamente para melhor UX
      setOrdens(prev => [data, ...prev]);
      toast({
        title: "Ordem criada",
        description: "Ordem de serviço criada com sucesso.",
      });
      // Força uma nova busca para garantir sincronização
      setTimeout(() => fetchOrdens(), 500);
      return data;
    } catch (error: any) {
      console.error('❌ Erro completo ao criar ordem:', error);
      toast({
        title: "Erro ao criar ordem",
        description: error.message || 'Erro desconhecido ao criar ordem',
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
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao atualizar ordem');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('📝 Atualizando ordem:', id, updates);

      // Validar dados se fornecidos
      if (updates.quantidade !== undefined && updates.quantidade <= 0) {
        throw new Error('Quantidade deve ser maior que zero');
      }
      if (updates.preco_unitario !== undefined && updates.preco_unitario <= 0) {
        throw new Error('Preço unitário deve ser maior que zero');
      }

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

      if (error) {
        console.error('❌ Erro Supabase ao atualizar ordem:', error);
        throw error;
      }

      console.log('✅ Ordem atualizada com sucesso:', data);
      setOrdens(prev => prev.map(o => o.id === id ? data : o));
      toast({
        title: "Ordem atualizada",
        description: "Ordem de serviço atualizada com sucesso.",
      });
      return data;
    } catch (error: any) {
      console.error('❌ Erro completo ao atualizar ordem:', error);
      toast({
        title: "Erro ao atualizar ordem",
        description: error.message || 'Erro desconhecido ao atualizar ordem',
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteOrdem = async (id: string) => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao deletar ordem');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('🗑️ Deletando ordem:', id);

      const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro Supabase ao deletar ordem:', error);
        throw error;
      }

      console.log('✅ Ordem deletada com sucesso:', id);
      setOrdens(prev => prev.filter(o => o.id !== id));
      toast({
        title: "Ordem removida",
        description: "Ordem de serviço removida com sucesso.",
      });
    } catch (error: any) {
      console.error('❌ Erro completo ao deletar ordem:', error);
      toast({
        title: "Erro ao remover ordem",
        description: error.message || 'Erro desconhecido ao remover ordem',
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