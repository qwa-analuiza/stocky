package br.com.stockly.produto;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/** Item do estoque de um usuário. Os valores são sempre por unidade. */
@Entity
@Table(name = "produtos")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false, updatable = false)
    private Long usuarioId;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @Column(nullable = false)
    private int quantidade;

    @Column(name = "valor_investido", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorInvestido;

    @Column(name = "valor_venda", nullable = false, precision = 12, scale = 2)
    private BigDecimal valorVenda;

    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String imagem;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    protected Produto() {
        // exigido pelo JPA
    }

    public Produto(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public void preencher(String nome, String descricao, int quantidade, BigDecimal valorInvestido,
                          BigDecimal valorVenda, LocalDate dataVencimento, String imagem) {
        this.nome = nome;
        this.descricao = descricao;
        this.quantidade = quantidade;
        this.valorInvestido = valorInvestido;
        this.valorVenda = valorVenda;
        this.dataVencimento = dataVencimento;
        this.imagem = imagem;
    }

    /** Quanto foi gasto em todas as unidades. */
    public BigDecimal valorInvestidoTotal() {
        return valorInvestido.multiply(BigDecimal.valueOf(quantidade));
    }

    /** Quanto entra se todas as unidades forem vendidas. */
    public BigDecimal valorVendaTotal() {
        return valorVenda.multiply(BigDecimal.valueOf(quantidade));
    }

    @PrePersist
    void antesDeCriar() {
        criadoEm = OffsetDateTime.now();
        atualizadoEm = criadoEm;
    }

    @PreUpdate
    void antesDeAtualizar() {
        atualizadoEm = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public String getNome() { return nome; }
    public String getDescricao() { return descricao; }
    public int getQuantidade() { return quantidade; }
    public BigDecimal getValorInvestido() { return valorInvestido; }
    public BigDecimal getValorVenda() { return valorVenda; }
    public LocalDate getDataVencimento() { return dataVencimento; }
    public String getImagem() { return imagem; }
}
