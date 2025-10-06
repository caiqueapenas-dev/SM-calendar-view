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

  // Public routes - sempre permite
  const publicRoutes = ['/', '/login/admin', '/login/client'];
  if (publicRoutes.includes(pathname)) {
    return res;
  }

  // Protected routes - require authentication
  if (!session) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // Admin routes - verificar role
  if (pathname.startsWith('/admin')) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .maybeSingle();

    // Se não tem entrada em users, verifica se é cliente
    if (!userData) {
      const { data: clientData } = await supabase
        .from('clients')
        .select('client_id')
        .eq('email', session.user.email)
        .single();

      if (clientData) {
        // É cliente tentando acessar admin - bloqueia
        return NextResponse.redirect(new URL('/', req.url));
      }
      // Não é cliente, assume admin (compatibilidade)
      return res;
    }

    if (userData.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Client routes - verificar se é cliente ativo
  if (pathname.startsWith('/client')) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('client_id, is_active, email')
      .eq('email', session.user.email)
      .single();

    if (!clientData || !clientData.is_active) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Verificar se está tentando acessar área de outro cliente
    const pathClientId = pathname.split('/')[2];
    if (pathClientId && pathClientId !== clientData.client_id) {
      return NextResponse.redirect(new URL(`/client/${clientData.client_id}`, req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icon-.*\\.png|screenshot.*\\.png).*)',
  ],
};

