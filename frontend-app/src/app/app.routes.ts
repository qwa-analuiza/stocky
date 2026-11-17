import { Routes } from '@angular/router';

import { somenteLogado, somenteVisitante } from './nucleo/autenticacao/autenticacao.guards';
import { Cadastro } from './paginas/autenticacao/cadastro/cadastro';
import { LayoutAutenticacao } from './paginas/autenticacao/layout-autenticacao/layout-autenticacao';
import { Login } from './paginas/autenticacao/login/login';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Telas públicas: compartilham o painel roxo da esquerda
  {
    path: '',
    component: LayoutAutenticacao,
    canActivate: [somenteVisitante],
    children: [
      { path: 'login', component: Login, title: 'Entrar — Stockly' },
      { path: 'cadastro', component: Cadastro, title: 'Crie sua conta — Stockly' },
    ],
  },

  // Área logada: menu + telas do estoque (carregadas só quando a pessoa entra)
  {
    path: 'painel',
    canActivate: [somenteLogado],
    loadComponent: () => import('./paginas/painel/layout-painel/layout-painel').then((m) => m.LayoutPainel),
    children: [
      {
        path: '',
        title: 'Visão geral — Stockly',
        loadComponent: () => import('./paginas/painel/visao-geral/visao-geral').then((m) => m.VisaoGeral),
      },
      {
        path: 'produtos',
        title: 'Produtos — Stockly',
        loadComponent: () =>
          import('./paginas/painel/produtos/lista-produtos/lista-produtos').then((m) => m.ListaProdutos),
      },
      {
        path: 'produtos/novo',
        title: 'Novo produto — Stockly',
        loadComponent: () =>
          import('./paginas/painel/produtos/formulario-produto/formulario-produto').then((m) => m.FormularioProduto),
      },
      {
        path: 'produtos/:id/editar',
        title: 'Editar produto — Stockly',
        loadComponent: () =>
          import('./paginas/painel/produtos/formulario-produto/formulario-produto').then((m) => m.FormularioProduto),
      },
      {
        path: 'valor-estoque',
        title: 'Valor de estoque — Stockly',
        loadComponent: () => import('./paginas/painel/valor-estoque/valor-estoque').then((m) => m.ValorEstoque),
      },
      {
        path: 'perfil',
        title: 'Perfil — Stockly',
        loadComponent: () => import('./paginas/painel/perfil/perfil').then((m) => m.Perfil),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
