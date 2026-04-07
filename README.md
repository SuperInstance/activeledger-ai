# ActiveLedger.ai

Run a private portfolio analysis agent. A Cocapn Fleet vessel.

You host this agent 100% on your own Cloudflare account. It makes direct LLM calls with your API key. No third-party servers handle your portfolio data. Open source, MIT license, zero runtime dependencies. Fork-first software.

---

## Why This Exists
Most portfolio trackers sell your trading data or lock you into rigid dashboards. This agent was built to be a private, extensible tool that adapts to your strategy, not a platform's. You own every part of it.

## What Makes This Different
1.  **Private Execution:** All LLM calls run directly from your Cloudflare Worker with your API key. Your portfolio data never passes through a shared service.
2.  **Personalized Analysis:** It builds a persistent knowledge graph based on your specific assets, risk rules, and trade history, enabling more relevant pattern recognition over time.
3.  **Agent Communication:** It can use the Fleet protocol to cross-verify signals with other trusted agents you run, without sharing your actual holdings.

---

## Quick Start
1.  **Fork this repository.** This gives you the full, unmodified codebase to own and modify.
2.  Deploy to your Cloudflare account:
    ```bash
    gh repo fork Lucineer/activeledger-ai --clone
    cd activeledger-ai
    npx wrangler secret put DEEPSEEK_API_KEY
    npx wrangler deploy
    ```
3.  Edit the seed prompts in `src/worker.ts` to reflect your portfolio, risk tolerance, and strategies.

Your agent will be live at your own `.workers.dev` address.

**Demo:** [https://activeledger-ai.casey-digennaro.workers.dev](https://activeledger-ai.casey-digennaro.workers.dev)

## Features
- Portfolio-focused knowledge graph preloaded with trading and risk management concepts.
- Memory system that connects analysis patterns across your sessions using structural similarity.
- Bring-your-own-key LLM routing: compatible with DeepSeek, SiliconFlow, OpenRouter, and similar providers.
- Fleet protocol support for trusted, privacy-preserving communication between your agents.
- Confidence scoring on analytical outputs.
- Dead-band logic to skip processing when portfolio inputs haven't changed meaningfully.
- Automated pruning of stale, low-confidence nodes from the knowledge graph.

## Architecture
A single Cloudflare Worker. Request state is handled in memory. Long-term pattern data is persisted only to your Cloudflare KV namespace. No external services are required beyond your chosen LLM provider.

## A Specific Limitation
The knowledge graph is stored in Cloudflare KV, which has a 1GB limit per namespace and lacks complex querying. Graph traversal is linear, so performance can degrade noticeably beyond a few thousand nodes.

---
Superinstance and Lucineer (DiGennaro et al.)

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>