package br.com.stockly.produto.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Dados do formulário de produto (cadastro e edição). Valores por unidade. */
public record ProdutoRequisicao(
        @NotBlank(message = "Informe o nome do produto")
        @Size(max = 120, message = "O nome pode ter no máximo 120 caracteres")
        String nome,

        @Size(max = 500, message = "A descrição pode ter no máximo 500 caracteres")
        String descricao,

        @NotNull(message = "Informe a quantidade")
        @PositiveOrZero(message = "A quantidade não pode ser negativa")
        @Max(value = 1_000_000, message = "Quantidade muito alta")
        Integer quantidade,

        @NotNull(message = "Informe quanto você investiu")
        @DecimalMin(value = "0.00", message = "O valor não pode ser negativo")
        @Digits(integer = 10, fraction = 2, message = "Use no máximo 2 casas decimais")
        BigDecimal valorInvestido,

        @NotNull(message = "Informe o valor de venda")
        @DecimalMin(value = "0.00", message = "O valor não pode ser negativo")
        @Digits(integer = 10, fraction = 2, message = "Use no máximo 2 casas decimais")
        BigDecimal valorVenda,

        LocalDate dataVencimento,

        // A foto chega já reduzida pelo front (data URL). ~1 MB de texto é o teto.
        @Size(max = 1_400_000, message = "A imagem é grande demais")
        @Pattern(regexp = "^data:image/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$", message = "Formato de imagem inválido")
        String imagem
) {}
