import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { DadosProduto, Produto, ResumoEstoque } from './produto.modelos';

const URL_PRODUTOS = `${environment.apiUrl}/produtos`;

@Injectable({ providedIn: 'root' })
export class ProdutosService {
  private readonly http = inject(HttpClient);

  /**
   * Lista reativa de produtos (carrega sozinha).
   * Chame dentro de um componente; depois de alterar algo, use .reload().
   */
  listar() {
    return httpResource<Produto[]>(() => URL_PRODUTOS, { defaultValue: [] });
  }

  /** Números do painel e da tela de valor de estoque (carrega sozinho). */
  resumir() {
    return httpResource<ResumoEstoque>(() => `${URL_PRODUTOS}/resumo`);
  }

  buscar(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${URL_PRODUTOS}/${id}`);
  }

  criar(dados: DadosProduto): Observable<Produto> {
    return this.http.post<Produto>(URL_PRODUTOS, dados);
  }

  atualizar(id: number, dados: DadosProduto): Observable<Produto> {
    return this.http.put<Produto>(`${URL_PRODUTOS}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${URL_PRODUTOS}/${id}`);
  }
}
