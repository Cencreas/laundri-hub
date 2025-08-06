import { useState } from "react";
import { Search, Trash2, ShirtIcon, Edit } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { useOrdemServico } from "@/hooks/useOrdemServico";
import { NovaOrdemDialog } from "@/components/dialogs/NovaOrdemDialog";
import { EditarStatusDialog } from "@/components/dialogs/EditarStatusDialog";

const OrdemServicoPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "todos">("todos");
  const [deleteOrdemId, setDeleteOrdemId] = useState<string | null>(null);
  const { ordens, loading, deleteOrdem, refetch } = useOrdemServico();

  const handleDeleteOrdem = async (id: string) => {
    try {
      await deleteOrdem(id);
      setDeleteOrdemId(null);
      refetch();
    } catch (error) {
      console.error("Erro ao deletar ordem:", error);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const filteredOrdens = ordens.filter(ordem => {
    const matchesSearch = 
      ordem.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.clientes.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.tipo_roupa.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "todos" || ordem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusLabels: Record<string, string> = {
      recebido: "Recebido",
      em_processo: "Em Processo",
      pronto: "Pronto",
      entregue: "Entregue",
      cancelado: "Cancelado"
    };
    
    const statusColors: Record<string, string> = {
      recebido: "bg-blue-100 text-blue-800",
      em_processo: "bg-yellow-100 text-yellow-800",
      pronto: "bg-green-100 text-green-800",
      entregue: "bg-gray-100 text-gray-800",
      cancelado: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge variant="secondary" className={statusColors[status] || "bg-gray-100 text-gray-800"}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ordens de Serviço</h1>
            <p className="text-muted-foreground">Gerir todas as ordens de serviço</p>
          </div>
          <NovaOrdemDialog />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar por ID, cliente ou tipo de roupa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="recebido">Recebido</SelectItem>
                <SelectItem value="em_processo">Em Processo</SelectItem>
                <SelectItem value="pronto">Pronto</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { status: "recebido", label: "Recebido" },
            { status: "em_processo", label: "Em Processo" },
            { status: "pronto", label: "Pronto" },
            { status: "entregue", label: "Entregue" },
            { status: "cancelado", label: "Cancelado" }
          ].map(({ status, label }) => {
            const count = ordens.filter(o => o.status === status).length;
            return (
              <Card key={status}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ordens List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Ordens</CardTitle>
            <CardDescription>
              {filteredOrdens.length} ordem(ns) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrdens.map((ordem) => (
                <div
                  key={ordem.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                      <ShirtIcon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{ordem.id}</h3>
                        {getStatusBadge(ordem.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">Cliente: {ordem.clientes.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {ordem.tipo_roupa} - {ordem.tipo_servico}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {ordem.quantidade} | Preço: {ordem.preco_unitario} MT/unidade
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Entrega prevista: {new Date(ordem.data_entrega_prevista).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between lg:justify-end gap-4 mt-4 lg:mt-0">
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{ordem.total} MT</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                    <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                      <EditarStatusDialog ordem={ordem}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </EditarStatusDialog>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteOrdemId(ordem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredOrdens.length === 0 && (
                <div className="text-center py-8">
                  <ShirtIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma ordem encontrada</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteOrdemId} onOpenChange={() => setDeleteOrdemId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteOrdemId && handleDeleteOrdem(deleteOrdemId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default OrdemServicoPage;