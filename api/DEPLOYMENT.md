# API deployment contract

The SDK endpoint is only considered public after this command succeeds:

```bash
API_BASE_URL=https://api.digital-nomad.cn npm run verify:api
```

Deploy the Worker with a Cloudflare account that has `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` configured as GitHub Actions secrets. The manual
`Deploy API` workflow type-checks and deploys the Worker, then runs the same
health check. Until that check passes, documentation must describe the public
API endpoint as **unverified**.
