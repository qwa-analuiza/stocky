import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { Icone, NomeIcone } from '../../../compartilhado/componentes/icone';
import { Marca } from '../../../compartilhado/componentes/marca';
import { AutenticacaoService } from '../../../nucleo/autenticacao/autenticacao.service';

interface ItemMenu {
  rota: string;
  rotulo: string;
  icone: NomeIcone;
  exato: boolean;
}

/** Moldura da área logada: menu (lateral no computador, embaixo no celular) + conteúdo. */
@Component({
  selector: 'app-layout-painel',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Marca, Icone],
  templateUrl: './layout-painel.html',
  styleUrl: './layout-painel.css',
})
export class LayoutPainel {
  protected readonly autenticacao = inject(AutenticacaoService);

  protected readonly menu: ItemMenu[] = [
    { rota: '/painel', rotulo: 'Visão geral', icone: 'visao-geral', exato: true },
    { rota: '/painel/produtos', rotulo: 'Produtos', icone: 'caixa', exato: false },
    { rota: '/painel/valor-estoque', rotulo: 'Valor de estoque', icone: 'moeda', exato: false },
    { rota: '/painel/perfil', rotulo: 'Perfil', icone: 'usuario', exato: false },
  ];

  protected readonly inicial = computed(
    () => this.autenticacao.usuario()?.nome.trim().charAt(0).toUpperCase() ?? '',
  );
}
