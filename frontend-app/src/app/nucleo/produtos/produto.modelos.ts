/** Contratos da API de produtos (espelham os records Java). Valores por unidade. */

export interface Produto {
  id: number;
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorInvestido: number;
  valorVenda: number;
  dataVencimento: string | null; // "AAAA-MM-DD"
  imagem: string | null; // data URL (já reduzida)
  valorInvestidoTotal: number;
  valorVendaTotal: number;
  lucroTotal: number;
  /** negativo = já venceu; null = não vence */
  diasParaVencer: number | null;
}

export interface DadosProduto {
  nome: string;
  descricao: string | null;
  quantidade: number;
  valorInvestido: number;
  valorVenda: number;
  dataVencimento: string | null;
  imagem: string | null;
}

export interface ResumoEstoque {
  totalProdutos: number;
  totalUnidades: number;
  valorInvestido: number;
  valorVenda: number;
  lucroPotencial: number;
  margemPercentual: number;
  produtosVencidos: number;
  produtosVencendo: number;
  diasDeAlerta: number;
  proximosVencimentos: Produto[];
}
