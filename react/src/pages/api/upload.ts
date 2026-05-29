import type { APIRoute } from 'astro';

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, timeout = 60000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      
      if (res.ok) return res;
      
      console.warn(`[Upload API] Attempt ${i + 1} failed (${res.status}).`);
      if (res.status === 401 || res.status === 403) return res; // Don't retry auth errors
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`[Upload API] Attempt ${i + 1} timed out.`);
      } else {
        console.warn(`[Upload API] Attempt ${i + 1} error: ${error.message}`);
      }
    }
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Upload failed after multiple attempts');
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  console.log(`[Upload API] Incoming request from user: ${user?.username || 'unknown'}`);

  if (!jwt) {
    console.warn('[Upload API] No JWT found in cookies');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';
    
    // Log file info if present
    const file = formData.get('files');
    if (file instanceof File) {
      console.log(`[Upload API] Proxying file: ${file.name} (${file.size} bytes, type: ${file.type})`);
    }

    console.log(`[Upload API] Forwarding to: ${strapiUrl}/api/upload with resilience...`);

    // Forward the multipart request to Strapi with retries and longer timeout
    const response = await fetchWithRetry(`${strapiUrl}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Upload API] Strapi error:', response.status, JSON.stringify(data));
      return new Response(JSON.stringify({ 
        error: data.error?.message || 'Upload failed',
        details: data.error?.details || null
      }), { 
        status: response.status 
      });
    }

    console.log('[Upload API] SUCCESS: File uploaded to Strapi');
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: any) {
    console.error('[Upload API] CRITICAL ERROR:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error: ' + error.message }), { status: 500 });
  }
};
