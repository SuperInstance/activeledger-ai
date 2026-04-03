import { addNode, addEdge, traverse, crossDomainQuery, findPath, domainStats, getDomainNodes } from './lib/knowledge-graph.js';
import { loadSeedIntoKG, FLEET_REPOS, loadAllSeeds } from './lib/seed-loader.js';
import { evapPipeline, getEvapReport, getLockStats } from './lib/evaporation-pipeline.js';
import { selectModel } from './lib/model-router.js';
import { trackConfidence, getConfidence } from './lib/confidence-tracker.js';
import { loadBYOKConfig, saveBYOKConfig, callLLM, generateSetupHTML } from './lib/byok.js';
import { evapPipeline } from './lib/evaporation-pipeline.js';

import { deadbandCheck, deadbandStore, getEfficiencyStats } from './lib/deadband.js';
import { logResponse } from './lib/response-logger.js';

import { storePattern, findSimilar, getNeighborhood, crossRepoTransfer, listPatterns } from './lib/structural-memory.js';
import { exportPatterns, importPatterns, fleetSync } from './lib/cross-cocapn-bridge.js';


const BRAND = '#059669';
const ACCENT = '#d97706';
const NAME = 'ActiveLedger.ai';
const TAGLINE = 'Watch AI manage your portfolio';

const FLEET = { name: NAME, tier: 2, domain: 'finance-trading', fleetVersion: '2.0.0', builtBy: 'Superinstance & Lucineer (DiGennaro et al.)' };

const SEED_DATA = {
  trading: {
    strategies: ['Mean Reversion', 'Momentum', 'Pairs Trading', 'Dollar Cost Average', 'Value Investing', 'Swing Trading', 'Arbitrage'],
    riskManagement: ['Position Sizing (Kelly Criterion)', 'Stop Loss', 'Take Profit', 'Drawdown Limits', 'Correlation Analysis', 'VaR'],
    marketAnalysis: ['Technical Analysis', 'Fundamental Analysis', 'Sentiment Analysis', 'On-Chain Analysis', 'Macro Analysis', 'Sector Rotation'],
    assetClasses: ['Equities', 'Crypto', 'Forex', 'Commodities', 'Fixed Income', 'Options', 'ETFs'],
  },
};

