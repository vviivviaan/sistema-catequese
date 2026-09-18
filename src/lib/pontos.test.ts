import { describe, expect, it } from 'vitest';
import { pontosParaContas } from './pontos';

describe('pontosParaContas', () => {
  it('não acende nenhuma conta com 0 pontos', () => {
    expect(pontosParaContas(0)).toBe(0);
  });

  it('acende uma conta a cada 30 pontos (padrão)', () => {
    expect(pontosParaContas(30)).toBe(1);
    expect(pontosParaContas(60)).toBe(2);
    expect(pontosParaContas(90)).toBe(3);
  });

  it('arredonda para baixo quando não é múltiplo exato', () => {
    expect(pontosParaContas(29)).toBe(0);
    expect(pontosParaContas(59)).toBe(1);
    expect(pontosParaContas(1)).toBe(0);
  });

  it('respeita um pontosPorConta customizado', () => {
    expect(pontosParaContas(50, 10)).toBe(5);
    expect(pontosParaContas(45, 10)).toBe(4);
  });
});
