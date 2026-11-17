import { AbstractControl, FormGroup } from '@angular/forms';

/** true quando o campo tem erro e a pessoa já mexeu nele (ou tentou enviar). */
export function campoInvalido(controle: AbstractControl): boolean {
  return controle.invalid && (controle.touched || controle.dirty);
}

/** Mostra embaixo de cada campo o erro que o servidor apontou para ele. */
export function aplicarErrosDoServidor(formulario: FormGroup, erros: Record<string, string>): void {
  for (const [campo, mensagem] of Object.entries(erros)) {
    const controle = formulario.get(campo);
    controle?.setErrors({ servidor: mensagem });
    controle?.markAsTouched();
  }
}
