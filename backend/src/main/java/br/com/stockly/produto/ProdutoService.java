package br.com.stockly.produto;

import br.com.stockly.compartilhado.erro.NaoEncontradoException;
import br.com.stockly.produto.dto.ProdutoRequisicao;
import br.com.stockly.produto.dto.ProdutoResposta;
import br.com.stockly.produto.dto.ResumoEstoque;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
public class ProdutoService {

    /** Produtos que vencem em até 30 dias aparecem como alerta no painel. */
    static final int DIAS_DE_ALERTA = 30;
    private static final int LIMITE_PROXIMOS_VENCIMENTOS = 6;

    private final ProdutoRepository produtos;
    private final Clock relogio;

    public ProdutoService(ProdutoRepository produtos, Clock relogio) {
        this.produtos = produtos;
        this.relogio = relogio;
    }

    @Transactional(readOnly = true)
    public List<ProdutoResposta> listar(Long usuarioId) {
        LocalDate hoje = hoje();
        return produtos.findAllByUsuarioIdOrderByNomeAsc(usuarioId).stream()
                .map(produto -> ProdutoResposta.de(produto, hoje))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResposta buscar(Long usuarioId, Long id) {
        return ProdutoResposta.de(buscarDoUsuario(usuarioId, id), hoje());
    }

    @Transactional
    public ProdutoResposta criar(Long usuarioId, ProdutoRequisicao dados) {
        Produto produto = new Produto(usuarioId);
        preencher(produto, dados);
        return ProdutoResposta.de(produtos.save(produto), hoje());
    }

    @Transactional
    public ProdutoResposta atualizar(Long usuarioId, Long id, ProdutoRequisicao dados) {
        Produto produto = buscarDoUsuario(usuarioId, id);
        preencher(produto, dados);
        return ProdutoResposta.de(produto, hoje());
    }

    @Transactional
    public void excluir(Long usuarioId, Long id) {
        produtos.delete(buscarDoUsuario(usuarioId, id));
    }

    @Transactional(readOnly = true)
    public ResumoEstoque resumir(Long usuarioId) {
        List<ProdutoResposta> lista = listar(usuarioId);

        BigDecimal investido = somar(lista.stream().map(ProdutoResposta::valorInvestidoTotal).toList());
        BigDecimal venda = somar(lista.stream().map(ProdutoResposta::valorVendaTotal).toList());
        BigDecimal lucro = venda.subtract(investido);
        BigDecimal margem = venda.signum() == 0
                ? BigDecimal.ZERO
                : lucro.multiply(BigDecimal.valueOf(100)).divide(venda, 1, RoundingMode.HALF_UP);

        List<ProdutoResposta> comAlerta = lista.stream()
                .filter(produto -> produto.diasParaVencer() != null && produto.diasParaVencer() <= DIAS_DE_ALERTA)
                .sorted(Comparator.comparing(ProdutoResposta::diasParaVencer))
                .toList();
        long vencidos = comAlerta.stream().filter(produto -> produto.diasParaVencer() < 0).count();

        return new ResumoEstoque(
                lista.size(),
                lista.stream().mapToLong(ProdutoResposta::quantidade).sum(),
                investido,
                venda,
                lucro,
                margem,
                vencidos,
                comAlerta.size() - vencidos,
                DIAS_DE_ALERTA,
                comAlerta.stream().limit(LIMITE_PROXIMOS_VENCIMENTOS).toList()
        );
    }

    private Produto buscarDoUsuario(Long usuarioId, Long id) {
        return produtos.findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new NaoEncontradoException("Produto não encontrado"));
    }

    private void preencher(Produto produto, ProdutoRequisicao dados) {
        produto.preencher(
                dados.nome().trim(),
                textoOuNulo(dados.descricao()),
                dados.quantidade(),
                dados.valorInvestido(),
                dados.valorVenda(),
                dados.dataVencimento(),
                textoOuNulo(dados.imagem())
        );
    }

    private LocalDate hoje() {
        return LocalDate.now(relogio);
    }

    private static BigDecimal somar(List<BigDecimal> valores) {
        return valores.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static String textoOuNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
