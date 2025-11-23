# CarbonLedger – Auditor Portal Added

Includes:
- **Auditor login** (calls `POST /auth/login` with `{ email, password, role: 'auditor' }`)
- **Protected routes** under `/auditor/*`
- Pages: Auditor Dashboard, My Clients, Marketplace
- Uses Axios client with bearer token, saved in localStorage
- Works with or without backend (demo data used if `VITE_API_URL` not set)

## Run
```bash
npm install
npm run dev
```
Set your backend URLs:
```
VITE_API_URL=http://localhost:8000
```


**Tip:** If you can't login yet, keep `VITE_USE_DEMO_AUTH=true` in `.env` to bypass backend and test the flow. Set it to `false` once your API is ready.


## Troubleshooting auditor login
1. Keep demo auth on first: set `VITE_USE_DEMO_AUTH=true` (or leave `VITE_API_URL` empty) → any email/password works.
2. For real backend:
   - Set `VITE_API_URL=http://localhost:8000` (your base URL).
   - If your path isn't `/auth/login`, set `VITE_AUTH_LOGIN_PATH=/api/login` (or whatever).
   - Check DevTools → Network → the login request, and copy the response JSON if it fails.
