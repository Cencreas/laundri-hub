import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShirtIcon, CheckCircle, Clock, DollarSign, TrendingUp } from "lucide-react";
import { mockStats, mockOrdens, mockClientes } from "@/data/mockData";
import { Layout } from "@/components/layout/Layout";

const Dashboard = () => {
  const stats = [
    {
      title: "Total de Clientes",
      value: mockStats.totalClientes,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ordens Recebidas",
      value: mockStats.ordensRecebidas,
      icon: ShirtIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Em Processo",
      value: mockStats.ordensEmProcesso,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Prontas",
      value: mockStats.ordensProntas,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Entregues",
      value: mockStats.ordensEntregues,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Lucro do Mês",
      value: `${mockStats.lucroMes} MT`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const ordensRecentes = mockOrdens.slice(0, 3);
  const topClientes = mockClientes.slice(0, 3);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de gestão da lavandaria</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-medium transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ordens Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Ordens Recentes</CardTitle>
              <CardDescription>Últimas ordens de serviço registradas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ordensRecentes.map((ordem) => (
                  <div key={ordem.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{ordem.id}</p>
                      <p className="text-sm text-muted-foreground">{ordem.cliente.nome}</p>
                      <p className="text-sm text-muted-foreground">{ordem.tipoRoupa}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">{ordem.total} MT</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        ordem.status === 'recebido' ? 'bg-blue-100 text-blue-800' :
                        ordem.status === 'em_processo' ? 'bg-yellow-100 text-yellow-800' :
                        ordem.status === 'pronto' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {ordem.status === 'recebido' ? 'Recebido' :
                         ordem.status === 'em_processo' ? 'Em Processo' :
                         ordem.status === 'pronto' ? 'Pronto' : 'Entregue'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clientes</CardTitle>
              <CardDescription>Clientes com mais ordens de serviço</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClientes.map((cliente, index) => (
                  <div key={cliente.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                        {cliente.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">{cliente.contacto}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">#{index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;