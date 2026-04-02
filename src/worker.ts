import { loadBYOKConfig, saveBYOKConfig, callLLM, generateSetupHTML, getBuiltinProviders } from './lib/byok.js';

const BRAND = '#059669';
const ACCENT = '#d97706';
const NAME = 'ActiveLedger.ai';
const TAGLINE = 'Finance-Focused Repo-Agents';

const FEATURES = [
  { icon: '🤖', title: 'Trading Agents', desc: 'Autonomous repo-agents that build and execute trading strategies' },
  { icon: '📊', title: 'Portfolio Tracking', desc: 'Real-time portfolio monitoring with performance analytics' },
  { icon: '📈', title: 'Market Analysis', desc: 'AI-powered market analysis and opportunity detection' },
  { icon: '🛡️', title: 'Risk Management', desc: 'Automated risk assessment and position sizing' },
  { icon: '🔑', title: 'Multi-Provider BYOK', desc: 'Bring OpenAI, Anthropic, DeepSeek, or any OpenAI-compatible provider' },
];

function landingHTML(): string {
  const featureCards = FEATURES.map(f =>
    `<div class="feature"><div class="feat-icon">${f.icon}</div><div class="feat-title">${f.title}</div><div class="feat-desc">${f.desc}</div></div>`
  ).join('');
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}body{background:#0a0a1a;color:#e0e0e0;font-family:'Inter',system-ui,sans-serif}
.hero{text-align:center;padding:4rem 1rem 2rem;max-width:800px;margin:0 auto}
.hero h1{font-size:2.5rem;background:linear-gradient(135deg,${BRAND},${ACCENT});-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem}
.hero p{color:#888;font-size:1.1rem}
.features{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem;max-width:800px;margin:2rem auto;padding:0 1rem}
.feature{background:#1a1a2e;border-radius:12px;padding:1.5rem;border:1px solid #222}
.feat-icon{font-size:2rem;margin-bottom:.5rem}.feat-title{font-weight:700;margin-bottom:.25rem}.feat-desc{color:#888;font-size:.85rem}
.cta{text-align:center;padding:2rem 1rem 4rem}.cta a{background:linear-gradient(135deg,${BRAND},${ACCENT});color:#fff;text-decoration:none;padding:.75rem 2rem;border-radius:8px;font-weight:700}
</style></head><body><div class="hero"><h1>💰 ${NAME}</h1><p>${TAGLINE}</p></div>
<div class="features">${featureCards}</div><div class="cta"><a href="/setup">Get Started</a></div></body></html>`;
}

const CSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*;";

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const headers = { 'Content-Type': 'text/html;charset=utf-8', 'Content-Security-Policy': CSP };
    const jsonHeaders = { 'Content-Type': 'application/json' };

    if (url.pathname === '/') return new Response(landingHTML(), { headers });
    if (url.pathname === '/health') return new Response(JSON.stringify({ status: 'ok', service: NAME }), { headers: jsonHeaders });
    if (url.pathname === '/setup') return new Response(generateSetupHTML(NAME, BRAND), { headers });

    if (url.pathname === '/api/byok/config') {
      if (request.method === 'GET') {
        const config = await loadBYOKConfig(request, env);
        return new Response(JSON.stringify(config), { headers: jsonHeaders });
      }
      if (request.method === 'POST') {
        const config = await request.json();
        await saveBYOKConfig(config, request, env);
        return new Response(JSON.stringify({ saved: true }), { headers: jsonHeaders });
      }
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      const config = await loadBYOKConfig(request, env);
      if (!config) return new Response(JSON.stringify({ error: 'No provider configured. Visit /setup' }), { status: 401, headers: jsonHeaders });
      const body = await request.json();
      return callLLM(config, body.messages || [], { stream: body.stream, maxTokens: body.maxTokens, temperature: body.temperature });
    }

    const stubRoutes: Record<string, string> = {
      '/api/portfolio': 'Portfolio tracking',
      '/api/trades': 'Trade execution and history',
      '/api/agents': 'Trading repo-agent management',
      '/api/market': 'Market data and analysis',
    };
    if (stubRoutes[url.pathname]) {
      return new Response(JSON.stringify({ service: NAME, endpoint: url.pathname, message: stubRoutes[url.pathname] }), { headers: jsonHeaders });
    }

    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
