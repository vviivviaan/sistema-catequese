import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import FormFoto from '@/components/admin/FormFoto';
import BotaoExcluirFoto from '@/components/admin/BotaoExcluirFoto';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

export default async function PaginaAdminFotos() {
  const supabase = createClient();
  const { data: fotos, error } = await supabase
    .from('fotos_galeria')
    .select('*')
    .order('data_evento', { ascending: false });

  return (
    <div className="space-y-6">
      <FormFoto />

      {error ? (
        <MensagemErro />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {(fotos ?? []).map((foto) => (
            <div key={foto.id} className="overflow-hidden rounded-xl bg-white shadow-suave">
              <div className="relative aspect-square w-full">
                <Image src={foto.url_imagem} alt={foto.titulo} fill className="object-cover" />
                <div className="absolute right-2 top-2">
                  <BotaoExcluirFoto id={foto.id} urlImagem={foto.url_imagem} />
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-noite">{foto.titulo}</p>
                <p className="font-mono text-xs text-noite-suave">
                  {new Date(foto.data_evento + 'T00:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
          {fotos && fotos.length === 0 && (
            <p className="col-span-full rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
              Nenhuma foto cadastrada ainda.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
