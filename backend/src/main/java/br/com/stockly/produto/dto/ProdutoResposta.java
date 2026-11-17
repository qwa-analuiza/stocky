package br.com.stockly.produto.dto;

import br.com.stockly.produto.Produto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * Produto como o front recebe, já com os totais calculados.
 * diasParaVencer: negativo = já venceu; null = sem data de vencimento.
 */
public record ProdutoResposta(
        Long id,
        String nome,
        String descricao,
        int quantidade,
        BigDecimal valorInvestido,
        BigDecimal valorVenda,
        LocalDate dataVencimento,
        String imagem,
        BigDecimal valorInvestidoTotal,
        BigDecimal valorVendaTotal,
        BigDecimal lucroTotal,
        Long diasParaVencer
) {

    public static ProdutoResposta de(Produto produto, LocalDate hoje) {
        BigDecimal investido = produto.valorInvestidoTotal();
        BigDecimal venda = produto.valorVendaTotal();
        Long dias = produto.getDataVencimento() == null
                ? null
                : ChronoUnit.DAYS.between(hoje, produto.getDataVencimento());

        return new ProdutoResposta(
                produto.getId(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getQuantidade(),
                produto.getValorInvestido(),
                produto.getValorVenda(),
                produto.getDataVencimento(),
                produto.getImagem(),
                investido,
                venda,
                venda.subtract(investido),
                dias
        );
    }
}
