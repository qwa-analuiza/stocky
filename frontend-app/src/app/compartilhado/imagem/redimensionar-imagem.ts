/**
 * Reduz a foto escolhida no celular/computador antes de enviar:
 * uma foto de 4 MB vira ~60 KB, e o estoque carrega rápido.
 */

const LADO_MAXIMO = 800;
const QUALIDADE = 0.82;
export const TAMANHO_MAXIMO_ORIGINAL = 10 * 1024 * 1024; // 10 MB

export async function redimensionarImagem(arquivo: File): Promise<string> {
  const imagem = await carregar(arquivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagem.width, imagem.height));

  const tela = document.createElement('canvas');
  tela.width = Math.round(imagem.width * escala);
  tela.height = Math.round(imagem.height * escala);

  const contexto = tela.getContext('2d');
  if (!contexto) {
    throw new Error('Seu navegador não conseguiu processar a imagem.');
  }
  contexto.fillStyle = '#fff'; // PNG transparente fica com fundo branco
  contexto.fillRect(0, 0, tela.width, tela.height);
  contexto.drawImage(imagem, 0, 0, tela.width, tela.height);

  const webp = tela.toDataURL('image/webp', QUALIDADE);
  // Safari antigo não gera WebP e devolve PNG: nesse caso usa JPEG
  return webp.startsWith('data:image/webp') ? webp : tela.toDataURL('image/jpeg', QUALIDADE);
}

function carregar(arquivo: File): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const endereco = URL.createObjectURL(arquivo);
    const imagem = new Image();
    imagem.onload = () => {
      URL.revokeObjectURL(endereco);
      resolver(imagem);
    };
    imagem.onerror = () => {
      URL.revokeObjectURL(endereco);
      rejeitar(new Error('Não foi possível abrir essa imagem. Tente outra foto.'));
    };
    imagem.src = endereco;
  });
}
