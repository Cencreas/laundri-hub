import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const testConnection = async () => {
    try {
      console.log('🔍 Testando conexão com Supabase...');
      
      // Testar conexão básica
      const { data: connectionTest, error: connectionError } = await supabase
        .from('clientes')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        console.error('❌ Erro de conexão:', connectionError);
        throw connectionError;
      }

      // Verificar autenticação
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ Erro de autenticação:', authError);
        throw authError;
      }

      console.log('✅ Conexão com Supabase OK');
      console.log('👤 Usuário autenticado:', currentUser?.id);
      
      setIsConnected(true);
      setUser(currentUser);
      
      return { success: true, user: currentUser };
    } catch (error: any) {
      console.error('❌ Falha na conexão com Supabase:', error);
      setIsConnected(false);
      setUser(null);
      
      toast({
        title: "Erro de Conexão",
        description: error.message || 'Falha ao conectar com o banco de dados',
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ Erro ao verificar usuário:', error);
        throw error;
      }

      console.log('🔍 Status de autenticação:', user ? 'Autenticado' : 'Não autenticado');
      setUser(user);
      return user;
    } catch (error: any) {
      console.error('❌ Erro ao verificar autenticação:', error);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    testConnection();
    
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id || 'no user');
        setUser(session?.user || null);
        
        if (event === 'SIGNED_IN') {
          setIsConnected(true);
          toast({
            title: "Conectado",
            description: "Usuário autenticado com sucesso.",
          });
        } else if (event === 'SIGNED_OUT') {
          setIsConnected(false);
          toast({
            title: "Desconectado",
            description: "Usuário deslogado.",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return {
    isConnected,
    user,
    loading,
    testConnection,
    checkAuthStatus,
    retryConnection: testConnection,
  };
}