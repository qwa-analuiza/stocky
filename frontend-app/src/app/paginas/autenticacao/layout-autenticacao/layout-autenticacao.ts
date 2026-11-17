import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { Marca } from '../../../compartilhado/componentes/marca';

/** Moldura das telas de entrada: painel escuro da marca + formulário (login ou cadastro). */
@Component({
  selector: 'app-layout-autenticacao',
  imports: [RouterOutlet, RouterLink, Marca],
  templateUrl: './layout-autenticacao.html',
  styleUrl: './layout-autenticacao.css',
})
export class LayoutAutenticacao {}
