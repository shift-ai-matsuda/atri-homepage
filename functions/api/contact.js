/**
 * Cloudflare Pages Function: /api/contact
 * ブラウザ → この関数 → Render API (/api/contact-public)
 * API キーは Cloudflare 環境変数 HOMEPAGE_CONTACT_KEY に保管
 */

const RENDER_ENDPOINT = 'https://shift-app-1w01.onrender.com/api/contact-public';

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  /* ---- リクエストボディ取得 ---- */
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
  }

  const { name, facility, email, tel, message } = body;

  /* ---- バリデーション（message は任意） ---- */
  if (!name || !facility || !email || !tel) {
    return Response.json({ error: '必須項目が不足しています' }, { status: 400, headers: corsHeaders });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: '無効なメールアドレスです' }, { status: 400, headers: corsHeaders });
  }

  /* ---- Render API へ転送 ---- */
  let renderRes;
  try {
    renderRes = await fetch(RENDER_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Contact-Key': env.HOMEPAGE_CONTACT_KEY ?? '',
      },
      body: JSON.stringify({ name, facility, email, tel, message }),
    });
  } catch (err) {
    console.error('[contact] Render API 接続エラー');
    return Response.json({ error: 'ネットワークエラー' }, { status: 502, headers: corsHeaders });
  }

  if (renderRes.ok) {
    return Response.json({ success: true }, { headers: corsHeaders });
  }

  console.error('[contact] Render API エラー status=' + renderRes.status);
  return Response.json({ error: '送信失敗' }, { status: 500, headers: corsHeaders });
}

/* プリフライトリクエスト対応 */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
