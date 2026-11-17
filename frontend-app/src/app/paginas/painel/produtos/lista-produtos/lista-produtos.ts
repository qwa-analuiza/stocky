import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Alerta } from '../../../../compartilhado/componentes/alerta';
import { Icone } from '../../../../compartilhado/componentes/icone';
import { DIAS_DE_ALERTA, SeloVencimento } from '../../../../compartilhado/componentes/selo-vencimento';
import { mensagemDeErro } from '../../../../nucleo/http/erro-api';
import { Produto } from '../../../../nucleo/produtos/produto.modelos';
import { ProdutosService } from '../../../../nucleo/produtos/produtos.service';

type Filtro = 'todos' | 'vencendo' | 'vencidos';

@Component({
  selector: 'app-lista-produtos',
  imports: [CurrencyPipe, RouterLink, Icone, SeloVencimento, Alerta],
  templateUrl: './lista-produtos.html',
  styleUrl: './lista-produtos.css',
})
export class ListaProdutos {
  private readonly produtosService = inject(ProdutosService);

  protected readonly produtos = this.produtosService.listar();

  protected readonly busca = signal('');
  protected readonly filtro = signal<Filtro>('todos');
  protected readonly confirmandoExclusao = signal<number | null>(null);
  protected readonly excluindo = signal<number | null>(null);
  protected readonly erro = signal<string | null>(null);

  protected readonly filtros: { valor: Filtro; rotulo: string }[] = [
    { valor: 'todos', rotulo: 'Todos' },
    { valor: 'vencendo', rotulo: 'Vencem em breve' },
    { valor: 'vencidos', rotulo: 'Vencidos' },
  ];

  protected readonly visiveis = computed(() => {
    const termo = normalizar(this.busca());
    const filtro = this.filtro();
    return this.produtos.value().filter((produto) => {
      const combinaBusca =
        !termo || normalizar(produto.nome).includes(termo) || normalizar(produto.descricao ?? '').includes(termo);
      return combinaBusca && combinaFiltro(produto, filtro);
    });
  });

  protected buscar(evento: Event): void {
    this.busca.set((evento.target as HTMLInputElement).value);
  }

  protected lucroPorUnidade(produto: Produto): number {
    return produto.valorVenda - produto.valorInvestido;
  }

  protected excluir(produto: Produto): void {
    this.excluindo.set(produto.id);
    this.erro.set(null);
    this.produtosService.excluir(produto.id).subscribe({
      next: () => {
        this.excluindo.set(null);
        this.confirmandoExclusao.set(null);
        this.produtos.reload();
      },
      error: (erro) => {
        this.excluindo.set(null);
        this.erro.set(mensagemDeErro(erro));
      },
    });
  }
}

function combinaFiltro(produto: Produto, filtro: Filtro): boolean {
  const dias = produto.diasParaVencer;
  if (filtro === 'vencidos') return dias !== null && dias < 0;
  if (filtro === 'vencendo') return dias !== null && dias >= 0 && dias <= DIAS_DE_ALERTA;
  return true;
}

/** Ignora maiúsculas e acentos na busca ("acucar" encontra "Açúcar"). */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
