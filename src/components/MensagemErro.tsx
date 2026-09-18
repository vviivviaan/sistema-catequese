/** Mensagem de erro padrão para quando uma consulta ao banco falha de verdade
 * (rede, permissão, etc.) — para não confundir com "nenhum item cadastrado". */
export default function MensagemErro({ mensagem }: { mensagem?: string }) {
  return (
    <p role="alert" className="rounded-xl bg-vinho/10 p-4 text-sm text-vinho shadow-suave">
      {mensagem ?? 'Não foi possível carregar essas informações agora. Tente novamente em instantes.'}
    </p>
  );
}
