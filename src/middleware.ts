import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;

  console.log('🟣 MIDDLEWARE:', pathname, 'Session:', !!session);

  // Public routes - sempre permite
  const publicRoutes = ['/', '/login/admin', '/login/client'];
  if (publicRoutes.includes(pathname)) {
    console.log('🟣 Rota pública, permitindo...');
    return res;
  }

  // Protected routes - require authentication
  if (!session) {
    console.log('🟣 Sem sessão, redirecionando para /');
    return NextResponse.redirect(new URL('/', req.url));
  }

  console.log('🟣 Sessão OK, verificando permissões...');

  // Admin routes - verificar role
  if (pathname.startsWith('/admin')) {
    console.log('🟣 Verificando acesso a /admin...');
    
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    console.log('🟣 UserData encontrado:', userData);

    // Se não tem entrada em users, verifica se é cliente
    if (!userData) {
      console.log('🟣 Não encontrou em users, verificando se é cliente...');
      
      const { data: clientData } = await supabase
        .from('clients')
        .select('client_id')
        .eq('email', session.user.email)
        .single();

      if (clientData) {
        // É cliente tentando acessar admin - bloqueia
        console.log('🟣 É cliente, bloqueando acesso a /admin');
        return NextResponse.redirect(new URL('/', req.url));
      }
      // Não é cliente, assume admin (compatibilidade)
      console.log('🟣 Não é cliente, assumindo admin');
      return res;
    }

    if (userData.role !== 'admin') {
      console.log('🟣 Role não é admin, bloqueando. Role:', userData.role);
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    console.log('🟣 Role confirmado: admin. Permitindo acesso.');
  }

  // Client routes - verificar se é cliente ativo
  if (pathname.startsWith('/client')) {
    console.log('🟣 Verificando acesso a /client...');
    
    const { data: clientData } = await supabase
      .from('clients')
      .select('client_id, is_active, email')
      .eq('email', session.user.email)
      .single();

    console.log('🟣 ClientData middleware:', clientData);

    if (!clientData || !clientData.is_active) {
      console.log('🟣 Cliente não encontrado ou inativo, bloqueando');
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Verificar se está tentando acessar área de outro cliente
    const pathClientId = pathname.split('/')[2];
    if (pathClientId && pathClientId !== clientData.client_id) {
      console.log('🟣 Tentando acessar área de outro cliente, redirecionando');
      return NextResponse.redirect(new URL(`/client/${clientData.client_id}`, req.url));
    }
    
    console.log('🟣 Cliente verificado. Permitindo acesso.');
  }

  console.log('🟣 Permitindo acesso a:', pathname);
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-.*\\.png|screenshot.*\\.png).*)',
  ],
};

