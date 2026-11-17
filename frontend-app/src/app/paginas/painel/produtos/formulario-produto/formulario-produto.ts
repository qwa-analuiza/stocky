import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Alerta } from '../../../../compartilhado/componentes/alerta';
import { Icone } from '../../../../compartilhado/componentes/icone';
import { aplicarErrosDoServidor, campoInvalido } from '../../../../compartilhado/formularios/validacao';
import { TAMANHO_MAXIMO_ORIGINAL, redimensionarImagem } from '../../../../compartilhado/imagem/redimensionar-imagem';
import { errosPorCampo, mensagemDeErro } from '../../../../nucleo/http/erro-api';
import { DadosProduto, Produto } from '../../../../nucleo/produtos/produto.modelos';
import { ProdutosService } from '../../../../nucleo/produtos/produtos.service';

type CampoProduto = 'nome' | 'descricao' | 'quantidade' | 'valorInvestido' | 'valorVenda' | 'dataVencimento';

const VALOR_MAXIMO = 9_999_999_999.99;

const MENSAGEM_OBRIGATORIO: Partial<Record<CampoProduto, string>> = {
  nome: 'Informe o nome do produto',
  quantidade: 'Informe a quantidade',
  valorInvestido: 'Informe quanto você investiu por unidade',
  valorVenda: 'Informe o valor de venda por unidade',
};

/** Cadastro e edição de produto (a mesma tela serve para os dois). */
@Component({
  selector: 'app-formulario-produto',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DecimalPipe, Icone, Alerta],
  templateUrl: './formulario-produto.html',
  styleUrl: './formulario-produto.css',
})
export class FormularioProduto {
  private readonly construtor = inject(NonNullableFormBuilder);
  private readonly produtosService = inject(ProdutosService);
  private readonly roteador = inject(Router);

  /** id do produto quando é edição; null quando é cadastro novo. */
  protected readonly id = numeroOuNulo(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  protected readonly editando = this.id !== null;

  protected readonly carregandoProduto = signal(this.editando);
  protected readonly salvando = signal(false);
  protected readonly processandoImagem = signal(false);
  protected readonly erro = signal<string | null>(null);
  protected readonly erroImagem = signal<string | null>(null);
  protected readonly imagem = signal<string | null>(null);

  protected readonly formulario = this.construtor.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    descricao: ['', [Validators.maxLength(500)]],
    quantidade: [
      null as number | null,
      [Validators.required, Validators.min(0), Validators.max(1_000_000), Validators.pattern(/^\d+$/)],
    ],
    valorInvestido: [null as number | null, [Validators.required, Validators.min(0), Validators.max(VALOR_MAXIMO)]],
    valorVenda: [null as number | null, [Validators.required, Validators.min(0), Validators.max(VALOR_MAXIMO)]],
    dataVencimento: [''],
  });

  private readonly valores = toSignal(this.formulario.valueChanges, { initialValue: this.formulario.getRawValue() });

  /** Contas mostradas ao lado dos valores, atualizadas enquanto a pessoa digita. */
  protected readonly calculo = computed(() => {
    const { quantidade, valorInvestido, valorVenda } = this.valores();
    const custo = Number(valorInvestido) || 0;
    const venda = Number(valorVenda) || 0;
    const unidades = Number(quantidade) || 0;
    const lucro = venda - custo;
    return {
      lucroPorUnidade: lucro,
      margem: venda > 0 ? (lucro / venda) * 100 : 0,
      totalInvestido: custo * unidades,
      totalVenda: venda * unidades,
      preenchido: valorInvestido !== null && valorVenda !== null,
    };
  });

  protected readonly tamanhoDescricao = computed(() => this.valores().descricao?.length ?? 0);

  constructor() {
    if (this.id !== null) {
      this.carregar(this.id);
    }
  }

  invalido(campo: CampoProduto): boolean {
    return campoInvalido(this.formulario.controls[campo]);
  }

  mensagem(campo: CampoProduto): string {
    const controle = this.formulario.controls[campo];
    if (controle.hasError('servidor')) return controle.getError('servidor');
    if (controle.hasError('required')) return MENSAGEM_OBRIGATORIO[campo] ?? 'Campo obrigatório';
    if (controle.hasError('min')) return 'O valor não pode ser negativo';
    if (controle.hasError('pattern')) return 'Use um número inteiro';
    if (controle.hasError('max')) return 'Valor muito alto';
    if (controle.hasError('maxlength')) return 'Texto muito longo';
    return '';
  }

  async escolherImagem(evento: Event): Promise<void> {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0];
    campo.value = ''; // permite escolher a mesma foto de novo
    if (!arquivo) return;

    this.erroImagem.set(null);
    if (!arquivo.type.startsWith('image/')) {
      this.erroImagem.set('Escolha um arquivo de imagem (JPG, PNG ou WebP).');
      return;
    }
    if (arquivo.size > TAMANHO_MAXIMO_ORIGINAL) {
      this.erroImagem.set('A foto pode ter no máximo 10 MB.');
      return;
    }

    this.processandoImagem.set(true);
    try {
      this.imagem.set(await redimensionarImagem(arquivo));
    } catch (erro) {
      this.erroImagem.set(erro instanceof Error ? erro.message : 'Não foi possível usar essa imagem.');
    } finally {
      this.processandoImagem.set(false);
    }
  }

  salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);

    const requisicao =
      this.id === null
        ? this.produtosService.criar(this.montarDados())
        : this.produtosService.atualizar(this.id, this.montarDados());

    requisicao.subscribe({
      next: () => this.roteador.navigateByUrl('/painel/produtos'),
      error: (erro) => {
        const erros = errosPorCampo(erro);
        if (Object.keys(erros).length > 0) {
          aplicarErrosDoServidor(this.formulario, erros);
          if (erros['imagem']) this.erroImagem.set(erros['imagem']);
        } else {
          this.erro.set(mensagemDeErro(erro));
        }
        this.salvando.set(false);
      },
    });
  }

  private carregar(id: number): void {
    this.produtosService.buscar(id).subscribe({
      next: (produto) => {
        this.preencher(produto);
        this.carregandoProduto.set(false);
      },
      error: (erro) => {
        this.erro.set(mensagemDeErro(erro));
        this.carregandoProduto.set(false);
      },
    });
  }

  private preencher(produto: Produto): void {
    this.formulario.setValue({
      nome: produto.nome,
      descricao: produto.descricao ?? '',
      quantidade: produto.quantidade,
      valorInvestido: produto.valorInvestido,
      valorVenda: produto.valorVenda,
      dataVencimento: produto.dataVencimento ?? '',
    });
    this.imagem.set(produto.imagem);
  }

  private montarDados(): DadosProduto {
    const valores = this.formulario.getRawValue();
    return {
      nome: valores.nome.trim(),
      descricao: valores.descricao.trim() || null,
      quantidade: Number(valores.quantidade),
      valorInvestido: Number(valores.valorInvestido),
      valorVenda: Number(valores.valorVenda),
      dataVencimento: valores.dataVencimento || null,
      imagem: this.imagem(),
    };
  }
}

function numeroOuNulo(texto: string | null): number | null {
  const numero = Number(texto);
  return texto !== null && Number.isInteger(numero) ? numero : null;
}
