import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  // Redirect ke halaman utama setelah callback OAuth berhasil
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
