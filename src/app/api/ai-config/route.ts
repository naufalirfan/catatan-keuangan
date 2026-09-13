import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    '';
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ ai_config: null }, { status: 200 });
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('ai_config')
    .eq('id', user.id)
    .single();
  if (error) {
    return NextResponse.json({ ai_config: null }, { status: 200 });
  }
  return NextResponse.json({ ai_config: data?.ai_config || null });
}

export async function POST(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase tidak dikonfigurasi' }, { status: 500 });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
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
