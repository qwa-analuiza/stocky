package br.com.stockly.produto.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Números do painel "Visão geral" e da tela "Valor de estoque".
 * margemPercentual = lucro ÷ valor de venda × 100.
 */
public record ResumoEstoque(
        int totalProdutos,
        long totalUnidades,
        BigDecimal valorInvestido,
        BigDecimal valorVenda,
        BigDecimal lucroPotencial,
        BigDecimal margemPercentual,
        long produtosVencidos,
        long produtosVencendo,
        int diasDeAlerta,
        List<ProdutoResposta> proximosVencimentos
) {}
