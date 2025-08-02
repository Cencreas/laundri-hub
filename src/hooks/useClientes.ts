import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { mockClientes } from '@/data/mockData';

export interface Cliente {
  id: string;
  nome: string;
  contacto: string;
  endereco: string;
  documento?: string;
  created_at: string;
}

// Converter mock data para o formato esperado
const convertedMockClientes: Cliente[] = mockClientes.map(cliente => ({
  ...cliente,
  created_at: cliente.criadoEm.toISOString()
}));

export const useClientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>(convertedMockClientes);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCliente = async (cliente: Omit<Cliente, 'id' | 'created_at'>) => {
    try {
      const newCliente: Cliente = {
        ...cliente,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      };

      setClientes(prev => [newCliente, ...prev]);
      toast({
        title: "Cliente criado",
        description: "Cliente adicionado com sucesso.",
      });
      
      return { data: newCliente, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCliente = async (id: string, updates: Partial<Cliente>) => {
    try {
      const updatedCliente = { ...clientes.find(c => c.id === id), ...updates } as Cliente;

      setClientes(prev => 
        prev.map(cliente => cliente.id === id ? updatedCliente : cliente)
      );
      
      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente atualizados com sucesso.",
      });
      
      return { data: updatedCliente, error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCliente = async (id: string) => {
    try {
      setClientes(prev => prev.filter(cliente => cliente.id !== id));
      toast({
        title: "Cliente removido",
        description: "Cliente removido com sucesso.",
      });
      
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao remover cliente",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const fetchClientes = async () => {
    // Implementação temporária - será substituída quando as tabelas estiverem criadas
  };

  return {
    clientes,
    loading,
    createCliente,
    updateCliente,
    deleteCliente,
    refetch: fetchClientes,
  };
};