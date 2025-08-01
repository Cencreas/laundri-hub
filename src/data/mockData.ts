import { Cliente, OrdemServico, Pagamento, DashboardStats } from "@/types";

// Clientes simulados
export const mockClientes: Cliente[] = [
  {
    id: "1",
    nome: "Maria Silva",
    contacto: "+258 84 123 4567",
    endereco: "Rua da Liberdade, 123, Maputo",
    documento: "110000000001M",
    criadoEm: new Date("2024-01-15"),
  },
  {
    id: "2", 
    nome: "João Santos",
    contacto: "+258 85 987 6543",
    endereco: "Av. Julius Nyerere, 456, Maputo",
    documento: "110000000002M",
    criadoEm: new Date("2024-02-01"),
  },
  {
    id: "3",
    nome: "Ana Costa",
    contacto: "+258 86 555 0123",
    endereco: "Rua do Trabalho, 789, Matola",
    criadoEm: new Date("2024-02-15"),
  },
  {
    id: "4",
    nome: "Carlos Manjate",
    contacto: "+258 87 444 5678",
    endereco: "Av. Eduardo Mondlane, 321, Maputo",
    documento: "110000000003M",
    criadoEm: new Date("2024-03-01"),
  },
];

// Ordens de serviço simuladas
export const mockOrdens: OrdemServico[] = [
  {
    id: "OS001",
    clienteId: "1",
    cliente: mockClientes[0],
    tipoRoupa: "Camisas",
    tipoServico: "lavagem_engomagem",
    quantidade: 5,
    precoUnitario: 50,
    total: 250,
    dataEntregaPrevista: new Date("2024-08-05"),
    status: "pronto",
    criadoEm: new Date("2024-08-01"),
    observacoes: "Cliente preferencial",
  },
  {
    id: "OS002",
    clienteId: "2",
    cliente: mockClientes[1],
    tipoRoupa: "Calças",
    tipoServico: "lavagem_seco",
    quantidade: 3,
    precoUnitario: 80,
    total: 240,
    dataEntregaPrevista: new Date("2024-08-06"),
    status: "em_processo",
    criadoEm: new Date("2024-08-02"),
  },
  {
    id: "OS003",
    clienteId: "3",
    cliente: mockClientes[2],
    tipoRoupa: "Vestidos",
    tipoServico: "lavagem_especial",
    quantidade: 2,
    precoUnitario: 120,
    total: 240,
    dataEntregaPrevista: new Date("2024-08-07"),
    status: "recebido",
    criadoEm: new Date("2024-08-03"),
  },
  {
    id: "OS004",
    clienteId: "4",
    cliente: mockClientes[3],
    tipoRoupa: "Ternos",
    tipoServico: "lavagem_seco",
    quantidade: 1,
    precoUnitario: 200,
    total: 200,
    dataEntregaPrevista: new Date("2024-08-04"),
    status: "entregue",
    criadoEm: new Date("2024-07-30"),
  },
];

// Pagamentos simulados
export const mockPagamentos: Pagamento[] = [
  {
    id: "PAG001",
    ordemId: "OS001",
    ordem: mockOrdens[0],
    valorPago: 250,
    formaPagamento: "m_pesa",
    dataPagamento: new Date("2024-08-01"),
  },
  {
    id: "PAG002",
    ordemId: "OS004",
    ordem: mockOrdens[3],
    valorPago: 200,
    formaPagamento: "dinheiro",
    dataPagamento: new Date("2024-07-30"),
  },
];

// Estatísticas do dashboard
export const mockStats: DashboardStats = {
  totalClientes: mockClientes.length,
  ordensRecebidas: mockOrdens.filter(o => o.status === "recebido").length,
  ordensEmProcesso: mockOrdens.filter(o => o.status === "em_processo").length,
  ordensProntas: mockOrdens.filter(o => o.status === "pronto").length,
  ordensEntregues: mockOrdens.filter(o => o.status === "entregue").length,
  lucroMes: 450, // Soma dos pagamentos do mês atual
  lucroTotal: 450,
};

// Mapeamentos para exibição
export const tipoServicoLabels = {
  lavagem_simples: "Lavagem Simples",
  lavagem_seco: "Lavagem a Seco",
  engomagem: "Engomagem",
  lavagem_engomagem: "Lavagem + Engomagem",
  lavagem_especial: "Lavagem Especial",
};

export const statusLabels = {
  recebido: "Recebido",
  em_processo: "Em Processo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export const formaPagamentoLabels = {
  dinheiro: "Dinheiro",
  m_pesa: "M-Pesa",
  transferencia: "Transferência",
  cartao: "Cartão",
};

export const statusColors = {
  recebido: "bg-blue-100 text-blue-800",
  em_processo: "bg-yellow-100 text-yellow-800", 
  pronto: "bg-green-100 text-green-800",
  entregue: "bg-gray-100 text-gray-800",
  cancelado: "bg-red-100 text-red-800",
};