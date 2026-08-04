/**
 * Regras de pontuação do "Cateque com Adultos".
 *
 * Cada pergunta correta vale PONTOS_POR_ACERTO pontos.
 * Completar 100% de um questionário rende um bônus de engajamento.
 */
export const PONTOS_POR_ACERTO = 10;
export const BONUS_QUESTIONARIO_COMPLETO = 20;

export function calcularPontos(acertos: number, totalPerguntas: number): number {
  const pontosBase = acertos * PONTOS_POR_ACERTO;
  const completou100 = totalPerguntas > 0 && acertos === totalPerguntas;
  return pontosBase + (completou100 ? BONUS_QUESTIONARIO_COMPLETO : 0);
}

/** Converte pontos acumulados em "contas do terço" iluminadas, para o componente visual. */
export function pontosParaContas(pontos: number, pontosPorConta = 30): number {
  return Math.floor(pontos / pontosPorConta);
}
