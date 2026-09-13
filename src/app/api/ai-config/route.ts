import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/utils/supabase-server';

export async function GET(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak ada pengguna yang masuk' }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('ai_config')
    .eq('id', user.id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ai_config: data?.ai_config || null });
}

export async function POST(request: Request) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Tidak ada pengguna yang masuk' }, { status: 401 });
  }
  const body = await request.json();
  const { ai_config } = body;
  if (!ai_config) {
    return NextResponse.json({ error: 'ai_config diperlukan' }, { status: 400 });
  }
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email, ai_config }, { onConflict: 'id' });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
