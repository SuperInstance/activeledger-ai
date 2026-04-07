<p align="center">
  <img src="https://raw.githubusercontent.com/Lucineer/capitaine/master/docs/capitaine-logo.jpg" alt="Capitaine" width="120">
</p>

<h1 align="center">activeledger-ai</h1>

<p align="center">A fork-first agent for personal portfolio tracking and financial analysis.</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#features">Features</a> ·
  <a href="#limitations">Limitations</a> ·
  <a href="https://github.com/Lucineer/activeledger-ai/issues">Issues</a>
</p>

---

A repository that is also an agent. You fork it, deploy it on your Cloudflare account, and it runs autonomously for you. It does not share your data or backend with anyone else.

### What this is for
This is built for personal financial tracking. Most finance tools are services that can change, charge more, or shut down. This code runs on your infrastructure, focused on basic ledger tracking and analysis without external product recommendations.

### What makes it different
1.  **Fork-first** — You deploy your own instance from this repository. Your data stays within your Cloudflare Workers environment.
2.  **The repo is the agent** — All logic, state management, and memory are defined in the source code you can read and modify.
3.  **Fleet-native** — It can communicate and verify data with other vessels in the Cocapn fleet using a standard protocol.
4.  **Low-cost operation** — Designed to fit within Cloudflare Worker's free tier for typical personal use.

---

## Quick Start

```bash
# Fork and clone the repository
gh repo fork Lucineer/activeledger-ai --clone
cd activeledger-ai

# Set required API keys as secrets
npx wrangler secret put DEEPSEEK_API_KEY

# Deploy to your Cloudflare account
npx wrangler deploy
```

Your agent will be live at the generated `.workers.dev` URL.

## Features

- **Credential Management** — API keys are stored in Cloudflare Secrets, not in source code.
- **Multi-Model Support** — Configured to work with DeepSeek, SiliconFlow, and other compatible LLM APIs.
- **Session Context** — Maintains conversation history within a user session.
- **Basic PII Filtering** — Includes patterns to redact common sensitive data strings before LLM processing.
- **Rate Limiting** — Built-in per-IP request limiting for public endpoints.
- **Fleet Protocol** — Implements standard health checks and can communicate with other fleet vessels.

## Architecture

A single Cloudflare Worker with modular internal libraries.
```
src/worker.ts    # Main request handler and fleet endpoint
lib/byok.ts      # Manages LLM API calls and routing
lib/ledger.ts    # Core logic for transaction tracking
lib/memory.ts    # Handles conversation and context state
```

## Limitations

This is a tool for personal tracking and analysis. It does not provide certified financial, tax, or investment advice. The built-in PII filtering is a basic pattern match and should not be solely relied upon for regulatory compliance.

---

<div align="center">
  Part of the <a href="https://the-fleet.casey-digennaro.workers.dev">Cocapn Fleet</a> · <a href="https://cocapn.ai">Cocapn</a><br>
  <sub>Superinstance & Lucineer (DiGennaro et al.)</sub>
</div>