/**
 * A correção dos questionários e o cálculo de pontos por acerto acontecem
 * no banco, na função `responder_questionario` (ver supabase/schema.sql) —
 * é lá que fica o gabarito, então é lá que a pontuação precisa ser somada
 * para não confiar em nenhum valor calculado pelo navegador. As regras
 * (10 pontos por acerto, +20 de bônus por 100%) devem ser alteradas nos
 * dois lugares em conjunto caso mudem.
 */

/** Converte pontos acumulados em "contas do terço" iluminadas, para o componente visual. */
export function pontosParaContas(pontos: number, pontosPorConta = 30): number {
  return Math.floor(pontos / pontosPorConta);
}
