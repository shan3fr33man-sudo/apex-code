import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

async function addRateLimitHeaders(response: NextResponse) {
  response.headers.set('X-RateLimit-Limit', '100');
  response.headers.set('X-RateLimit-Remaining', '99');
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());
  return response;
}

async function protectApiRoute(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (pathname === '/api/chat' || pathname === '/api/execute') {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll() {},
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user && request.method !== 'OPTIONS') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const apiAuthResponse = await protectApiRoute(request);
  if (apiAuthResponse) return apiAuthResponse;
  let response = await updateSession(request);
  if (request.nextUrl.pathname.startsWith('/api')) {
    response = await addRateLimitHeaders(response);
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
