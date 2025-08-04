import { useState } from "react";
import { Search, CreditCard, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { usePagamentos } from "@/hooks/usePagamentos";
import { useOrdemServico } from "@/hooks/useOrdemServico";
import { NovoPagamentoDialog } from "@/components/dialogs/NovoPagamentoDialog";

const Pagamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { pagamentos, loading: loadingPagamentos } = usePagamentos();
  const { ordens, loading: loadingOrdens } = useOrdemServico();

  if (loadingPagamentos || loadingOrdens) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const filteredPagamentos = pagamentos.filter(pagamento =>
    pagamento.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pagamento.ordem_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pagamento.ordens_servico.clientes.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estatísticas
  const totalPago = pagamentos.reduce((sum, p) => sum + p.valor_pago, 0);
  const ordensPagas = pagamentos.length;
  const ordensPendentes = ordens.filter(ordem => 
    !pagamentos.some(p => p.ordem_id === ordem.id)
  ).length;
  const ordensAtrasadas = ordens.filter(ordem => 
    !pagamentos.some(p => p.ordem_id === ordem.id) && 
    new Date(ordem.data_entrega_prevista) < new Date()
  ).length;

  const getFormaPagamentoBadge = (forma: string) => {
    const formaPagamentoLabels: Record<string, string> = {
      dinheiro: "Dinheiro",
      m_pesa: "M-Pesa",
      transferencia: "Transferência",
      cartao: "Cartão"
    };
    
    const colors = {
      dinheiro: "bg-green-100 text-green-800",
      m_pesa: "bg-blue-100 text-blue-800", 
      transferencia: "bg-purple-100 text-purple-800",
      cartao: "bg-orange-100 text-orange-800",
    };
    
    return (
      <Badge variant="secondary" className={colors[forma as keyof typeof colors]}>
        {formaPagamentoLabels[forma] || forma}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pagamentos</h1>
            <p className="text-muted-foreground">Controlar todos os pagamentos e faturação</p>
          </div>
          <NovoPagamentoDialog />
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por ID do pagamento, ordem ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Recebido</p>
                  <p className="text-2xl font-bold text-foreground">{totalPago} MT</p>
                </div>
                <DollarSign className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ordens Pagas</p>
                  <p className="text-2xl font-bold text-foreground">{ordensPagas}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">{ordensPendentes}</p>
                </div>
                <Clock className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                  <p className="text-2xl font-bold text-foreground">{ordensAtrasadas}</p>
                </div>
                <CreditCard className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pagamentos List */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              {filteredPagamentos.length} pagamento(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPagamentos.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-success text-success-foreground rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{pagamento.id}</h3>
                        {getFormaPagamentoBadge(pagamento.forma_pagamento)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ordem: {pagamento.ordem_id} - {pagamento.ordens_servico.clientes.nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Data: {new Date(pagamento.data_pagamento).toLocaleDateString('pt-BR')}
                      </p>
                      {pagamento.observacoes && (
                        <p className="text-sm text-muted-foreground">
                          Obs: {pagamento.observacoes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-4 mt-4 lg:mt-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-success">{pagamento.valor_pago} MT</p>
                      <p className="text-sm text-muted-foreground">Valor Pago</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredPagamentos.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ordens Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle>Ordens Pendentes de Pagamento</CardTitle>
            <CardDescription>
              Ordens que ainda não foram pagas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {ordens
                .filter(ordem => !pagamentos.some(p => p.ordem_id === ordem.id))
                .map((ordem) => (
                <div
                  key={ordem.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-warning text-warning-foreground rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{ordem.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {ordem.clientes.nome}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ordem.tipo_roupa} - Quantidade: {ordem.quantidade}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-4 mt-4 lg:mt-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-warning">{ordem.total} MT</p>
                      <p className="text-sm text-muted-foreground">A Receber</p>
                    </div>
                    <NovoPagamentoDialog ordemId={ordem.id}>
                      <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground">
                        Registrar Pagamento
                      </Button>
                    </NovoPagamentoDialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Pagamentos;