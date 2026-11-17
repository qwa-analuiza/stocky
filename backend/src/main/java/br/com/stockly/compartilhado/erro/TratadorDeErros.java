package br.com.stockly.compartilhado.erro;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.LinkedHashMap;
import java.util.Map;

/** Transforma qualquer exceção numa resposta JSON com mensagem em português. */
@RestControllerAdvice
public class TratadorDeErros {

    private static final Logger log = LoggerFactory.getLogger(TratadorDeErros.class);

    @ExceptionHandler(NegocioException.class)
    public ResponseEntity<ErroApi> regraDeNegocio(NegocioException erro) {
        return responder(erro.getStatus(), erro.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErroApi> camposInvalidos(MethodArgumentNotValidException erro) {
        Map<String, String> campos = new LinkedHashMap<>();
        erro.getBindingResult().getFieldErrors()
                .forEach(campo -> campos.putIfAbsent(campo.getField(), campo.getDefaultMessage()));
        return ResponseEntity.badRequest().body(ErroApi.deCampos(campos));
    }

    @ExceptionHandler(CampoInvalidoException.class)
    public ResponseEntity<ErroApi> campoInvalido(CampoInvalidoException erro) {
        return ResponseEntity.badRequest().body(ErroApi.deCampos(Map.of(erro.getCampo(), erro.getMessage())));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErroApi> jsonInvalido() {
        return responder(HttpStatus.BAD_REQUEST, "Dados enviados em formato inválido.");
    }

    /** Dois cadastros com o mesmo e-mail ao mesmo tempo: o UNIQUE do banco segura. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErroApi> registroDuplicado() {
        return responder(HttpStatus.CONFLICT, EmailJaCadastradoException.MENSAGEM);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErroApi> rotaInexistente() {
        return responder(HttpStatus.NOT_FOUND, "Endereço não encontrado.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErroApi> erroInesperado(Exception erro) {
        log.error("Erro inesperado", erro);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Algo deu errado do nosso lado. Tente novamente em instantes.");
    }

    private ResponseEntity<ErroApi> responder(HttpStatus status, String mensagem) {
        return ResponseEntity.status(status).body(ErroApi.de(status.value(), mensagem));
    }
}
