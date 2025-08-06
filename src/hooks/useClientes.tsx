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
      
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao buscar clientes');
        throw new Error('Usuário não autenticado');
      }
      
      console.log('📥 Buscando clientes para usuário:', user.id);
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar clientes:', error);
        throw error;
      }
      
      console.log('✅ Clientes carregados:', data?.length || 0);
      setClientes(data || []);
    } catch (error: any) {
      console.error('❌ Erro completo ao carregar clientes:', error);
      toast({
        title: "Erro ao carregar clientes",
        description: error.message || 'Erro desconhecido ao carregar dados',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCliente = async (cliente: Omit<Cliente, 'id' | 'created_at'>) => {
    try {
      // Verificar autenticação antes de criar
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao criar cliente');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('➕ Criando cliente para usuário:', user.id, cliente);

      // Validar dados obrigatórios
      if (!cliente.nome?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      if (!cliente.contacto?.trim()) {
        throw new Error('Contacto é obrigatório');
      }
      if (!cliente.endereco?.trim()) {
        throw new Error('Endereço é obrigatório');
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert([{
          ...cliente,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase ao criar cliente:', error);
        throw error;
      }

      console.log('✅ Cliente criado com sucesso:', data);
      // Atualizar cache imediatamente para melhor UX
      setClientes(prev => [data, ...prev]);
      toast({
        title: "Cliente criado",
        description: "Cliente adicionado com sucesso.",
      });
      // Força uma nova busca para garantir sincronização
      setTimeout(() => fetchClientes(), 500);
      return data;
    } catch (error: any) {
      console.error('❌ Erro completo ao criar cliente:', error);
      toast({
        title: "Erro ao criar cliente",
        description: error.message || 'Erro desconhecido ao criar cliente',
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao atualizar cliente');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('📝 Atualizando cliente:', id, updates);

      // Validar dados se fornecidos
      if (updates.nome !== undefined && !updates.nome?.trim()) {
        throw new Error('Nome não pode estar vazio');
      }
      if (updates.contacto !== undefined && !updates.contacto?.trim()) {
        throw new Error('Contacto não pode estar vazio');
      }
      if (updates.endereco !== undefined && !updates.endereco?.trim()) {
        throw new Error('Endereço não pode estar vazio');
      }

      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro Supabase ao atualizar cliente:', error);
        throw error;
      }

      console.log('✅ Cliente atualizado com sucesso:', data);
      setClientes(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Cliente atualizado",
        description: "Informações do cliente atualizadas com sucesso.",
      });
      return data;
    } catch (error: any) {
      console.error('❌ Erro completo ao atualizar cliente:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message || 'Erro desconhecido ao atualizar cliente',
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('🔐 Usuário não autenticado ao deletar cliente');
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }

      console.log('🗑️ Deletando cliente:', id);

      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro Supabase ao deletar cliente:', error);
        throw error;
      }

      console.log('✅ Cliente deletado com sucesso:', id);
      setClientes(prev => prev.filter(c => c.id !== id));
      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso.",
      });
    } catch (error: any) {
      console.error('❌ Erro completo ao deletar cliente:', error);
      toast({
        title: "Erro ao remover cliente",
        description: error.message || 'Erro desconhecido ao remover cliente',
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