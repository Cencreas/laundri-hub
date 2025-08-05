import { useState } from 'react';
import { useSupabaseStatus } from '@/hooks/useSupabaseStatus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, RefreshCw, Database, User, Wifi } from 'lucide-react';

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, user, loading, retryConnection } = useSupabaseStatus();

  // Só mostrar em desenvolvimento
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <Database className="h-4 w-4" />
            Debug
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Status da Conexão */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  <span className="text-sm">Conexão Supabase:</span>
                </div>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {loading ? "Testando..." : isConnected ? "Conectado" : "Desconectado"}
                </Badge>
              </div>

              {/* Status do Usuário */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Usuário:</span>
                </div>
                <Badge variant={user ? "default" : "outline"}>
                  {user ? "Autenticado" : "Não autenticado"}
                </Badge>
              </div>

              {/* ID do Usuário */}
              {user && (
                <div className="text-xs text-muted-foreground">
                  <strong>ID:</strong> {user.id?.slice(0, 8)}...
                </div>
              )}

              {/* Email do Usuário */}
              {user?.email && (
                <div className="text-xs text-muted-foreground">
                  <strong>Email:</strong> {user.email}
                </div>
              )}

              {/* Botão de Retry */}
              <Button 
                onClick={retryConnection}
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Testar Conexão
              </Button>

              {/* Instruções */}
              <div className="text-xs text-muted-foreground border-t pt-2">
                <p><strong>Console:</strong> Abra as DevTools (F12) para ver logs detalhados das operações.</p>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}