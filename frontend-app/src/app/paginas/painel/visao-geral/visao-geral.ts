import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BarraInvestidoVenda } from '../../../compartilhado/componentes/barra-investido-venda';
import { Icone } from '../../../compartilhado/componentes/icone';
import { Indicador } from '../../../compartilhado/componentes/indicador';
import { MiniaturaProduto } from '../../../compartilhado/componentes/miniatura-produto';
import { SeloVencimento } from '../../../compartilhado/componentes/selo-vencimento';
import { AutenticacaoService } from '../../../nucleo/autenticacao/autenticacao.service';
import { ProdutosService } from '../../../nucleo/produtos/produtos.service';

/** Tela inicial: os números mais importantes do estoque. */
@Component({
  selector: 'app-visao-geral',
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    Indicador,
    Icone,
    MiniaturaProduto,
    SeloVencimento,
    BarraInvestidoVenda,
  ],
  templateUrl: './visao-geral.html',
  styleUrl: './visao-geral.css',
})
export class VisaoGeral {
  private readonly autenticacao = inject(AutenticacaoService);

  protected readonly resumo = inject(ProdutosService).resumir();

  protected readonly usuario = this.autenticacao.usuario;
  protected readonly primeiroNome = computed(() => this.usuario()?.nome.split(' ')[0] ?? '');
}
