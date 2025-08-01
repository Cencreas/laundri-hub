export interface Cliente {
  id: string;
  nome: string;
  contacto: string;
  endereco: string;
  documento?: string; // BI ou NUIT
  criadoEm: Date;
}

export interface OrdemServico {
  id: string;
  clienteId: string;
  cliente: Cliente;
  tipoRoupa: string;
  tipoServico: TipoServico;
  quantidade: number;
  precoUnitario: number;
  total: number;
  dataEntregaPrevista: Date;
  status: StatusOrdem;
  criadoEm: Date;
  observacoes?: string;
}

export interface Pagamento {
  id: string;
  ordemId: string;
  ordem: OrdemServico;
  valorPago: number;
  formaPagamento: FormaPagamento;
  dataPagamento: Date;
  observacoes?: string;
}

export type TipoServico = 
  | "lavagem_simples"
  | "lavagem_seco"
  | "engomagem"
  | "lavagem_engomagem"
  | "lavagem_especial";

export type StatusOrdem = 
  | "recebido"
  | "em_processo"
  | "pronto"
  | "entregue"
  | "cancelado";

export type FormaPagamento = 
  | "dinheiro"
  | "m_pesa"
  | "transferencia"
  | "cartao";

export interface DashboardStats {
  totalClientes: number;
  ordensRecebidas: number;
  ordensEmProcesso: number;
  ordensProntas: number;
  ordensEntregues: number;
  lucroMes: number;
  lucroTotal: number;
}