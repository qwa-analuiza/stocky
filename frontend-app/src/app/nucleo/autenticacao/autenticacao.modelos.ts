/** Contratos trocados com a API (espelham os records Java do back-end). */

export interface Usuario {
  id: number;
  nome: string;
  nomeNegocio: string;
  email: string;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  nome: string;
  nomeNegocio: string;
  email: string;
  senha: string;
}

/** Resposta do login e do cadastro (SessaoResposta.java). */
export interface Sessao {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}
