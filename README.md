# ActiveLedger.ai — Finance-Focused Repo-Agents

AI trading agents, portfolio tracking, and market analysis powered by multi-provider BYOK.

## Deploy

```bash
npm install
wrangler kv:namespace create KV
# Update wrangler.toml with the namespace ID
wrangler deploy
```

## Routes

- `/` — Landing page
- `/health` — Health check
- `/setup` — BYOK provider setup wizard
- `/api/chat` — AI chat (requires BYOK config)
- `/api/portfolio` — Portfolio tracking
- `/api/trades` — Trade execution
- `/api/agents` — Trading repo-agents
- `/api/market` — Market analysis

## BYOK

Visit `/setup` to configure your AI provider (OpenAI, Anthropic, DeepSeek, Groq, etc.).
