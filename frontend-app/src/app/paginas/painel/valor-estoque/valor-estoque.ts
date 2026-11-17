import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BarraInvestidoVenda } from '../../../compartilhado/componentes/barra-investido-venda';
import { Icone } from '../../../compartilhado/componentes/icone';
import { Indicador } from '../../../compartilhado/componentes/indicador';
import { MiniaturaProduto } from '../../../compartilhado/componentes/miniatura-produto';
import { Produto } from '../../../nucleo/produtos/produto.modelos';
import { ProdutosService } from '../../../nucleo/produtos/produtos.service';

/** De-para entre o que foi investido e o que o estoque vale na venda. */
@Component({
  selector: 'app-valor-estoque',
  imports: [CurrencyPipe, DecimalPipe, RouterLink, Indicador, Icone, MiniaturaProduto, BarraInvestidoVenda],
  templateUrl: './valor-estoque.html',
  styleUrl: './valor-estoque.css',
})
export class ValorEstoque {
  private readonly produtosService = inject(ProdutosService);

  protected readonly resumo = this.produtosService.resumir();
  protected readonly produtos = this.produtosService.listar();

  /** Quem mais vale na venda aparece primeiro. */
  protected readonly ordenados = computed(() =>
    [...this.produtos.value()].sort((a, b) => b.valorVendaTotal - a.valorVendaTotal),
  );

  /** Régua comum: todas as barras usam a mesma escala, então dá para comparar os produtos. */
  protected readonly escala = computed(() =>
    Math.max(0, ...this.produtos.value().map((p) => Math.max(p.valorVendaTotal, p.valorInvestidoTotal))),
  );

  protected readonly carregando = computed(
    () => (this.resumo.isLoading() && !this.resumo.hasValue()) || (this.produtos.isLoading() && this.produtos.value().length === 0),
  );

  protected margem(produto: Produto): number {
    return produto.valorVendaTotal > 0 ? (produto.lucroTotal / produto.valorVendaTotal) * 100 : 0;
  }

  protected recarregar(): void {
    this.resumo.reload();
    this.produtos.reload();
  }
}
