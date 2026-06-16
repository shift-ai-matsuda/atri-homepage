/**
 * Cloudflare Pages Function: /api/contact
 * ブラウザ → この関数 → Render API (/api/contact-public)
 */

const RENDER_ENDPOINT = 'https://shift-app-1w01.onrender.com/api/contact-public';

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  console.log('=== [Pages Function] /api/contact 到達 ===');
  console.log('[Pages Function] Render endpoint:', RENDER_ENDPOINT);
  console.log('[Pages Function] HOMEPAGE_CONTACT_KEY 設定:', env.HOMEPAGE_CONTACT_KEY ? '設定あり (長さ=' + env.HOMEPAGE_CONTACT_KEY.length + ')' : '未設定 !!');

  /* ---- リクエストボディ取得 ---- */
  let body;
  try {
    body = await request.json();
    console.log('[Pages Function] 受信フィールド:', Object.keys(body).join(', '));
  } catch (e) {
    console.error('[Pages Function] JSON parse エラー:', e.message);
    return Response.json({ error: 'Invalid JSON' }, { status: 400, headers: corsHeaders });
  }

  const { name, facility, email, tel, message } = body;

  /* ---- バリデーション ---- */
  if (!name || !facility || !email || !tel || !message) {
    const missing = ['name','facility','email','tel','message'].filter(k => !body[k]);
    console.error('[Pages Function] バリデーション失敗 - 不足フィールド:', missing.join(', '));
    return Response.json({ error: '必須項目が不足しています', missing }, { status: 400, headers: corsHeaders });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('[Pages Function] メール形式エラー:', email);
    return Response.json({ error: '無効なメールアドレスです' }, { status: 400, headers: corsHeaders });
  }

  /* ---- Render API へ転送 ---- */
  console.log('[Pages Function] Render API へ POST 開始...');
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
    console.error('[Pages Function] Render API 接続エラー:', err.message);
    return Response.json({ error: 'ネットワークエラー', detail: err.message }, { status: 502, headers: corsHeaders });
  }

  const renderStatus = renderRes.status;
  const renderBody   = await renderRes.text().catch(() => '(body読み取り失敗)');
  console.log('[Pages Function] Render レスポンス status:', renderStatus);
  console.log('[Pages Function] Render レスポンス body:', renderBody);

  if (renderRes.ok) {
    console.log('[Pages Function] 送信成功');
    return Response.json({ success: true }, { headers: corsHeaders });
  }

  console.error('[Pages Function] Render API エラー status=' + renderStatus + ' body=' + renderBody);
  return Response.json({ error: '送信失敗', renderStatus, renderBody }, { status: 500, headers: corsHeaders });
}

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