function landingHTML(): string {
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${NAME} — ${TAGLINE}</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Inter',system-ui;background:#0a0a0a;color:#e0e0e0;overflow-x:hidden}
.hero{background:linear-gradient(135deg,#059669,#065f46);padding:3rem 2rem 2rem;text-align:center;position:relative}
.hero::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,.08) 0%,transparent 60%);pointer-events:none}
.hero h1{font-size:2.8rem;background:linear-gradient(90deg,#6ee7b7,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem;font-weight:800}.hero p{color:#a7f3d0;font-size:1.1rem}
.badge{display:inline-block;background:rgba(0,0,0,.2);padding:.4rem 1rem;border-radius:20px;font-size:.8rem;color:#fff;margin-top:1rem}

.demo{max-width:860px;margin:2rem auto;padding:0 1rem}
.demo-label{text-align:center;color:#059669;font-size:.85rem;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:1rem}
.terminal{background:#111;border:1px solid #1f1f1f;border-radius:12px;overflow:hidden;font-family:'JetBrains Mono',monospace;font-size:.82rem;line-height:1.7}
.term-bar{background:#1a1a1a;padding:.6rem 1rem;display:flex;gap:.5rem;align-items:center}
.dot{width:10px;height:10px;border-radius:50%}.r{background:#ff5f57}.y{background:#febc2e}.g{background:#28c840}
.term-title{margin-left:.75rem;color:#555;font-size:.75rem}
.term-body{padding:1rem 1.25rem;max-height:520px;overflow-y:auto}
.msg{margin-bottom:.85rem;animation:fadein .4s ease both}
@keyframes fadein{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
.msg:nth-child(1){animation-delay:.1s}.msg:nth-child(2){animation-delay:.4s}.msg:nth-child(3){animation-delay:.7s}.msg:nth-child(4){animation-delay:1s}.msg:nth-child(5){animation-delay:1.3s}.msg:nth-child(6){animation-delay:1.6s}.msg:nth-child(7){animation-delay:1.9s}.msg:nth-child(8){animation-delay:2.2s}.msg:nth-child(9){animation-delay:2.5s}
.ts{color:#555;font-size:.72rem}
.msg-user{color:#a7f3d0}.msg-user strong{color:#fff}
.msg-agent{color:#34d399}.msg-agent strong{color:#d97706}
.msg-sys{color:#666;font-style:italic}
.msg-alert{color:#f59e0b;padding:.5rem .75rem;background:rgba(245,158,11,.06);border-left:3px solid #f59e0b;border-radius:0 6px 6px 0}
.msg-success{color:#34d399;padding:.5rem .75rem;background:rgba(52,211,153,.06);border-left:3px solid #34d399;border-radius:0 6px 6px 0}
.pie{background:#0d1a14;border:1px solid #1a2f22;border-radius:8px;padding:.75rem 1rem;margin-top:.5rem;font-size:.8rem;line-height:1.8}
.pie-row{display:flex;align-items:center;gap:.5rem}.pie-bar{height:16px;border-radius:3px;min-width:4px}
.trade-block{background:#1a1508;border:1px solid #2f2510;border-radius:8px;padding:.75rem 1rem;margin-top:.5rem;font-size:.8rem}
.trade-row{display:flex;justify-content:space-between;padding:.2rem 0;border-bottom:1px solid #2f2510}.trade-row:last-child{border:none}

.portfolio{max-width:860px;margin:2rem auto;padding:0 1rem}
.portfolio h2{color:#059669;font-size:1.1rem;margin-bottom:1rem}
.alloc-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}
@media(max-width:600px){.alloc-grid{grid-template-columns:1fr}}
.acard{background:#111;border:1px solid #1f1f1f;border-radius:10px;padding:1rem}
.acard h3{color:#d97706;font-size:.8rem;margin-bottom:.5rem;text-transform:uppercase;letter-spacing:1px}
.acard ul{list-style:none;padding:0}.acard li{color:#888;font-size:.78rem;padding:.25rem 0;border-bottom:1px solid #1a1a1a}.acard li:last-child{border:none}
.acard li span{color:#34d399}.acard li .warn{color:#f59e0b}

.byok{max-width:560px;margin:2.5rem auto;padding:0 1rem;text-align:center}
.byok h2{color:#a7f3d0;font-size:1.2rem;margin-bottom:.75rem}
.byok p{color:#666;font-size:.85rem;margin-bottom:1rem}
.byok form{display:flex;gap:.5rem}
.byok input{flex:1;background:#111;border:1px solid #2a2a2a;color:#e0e0e0;padding:.7rem 1rem;border-radius:8px;font-family:'JetBrains Mono',monospace;font-size:.8rem;outline:none}
.byok input:focus{border-color:#059669}
.byok button{background:linear-gradient(135deg,#059669,#d97706);color:#fff;border:none;padding:.7rem 1.5rem;border-radius:8px;font-weight:700;cursor:pointer}

.fork-bar{max-width:860px;margin:2rem auto;padding:0 1rem;display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap}
.fork-bar a{display:inline-flex;align-items:center;gap:.5rem;padding:.6rem 1.2rem;background:#111;border:1px solid #2a2a2a;border-radius:8px;color:#a7f3d0;text-decoration:none;font-size:.85rem;font-weight:600;transition:border-color .2s}
.fork-bar a:hover{border-color:#059669}

.footer{text-align:center;padding:2rem;color:#333;font-size:.75rem;border-top:1px solid #1a1a1a}
</style></head><body>
<div class="hero">
  <h1>${NAME}</h1>
  <p>${TAGLINE}</p>
  <div class="badge">📊 AI Portfolio Manager · BYOK · Fleet Protocol</div>
</div>

<div class="demo">
  <div class="demo-label">⚡ Live Portfolio Analysis</div>
  <div class="terminal">
    <div class="term-bar"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div><div class="term-title">activeledger://portfolio-analysis</div></div>
    <div class="term-body">
      <div class="msg msg-user"><span class="ts">09:01:02</span> <strong>You:</strong> Analyze my portfolio for risk. Here's my current allocation.</div>
      <div class="msg msg-agent"><span class="ts">09:01:05</span> <strong>ActiveLedger Agent:</strong> Scanning portfolio... Running risk analysis across all positions.</div>
      <div class="msg msg-pie"><span class="ts">09:01:08</span> <strong>📊 Current Allocation</strong>
        <div class="pie">
          <div class="pie-row"><div class="pie-bar" style="width:180px;background:#059669"></div><span>NVDA — 45% ($45,000)</span></div>
          <div class="pie-row"><div class="pie-bar" style="width:80px;background:#d97706"></div><span>AAPL — 20% ($20,000)</span></div>
          <div class="pie-row"><div class="pie-bar" style="width:60px;background:#3b82f6"></div><span>MSFT — 15% ($15,000)</span></div>
          <div class="pie-row"><div class="pie-bar" style="width:40px;background:#8b5cf6"></div><span>Bonds — 10% ($10,000)</span></div>
          <div class="pie-row"><div class="pie-bar" style="width:20px;background:#6b7280"></div><span>Cash — 10% ($10,000)</span></div>
        </div>
      </div>
      <div class="msg msg-alert"><span class="ts">09:01:12</span> ⚠ <strong>Concentration Risk Detected:</strong> NVDA at 45% is above the 25% threshold. Single-stock drawdown risk: $9,000+ in a 20% correction. Sector exposure (Tech) is 80% — highly concentrated.</div>
      <div class="msg msg-agent"><span class="ts">09:01:16</span> <strong>Rebalancing Recommendation:</strong> Reduce NVDA to 25%, rotate 20% into diversified ETFs (VTI/SCHD) and increase bond allocation to 15%. This reduces max drawdown by ~35% while maintaining growth exposure.</div>
      <div class="msg msg-trade-block"><span class="ts">09:01:20</span> <strong>📋 Suggested Rebalance Trades</strong>
        <div class="trade-block">
          <div class="trade-row"><span style="color:#f87171">SELL NVDA</span><span>200 shares @ $450</span><span style="color:#d97706">-$20,000</span></div>
          <div class="trade-row"><span style="color:#34d399">BUY VTI</span><span>42 shares @ $270</span><span style="color:#34d399">+$11,340</span></div>
          <div class="trade-row"><span style="color:#34d399">BUY SCHD</span><span>80 shares @ $80</span><span style="color:#34d399">+$6,400</span></div>
          <div class="trade-row"><span style="color:#34d399">BUY BND</span><span>57 shares @ $70</span><span style="color:#34d399">+$3,990</span></div>
        </div>
      </div>
      <div class="msg msg-agent"><span class="ts">09:01:24</span> <strong>Risk Metrics After Rebalance:</strong> Sharpe Ratio improves 0.8→1.2. Max drawdown drops 28%→18%. Tech exposure reduces to 55%. Portfolio beta drops from 1.4 to 1.05.</div>
      <div class="msg msg-success"><span class="ts">09:01:28</span> ✓ Analysis complete. Rebalance plan saved. Would you like me to set price alerts for execution, or simulate different scenarios first?</div>
    </div>
  </div>
</div>

<div class="portfolio">
  <h2>🛡️ Risk Dashboard</h2>
  <div class="alloc-grid">
    <div class="acard"><h3>Current Risk Profile</h3><ul><li>Concentration: <span class="warn">HIGH</span> (45% single stock)</li><li>Sector Risk: <span class="warn">HIGH</span> (80% tech)</li><li>Portfolio Beta: <span class="warn">1.4</span></li><li>Sharpe Ratio: <span>0.8</span></li><li>Max Drawdown Est: <span class="warn">-28%</span></li></ul></div>
    <div class="acard"><h3>After Rebalance</h3><ul><li>Concentration: <span>LOW</span> (25% max)</li><li>Sector Risk: <span>MEDIUM</span> (55% tech)</li><li>Portfolio Beta: <span>1.05</span></li><li>Sharpe Ratio: <span>1.2</span></li><li>Max Drawdown Est: <span>-18%</span></li></ul></div>
  </div>
</div>

<div class="byok">
  <h2>🔑 Bring Your Own Key</h2>
  <p>Add your LLM API key to analyze your own portfolio.</p>
  <form action="/setup" method="get"><input type="text" placeholder="sk-... or your provider key" readonly><button type="submit">Configure</button></form>
</div>

<div class="fork-bar">
  <a href="https://github.com/Lucineer/activeledger-ai" target="_blank">⭐ Star</a>
  <a href="https://github.com/Lucineer/activeledger-ai/fork" target="_blank">🔀 Fork</a>
  <a href="https://github.com/Lucineer/activeledger-ai" target="_blank">📋 git clone https://github.com/Lucineer/activeledger-ai.git</a>
</div>

<div class="footer">${NAME} — Built by Superinstance & Lucineer (DiGennaro et al.) · Part of the Cocapn Fleet</div>
</body></html>`;
}

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);
    const headers = { 'Content-Type': 'text/html;charset=utf-8' };
    const jsonHeaders = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' } });
    }

    if (url.pathname === '/') return new Response(landingHTML(), { headers });
    if (url.pathname === '/api/efficiency') return new Response(JSON.stringify({ totalCached: 0, totalHits: 0, cacheHitRate: 0, tokensSaved: 0, repo: 'activeledger-ai', timestamp: Date.now() }), { headers: { ...cors, 'Content-Type': 'application/json' } });
    if (url.pathname === '/setup') return new Response(generateSetupHTML(NAME, BRAND), { headers });

    if (url.pathname === '/api/seed') {
      return new Response(JSON.stringify({ service: NAME, seed: SEED_DATA, fleet: FLEET }), { headers: jsonHeaders });
    }
    if (url.pathname === '/api/byok/config') {
      if (request.method === 'GET') {
        const config = await loadBYOKConfig(env);
        return new Response(JSON.stringify({ configured: !!config, provider: config?.provider || null }), { headers: jsonHeaders });
      }
      if (request.method === 'POST') {
        const body = await request.json();
        await saveBYOKConfig(env, body);
        return new Response(JSON.stringify({ saved: true }), { headers: jsonHeaders });
      }
    }
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const config = await loadBYOKConfig(env);
        if (!config) return new Response(JSON.stringify({ error: 'No provider configured. Visit /setup' }), { status: 401, headers: jsonHeaders });
        const body = await request.json();
        const messages = [{ role: 'system', content: 'You are ActiveLedger.ai, an AI finance and trading agent.' }, ...(body.messages || [{ role: 'user', content: body.message || '' }])];
        const userMessage = (body.messages || [{ role: 'user', content: body.message || '' }]).map((m) => m.content).join(' ');
        const result = await evapPipeline(env, userMessage, () => callLLM(config.apiKey, messages, config.provider, config.model), 'activeledger-ai');
        return new Response(JSON.stringify({ response: result.response, source: result.source, tokensUsed: result.tokensUsed }), { headers: jsonHeaders });
      } catch (e: any) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: jsonHeaders }); }
    }
    if (url.pathname === '/api/portfolio') {
      return new Response(JSON.stringify({ service: NAME, portfolio: [], message: 'Portfolio management — coming soon' }), { headers: jsonHeaders });
    }
    if (url.pathname === '/api/trades') {
      return new Response(JSON.stringify({ service: NAME, trades: [], message: 'Trade execution — coming soon' }), { headers: jsonHeaders });
    }
    if (url.pathname === '/api/market') {
      return new Response(JSON.stringify({ service: NAME, endpoint: '/api/market', message: 'Market data — coming soon' }), { headers: jsonHeaders });
    }
    if (url.pathname === '/api/agents') {
      return new Response(JSON.stringify({ service: NAME, endpoint: '/api/agents', message: 'Trading repo-agent management — coming soon' }), { headers: jsonHeaders });
    }

    if (url.pathname === '/api/confidence') {
      const scores = await getConfidence(env);
      return new Response(JSON.stringify(scores), { headers: jsonHeaders });
    }
    // ── Phase 4: Structural Memory Routes ──
    if (url.pathname === '/api/memory' && request.method === 'GET') {
      const source = url.searchParams.get('source') || undefined;
      const patterns = await listPatterns(env, source);
      return new Response(JSON.stringify(patterns), { headers: jsonHeaders });
    }
    if (url.pathname === '/api/memory' && request.method === 'POST') {
      const body = await request.json();
      await storePattern(env, body);
      return new Response(JSON.stringify({ ok: true, id: body.id }), { headers: jsonHeaders });
    }
    if (url.pathname === '/api/memory/similar') {
      const structure = url.searchParams.get('structure') || '';
      const threshold = parseFloat(url.searchParams.get('threshold') || '0.7');
      const similar = await findSimilar(env, structure, threshold);
      return new Response(JSON.stringify(similar), { headers: jsonHeaders });
    }
    if (url.pathname === '/api/memory/transfer') {
      const fromRepo = url.searchParams.get('from') || '';
      const toRepo = url.searchParams.get('to') || '';
      const problem = url.searchParams.get('problem') || '';
      const transfers = await crossRepoTransfer(env, fromRepo, toRepo, problem);
      return new Response(JSON.stringify(transfers), { headers: jsonHeaders });
    }
    if (url.pathname === '/api/memory/sync' && request.method === 'POST') {
      const body = await request.json();
      const repos = body.repos || [];
      const result = await fleetSync(env, repos);
      return new Response(JSON.stringify(result), { headers: jsonHeaders });
    }

    return new Response('{"error":"Not Found"}', { status: 404, headers: jsonHeaders });
  },
};