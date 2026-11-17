import { Sessao, Usuario } from './autenticacao.modelos';

/** Guarda a sessão no navegador para a pessoa continuar logada ao recarregar a página. */

const CHAVE_TOKEN = 'stockly.token';
const CHAVE_USUARIO = 'stockly.usuario';

export function salvarSessao(sessao: Sessao): void {
  localStorage.setItem(CHAVE_TOKEN, sessao.token);
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(sessao.usuario));
}

/** Atualiza só os dados do usuário (ex.: depois de editar o perfil), mantendo o token. */
export function atualizarUsuarioSalvo(usuario: Usuario): void {
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
}

export function limparSessao(): void {
  localStorage.removeItem(CHAVE_TOKEN);
  localStorage.removeItem(CHAVE_USUARIO);
}

export function lerToken(): string | null {
  return localStorage.getItem(CHAVE_TOKEN);
}

/** Devolve o usuário salvo, ou null se não houver sessão válida (apaga a vencida). */
export function lerUsuarioSalvo(): Usuario | null {
  try {
    const token = lerToken();
    const usuario = localStorage.getItem(CHAVE_USUARIO);
    if (!token || !usuario || tokenExpirado(token)) {
      limparSessao();
      return null;
    }
    return JSON.parse(usuario) as Usuario;
  } catch {
    return null;
  }
}

/** Lê a data de expiração ("exp") de dentro do JWT, sem precisar de biblioteca. */
function tokenExpirado(token: string): boolean {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const conteudo = JSON.parse(atob(base64)) as { exp?: number };
    return !conteudo.exp || conteudo.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
