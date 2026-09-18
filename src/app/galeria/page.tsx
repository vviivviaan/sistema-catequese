import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import MensagemErro from '@/components/MensagemErro';

export const dynamic = 'force-dynamic';

export default async function PaginaGaleria() {
  const supabase = createClient();

  const { data: fotos, error: erroFotos } = await supabase
    .from('fotos_galeria')
    .select('*')
    .order('data_evento', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-rocha">Memórias</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-noite">
          Galeria de datas festivas
        </h1>
      </div>

      {erroFotos ? (
        <MensagemErro />
      ) : fotos && fotos.length > 0 ? (
        <div className="columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
          {fotos.map((foto) => (
            <figure
              key={foto.id}
              className="break-inside-avoid overflow-hidden rounded-xl bg-white shadow-suave"
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={foto.url_imagem}
                  alt={foto.titulo}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-3">
                <p className="text-sm font-medium text-noite">{foto.titulo}</p>
                <p className="font-mono text-xs text-noite-suave">
                  {new Date(foto.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-cartao p-6 text-center text-sm text-noite-suave shadow-suave">
          Nenhuma foto cadastrada ainda.
        </p>
      )}
    </div>
  );
}
