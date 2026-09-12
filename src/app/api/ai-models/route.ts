import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, endpoint, token, models } = body;

    const baseEndpoint = (endpoint?.trim() || 'https://9router.naufalputra.my.id/v1').replace(/\/+$/, '');
    const authToken = token?.trim() || 'sk-f7dc96564905d265-i8kpea-767a0d95';

    // ACTION 1: Ambil daftar model yang tersedia dari endpoint (/models)
    if (action === 'fetch-available-models') {
      const modelsUrl = baseEndpoint.endsWith('/v1') 
        ? `${baseEndpoint}/models` 
        : `${baseEndpoint}/v1/models`;

      try {
        const res = await fetch(modelsUrl, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          signal: AbortSignal.timeout(15000),
        });

        if (!res.ok) {
          const errText = await res.text();
          return NextResponse.json({ error: `Gagal mengambil daftar model (${res.status}): ${errText}` }, { status: res.status });
        }

        const data = await res.json();
        const modelList: string[] = (data.data || data.models || [])
          .map((m: Record<string, unknown>) => (typeof m.id === 'string' ? m.id : typeof m.name === 'string' ? m.name : ''))
          .filter((id: string) => Boolean(id));

        return NextResponse.json({ models: modelList });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ error: `Gagal menghubungi server: ${msg}` }, { status: 500 });
      }
    }

    // ACTION 2: Cek status online/offline untuk setiap model yang diinputkan user
    if (action === 'check-models-status') {
      const chatEndpoint = baseEndpoint.endsWith('/v1')
        ? `${baseEndpoint}/chat/completions`
        : baseEndpoint.includes('/chat/completions')
        ? baseEndpoint
        : `${baseEndpoint}/chat/completions`;

      const modelList: string[] = Array.isArray(models) ? models.filter(Boolean) : [];

      if (modelList.length === 0) {
        return NextResponse.json({ error: 'Tidak ada model yang diperiksa' }, { status: 400 });
      }

      // Periksa setiap model secara paralel dengan timeout 12 detik
      const checks = await Promise.all(
        modelList.map(async (modelName) => {
          const start = performance.now();
          try {
            const res = await fetch(chatEndpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
              },
              body: JSON.stringify({
                model: modelName,
                messages: [
                  { role: 'user', content: 'Keluarkan hanya JSON: {"status":"ok","amount":100}' }
                ],
                temperature: 0.1,
                stream: false,
              }),
              signal: AbortSignal.timeout(15000),
            });

            const latencyMs = Math.round(performance.now() - start);

            if (res.ok) {
              const raw = await res.text();
              // Cek apakah ada teks respon
              let hasContent = false;
              try {
                const j = JSON.parse(raw);
                const content = j.choices?.[0]?.message?.content || j.choices?.[0]?.text || '';
                if (content && content.length > 0) hasContent = true;
              } catch {
                if (raw && raw.length > 5) hasContent = true;
              }

              return {
                model: modelName,
                status: hasContent ? ('online' as const) : ('warning' as const),
                latencyMs,
                message: hasContent ? `Aktif (${latencyMs}ms)` : 'Terhubung namun respon kosong',
              };
            } else {
              const errText = await res.text();
              let errorMsg = `HTTP ${res.status}`;
              if (res.status === 404) errorMsg = 'Model tidak ditemukan (404)';
              else if (res.status === 401 || res.status === 403) errorMsg = 'Akses ditolak / Token salah';
              else if (res.status === 429) errorMsg = 'Batas kuota habis (429 Rate limit)';
              else if (res.status >= 500) errorMsg = 'Server provider sedang gangguan (500)';

              return {
                model: modelName,
                status: 'offline' as const,
                latencyMs,
                message: errorMsg,
                rawError: errText.slice(0, 100),
              };
            }
          } catch (e: unknown) {
            const latencyMs = Math.round(performance.now() - start);
            const msg = e instanceof Error ? e.message : String(e);
            return {
              model: modelName,
              status: 'offline' as const,
              latencyMs,
              message: msg.includes('timeout') ? 'Waktu habis (Timeout > 15s)' : 'Gagal terhubung',
              rawError: msg,
            };
          }
        })
      );

      return NextResponse.json({ results: checks });
    }

    // ACTION 3: Cek status dan validitas beberapa Gemini API Key
    if (action === 'check-gemini-keys') {
      const keys: string[] = Array.isArray(body.keys) ? body.keys.filter(Boolean) : [];
      if (keys.length === 0) {
        return NextResponse.json({ error: 'Tidak ada API Key yang diperiksa' }, { status: 400 });
      }

      const results = await Promise.all(
        keys.map(async (key: string, index: number) => {
          const start = performance.now();
          const cleanKey = key.trim();
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`, {
              signal: AbortSignal.timeout(12000),
            });
            const latencyMs = Math.round(performance.now() - start);

            if (res.ok) {
              const data = await res.json();
              const supported = (data.models || [])
                .filter((m: { supportedGenerationMethods?: string[] }) => m.supportedGenerationMethods?.includes('generateContent'))
                .map((m: { name: string }) => m.name.replace(/^models\//, ''));

              if (supported.length > 0) {
                return {
                  index,
                  key: cleanKey,
                  status: 'online' as const,
                  latencyMs,
                  modelsCount: supported.length,
                  topModel: supported[0],
                  message: `Aktif (${supported.length} model: ${supported.slice(0, 2).join(', ')})`,
                };
              } else {
                return {
                  index,
                  key: cleanKey,
                  status: 'warning' as const,
                  latencyMs,
                  message: 'Key valid tapi belum ada model generateContent aktif',
                };
              }
            } else {
              const errText = await res.text();
              let msg = `HTTP ${res.status}`;
              try {
                msg = JSON.parse(errText).error?.message || errText;
              } catch {}
              if (res.status === 400 || msg.includes('API_KEY_INVALID')) msg = 'API Key tidak valid (400)';
              else if (res.status === 403) msg = 'Akses ditolak / belum aktif (403)';
              else if (res.status === 429) msg = 'Batas kuota habis (429 Rate Limit)';

              return {
                index,
                key: cleanKey,
                status: 'offline' as const,
                latencyMs,
                message: msg,
              };
            }
          } catch (e: unknown) {
            const latencyMs = Math.round(performance.now() - start);
            const msg = e instanceof Error ? e.message : String(e);
            return {
              index,
              key: cleanKey,
              status: 'offline' as const,
              latencyMs,
              message: msg.includes('timeout') ? 'Waktu habis (>12s)' : 'Gagal terhubung',
            };
          }
        })
      );

      return NextResponse.json({ results });
    }

    return NextResponse.json({ error: 'Action tidak valid' }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
