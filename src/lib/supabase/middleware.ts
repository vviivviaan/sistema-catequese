import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Acessíveis sem estar logado.
const ROTAS_PUBLICAS = ['/login', '/cadastro', '/recuperar-senha', '/redefinir-senha'];
// Dessas, só estas redirecionam para "/" quem já está logado.
// /redefinir-senha fica de fora: o clique no link do e-mail já autentica
// temporariamente (sessão de recuperação), e a página precisa continuar
// acessível para a pessoa poder definir a nova senha.
const ROTAS_SO_DESLOGADO = ['/login', '/cadastro'];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rotaEhPublica = ROTAS_PUBLICAS.some((rota) =>
    request.nextUrl.pathname.startsWith(rota)
  );
  const rotaEhSoDeslogado = ROTAS_SO_DESLOGADO.some((rota) =>
    request.nextUrl.pathname.startsWith(rota)
  );

  if (!user && !rotaEhPublica) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && rotaEhSoDeslogado) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('role')
      .eq('id', user.id)
      .single();

    if (perfil?.role !== 'administrador') {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
