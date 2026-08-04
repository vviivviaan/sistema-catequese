'use client';

type TercoProgressoProps = {
  /** Quantidade de contas já "iluminadas" (conquistadas) */
  contasAcesas: number;
  /** Total de contas no terço exibido */
  totalContas?: number;
  className?: string;
};

/**
 * Elemento de assinatura do sistema: um terço estilizado onde cada conta
 * representa uma fração do engajamento do catequizando (encontros
 * acompanhados, questionários concluídos). Contas conquistadas acendem
 * em dourado ("vela"); as demais ficam em contorno.
 */
export default function TercoProgresso({
  contasAcesas,
  totalContas = 10,
  className = '',
}: TercoProgressoProps) {
  const raio = 150;
  const centroX = 160;
  const centroY = 170;
  const anguloInicio = 200;
  const anguloFim = -20;

  const contas = Array.from({ length: totalContas }, (_, i) => {
    const t = totalContas === 1 ? 0 : i / (totalContas - 1);
    const angulo = (anguloInicio + t * (anguloFim - anguloInicio)) * (Math.PI / 180);
    const x = centroX + raio * Math.cos(angulo);
    const y = centroY + raio * Math.sin(angulo) * 0.55 + 20;
    const acesa = i < contasAcesas;
    return { x, y, acesa, indice: i };
  });

  const caminho = contas.map((c) => `${c.x},${c.y}`).join(' ');

  return (
    <svg
      viewBox="0 0 320 210"
      className={className}
      role="img"
      aria-label={`Progresso: ${contasAcesas} de ${totalContas} contas conquistadas`}
    >
      <polyline
        points={caminho}
        fill="none"
        stroke="#C15B3C"
        strokeOpacity="0.25"
        strokeWidth="2"
      />
      {contas.map((c) => (
        <circle
          key={c.indice}
          cx={c.x}
          cy={c.y}
          r={c.acesa ? 9 : 7}
          fill={c.acesa ? '#B8873A' : '#FBFAF6'}
          stroke={c.acesa ? '#8C6528' : '#C15B3C'}
          strokeOpacity={c.acesa ? 1 : 0.35}
          strokeWidth="1.5"
        >
          {c.acesa && (
            <animate
              attributeName="r"
              values="9;10;9"
              dur="2.4s"
              repeatCount="indefinite"
              begin={`${c.indice * 0.15}s`}
            />
          )}
        </circle>
      ))}
      {/* Crucifixo estilizado ao final da fiada */}
      <line
        x1={contas[contas.length - 1]?.x ?? 0}
        y1={contas[contas.length - 1]?.y ?? 0}
        x2={centroX + raio + 6}
        y2={centroY - 4}
        stroke="#C15B3C"
        strokeOpacity="0.3"
        strokeWidth="2"
      />
      <rect
        x={centroX + raio - 2}
        y={centroY - 20}
        width="4"
        height="24"
        fill="#4A5872"
        opacity="0.4"
      />
      <rect
        x={centroX + raio - 10}
        y={centroY - 12}
        width="20"
        height="4"
        fill="#4A5872"
        opacity="0.4"
      />
    </svg>
  );
}
