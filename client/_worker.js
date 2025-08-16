export default {
  async fetch(request, env) {
    // Get the response from the static assets
    const response = await env.ASSETS.fetch(request);
    
    // If it's an HTML file, inject environment variables
    if (response.headers.get('content-type')?.includes('text/html')) {
      let html = await response.text();
      
      // Inject environment variables as global variables
      const envScript = `
        <script>
          window.__SUPABASE_URL__ = '${env.VITE_SUPABASE_URL}';
          window.__SUPABASE_ANON_KEY__ = '${env.VITE_SUPABASE_ANON_KEY}';
        </script>
      `;
      
      // Insert before closing </head> tag
      html = html.replace('</head>', `${envScript}</head>`);
      
      return new Response(html, {
        headers: response.headers,
        status: response.status,
        statusText: response.statusText
      });
    }
    
    return response;
  }
}; 