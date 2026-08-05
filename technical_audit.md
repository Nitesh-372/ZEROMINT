# ZEROMINT — Technical Audit Report

> **Total issues found: 35+**
> Audited every source file across all 3 layers (contracts, backend, frontend).

---

## 🔴 CRITICAL — App Will Crash / Not Work

### 1. `projectController.js` has a fatal syntax error — broken function boundary

[projectController.js:30-36](file:///d:/project/zero/Backend/src/controllers/projectController.js#L30-L36)

The `createProject` function is **never closed**. The closing `}` for the `try` and the function's `catch` block are missing. Then `getAssignedProjects` starts mid-function. **This file will throw a syntax error and crash the backend.**

```js
// Line 30-35: This is supposed to close createProject, but doesn't:
return res.json({
    msg: "Project created & registered on blockchain",
    project: proj
});

// Line 36: This starts INSIDE the broken createProject function!
exports.getAssignedProjects = async (req,res)=>{
```

> [!CAUTION]
> The entire backend will fail to start because of this syntax error. No routes will work.

---

### 2. `AddProject.jsx` references undefined variables — `title`, `description`, `creditsRequested`

[AddProject.jsx:28-33](file:///d:/project/zero/frontend/src/pages/AddProject.jsx#L28-L33)

The component defines state as `name`, `description`, `credits` — but the `client.post` call uses `title`, `description`, `creditsRequested` which are **not defined variables**. Also the FormData built above is completely ignored — a second raw JSON request is sent instead.

```js
// Line 28-33: title and creditsRequested are never declared!
const { data } = await client.post("/projects", {
    title,              // ❌ undefined — should be `name`
    description,
    creditsRequested,   // ❌ undefined — should be `credits`
    ownerWallet: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
})
```

The FormData built on lines 19-26 is discarded. This is **dead code** — the actual request sends raw JSON, not multipart form data.

---

### 3. `.env` file contains invalid JavaScript syntax

[Backend/.env:8](file:///d:/project/zero/Backend/.env#L8)

```
export const BASE_URL = import.meta.env.VITE_API_URL;
```

This is **JavaScript code** accidentally pasted into a `.env` file. `dotenv` will parse this as an environment variable named `export` (with an invalid value), or cause parse errors. This doesn't belong here.

---

### 4. `blockchainService.js` calls functions that don't exist on the smart contract

[blockchainService.js:27-50](file:///d:/project/zero/Backend/src/services/blockchainService.js#L27-L50)

```js
// Line 27: This function doesn't exist in CarbonRegistry.sol!
await registryContract.registerProject(owner, ipfsHash, credits);

// Line 46: Also doesn't exist! The contract has verifyProject(projectId, approvedCredits)
await registryContract.verifyProject(projectId);

// Line 50: This doesn't exist either!
await registryContract.issueCredits(owner, credits);
```

The actual contract functions are:
- `submitProject(_metaDataURI, _projectType, _requestedCredits)` — not `registerProject`
- `verifyProject(_projectId, _approvedCredits)` — takes 2 params, not 1
- There is **no** `issueCredits` — minting happens inside `verifyProject`

> [!CAUTION]
> Every blockchain transaction from the backend will fail with "function not found" errors.

---

### 5. `projectRoutes.js` — route registered AFTER `module.exports`

[projectRoutes.js:9-10](file:///d:/project/zero/Backend/src/routes/projectRoutes.js#L9-L10)

```js
module.exports = router;                                              // Line 9
router.post('/:projectId/hire-auditor', protect, projectController.hireAuditor);  // Line 10
```

The `hire-auditor` route is added **after** `module.exports`. While this technically works in CommonJS (the router object is shared by reference), it's a code smell that suggests copy-paste error and makes the code very confusing. The route order also matters — it should be before the export.

---

## 🟠 HIGH — Logic Bugs / Security Issues

### 6. User login does NOT actually authenticate — just redirects

[Login.jsx:20-23](file:///d:/project/zero/frontend/src/pages/Login.jsx#L20-L23)

```js
} else {
  // demo user redirect
  window.location.href = '/dashboard'   // ❌ No API call, no token, no auth!
}
```

When role is "User", the login form **doesn't call any API**. It just does a hard redirect to `/dashboard`. The user is never authenticated, no JWT is stored, and no token is set. Every protected API call will fail with 401.

---

### 7. AuthContext only supports auditor login — no user login function

[AuthContext.jsx:20-26](file:///d:/project/zero/frontend/src/context/AuthContext.jsx#L20-L26)

The `AuthContext` only has `loginAuditor()`. There is **no `loginUser()` function**. The `Login.jsx` page never calls any auth function for users, and even if it did, there's nothing to call.

---

### 8. No auth protection on User portal routes

[App.jsx:24-31](file:///d:/project/zero/frontend/src/App.jsx#L24-L31)

The auditor portal has `RequireAuditor` guard, but user routes (`/dashboard`, `/add-project`, `/my-projects`, etc.) have **zero auth protection**. Anyone can navigate directly to these URLs without logging in.

---

### 9. Security: Anyone can register as admin

[authController.js:7-13](file:///d:/project/zero/Backend/src/controllers/authController.js#L7-L13)

```js
const { name, email, password, role } = req.body;  // role comes from client!
user = new User({ name, email, passwordHash, role });
```

The `role` is taken directly from the request body. A malicious user can send `"role": "admin"` and get admin privileges. The frontend enforces `role: 'user'` but the API doesn't validate.

---

### 10. No auditor role check on audit routes

[auditorRoutes.js:6-8](file:///d:/project/zero/Backend/src/routes/auditorRoutes.js#L6-L8)

The auditor routes use `protect` middleware (JWT check) but **don't verify the user's role is `auditor`**. Any authenticated user can approve or reject projects.

---

### 11. `adminController.js` has no route and no auth protection

[adminController.js](file:///d:/project/zero/Backend/src/controllers/adminController.js) exists but there's **no admin route file** — it's never wired up in [app.js](file:///d:/project/zero/Backend/src/app.js). The `addAuditor` function is unreachable. Also, even if wired, there's no admin role check.

---

### 12. Private key exposed in `.env` committed to git

[Backend/.env:5](file:///d:/project/zero/Backend/.env#L5)

```
ADMIN_PRIVATE_KEY= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

This is the Hardhat account #0 default private key (so low risk since it's a well-known test key), but the `.env` file has no `.gitignore` protection. If any real private key is put here, it gets committed to git.

> [!WARNING]
> There is no `.gitignore` file in the project root. All `.env` files, `node_modules`, and build artifacts could be committed.

---

### 13. `uploads` directory doesn't exist — file uploads will crash

[upload.js:5](file:///d:/project/zero/Backend/src/middleware/upload.js#L5)

```js
destination: function (req, file, cb) { cb(null, 'src/uploads/'); }
```

The directory `src/uploads/` does not exist in the project. Multer will throw `ENOENT` when trying to save uploaded files.

---

## 🟡 MEDIUM — Mismatches / Missing Features

### 14. Backend form field names don't match frontend

The backend [projectController.js:7](file:///d:/project/zero/Backend/src/controllers/projectController.js#L7) expects:
```js
const { type, title, description, creditsRequested } = req.body;
```

But the frontend [AddProject.jsx:19-25](file:///d:/project/zero/frontend/src/pages/AddProject.jsx#L19-L25) sends:
```js
formData.append("projectType", type);    // backend expects "type"
formData.append("projectName", name);    // backend expects "title"
```

Even if the FormData code was used (it's not — see issue #2), the field names are wrong.

---

### 15. Frontend API base URL has `/api` baked in — backend routes double-prefix

[Frontend .env](file:///d:/project/zero/frontend/.env):
```
VITE_API_URL=http://localhost:5000/api
```

[api.js:2](file:///d:/project/zero/frontend/src/utils/api.js#L2):
```js
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
```

But then API calls do:
```js
await client.post('/auditor/projects/${id}/approve')  // → http://localhost:5000/api/auditor/projects/...
```

Meanwhile [app.js:19](file:///d:/project/zero/Backend/src/app.js#L19):
```js
app.use('/api/audit', auditorRoutes);  // actual path: /api/audit/...
```

So the frontend calls `/api/auditor/projects/...` but the backend expects `/api/audit/:projectId/approve`. **Paths don't match.**

---

### 16. Frontend approve/reject API paths don't match backend routes

[Frontend api.js:140](file:///d:/project/zero/frontend/src/utils/api.js#L140):
```js
client.post(`/auditor/projects/${id}/approve`)
```

[Backend auditorRoutes.js:7](file:///d:/project/zero/Backend/src/routes/auditorRoutes.js#L7):
```js
router.post('/:projectId/approve', ...)
// Full path: /api/audit/:projectId/approve
```

Frontend sends → `/api/auditor/projects/:id/approve`
Backend expects → `/api/audit/:projectId/approve`

**These will never match.**

---

### 17. `fetchNotifications` checks `if(!API)` — always truthy

[api.js:27](file:///d:/project/zero/frontend/src/utils/api.js#L27):
```js
if(!API) {
  return [ /* demo data */ ]
}
```

`API` is always `"http://localhost:5000/api"` (from `.env`). So `!API` is always `false`, and demo data never returns. But the backend has **no `/api/notifications` endpoint** — so this will always fail with a 404.

---

### 18. `registerUserAPI` response check is wrong

[api.js:93-107](file:///d:/project/zero/frontend/src/utils/api.js#L93-L107):

Uses raw `fetch()` instead of `axios` (`client`). The backend [authController.js](file:///d:/project/zero/Backend/src/controllers/authController.js) returns `{ token, user }` on success — there's no `ok` field. So `res?.ok` in the Register page (`if (res?.ok)`) will never be truthy when using the real API response (unless `fetch` response `.ok` is checked before parsing).

Actually, the raw `fetch` response object has `.ok` for HTTP status, but then `await res.json()` returns the body which has `{token, user}` — no `ok` property. So the Register page line `if (res?.ok)` checks the wrong thing.

---

### 19. Dashboard, MyProjects, Marketplace, HireAuditor — all use hardcoded data

These pages use **zero API calls** — everything is hardcoded:

| Page | Issue |
|------|-------|
| [Dashboard.jsx](file:///d:/project/zero/frontend/src/pages/Dashboard.jsx) | Stats are hardcoded: "520", "8", "3", "1" |
| [MyProjects.jsx](file:///d:/project/zero/frontend/src/pages/MyProjects.jsx) | Project list is a hardcoded array |
| [Marketplace.jsx](file:///d:/project/zero/frontend/src/pages/Marketplace.jsx) | Items are hardcoded, Buy button does nothing |
| [HireAuditor.jsx](file:///d:/project/zero/frontend/src/pages/HireAuditor.jsx) | Auditors are hardcoded, Hire button does nothing |

---

### 20. Backend marketplace is completely disconnected from blockchain

[marketplaceController.js](file:///d:/project/zero/Backend/src/controllers/marketplaceController.js) does DB-only operations (ownership transfer in MongoDB). The `CarbonMarketplace.sol` smart contract with its escrow, ETH payments, and fee system is **never called from the backend**. The on-chain and off-chain marketplaces are completely separate.

---

### 21. Smart contract ABI mismatch

The backend loads [CarbonRegistry.json](file:///d:/project/zero/Backend/src/contracts/CarbonRegistry.json) for its ABI. But the functions called in `blockchainService.js` (`registerProject`, `issueCredits`) don't exist in the actual Solidity contract. Either:
- The ABI JSON is from an older/different version of the contract, or
- The service was written against a different contract interface

---

### 22. No backend endpoint for fetching projects by user

The backend has `createProject` and `hireAuditor` but **no endpoint to GET a user's projects**. The frontend's `MyProjects.jsx` would need `GET /api/projects?owner=...` or similar, which doesn't exist.

---

### 23. Missing backend endpoints that frontend expects

| Frontend calls | Backend has? |
|---------------|-------------|
| `GET /notifications` | ❌ No endpoint |
| `POST /notifications/mark-all-read` | ❌ No endpoint |
| `GET /auditor/dashboard` | ❌ No endpoint (has `/api/audit/assigned`) |
| `GET /auditor/clients` | ❌ No endpoint |
| `GET /marketplace` | ❌ No endpoint (has `/api/market/list` as POST) |
| `GET /api/projects` (user's projects) | ❌ No endpoint |

---

### 24. WebSocket service (`ws.js`) — no backend WebSocket server

[ws.js](file:///d:/project/zero/frontend/src/utils/ws.js) expects a `VITE_WS_URL` for real-time notifications, but the backend is a plain Express HTTP server with **no WebSocket support** (no `ws`, `socket.io`, or similar).

---

## 🔵 LOW — Code Quality / Minor Issues

### 25. Duplicate variable declarations in `api.js`

[api.js:3,5](file:///d:/project/zero/frontend/src/utils/api.js#L3-L5):
```js
const USE_DEMO = (import.meta.env.VITE_USE_DEMO_AUTH ?? 'true') === 'true'
// ...
const DEMO = (import.meta.env.VITE_USE_DEMO_AUTH ?? 'true') === 'true'  // exact same thing
```

`USE_DEMO` and `DEMO` are identical. One is used in `loginAuditorAPI`, the other in `registerUserAPI`.

---

### 26. Login uses `window.location.href` instead of React Router

[Login.jsx:19,22](file:///d:/project/zero/frontend/src/pages/Login.jsx#L19-L22):
```js
window.location.href = '/auditor/dashboard'  // full page reload
window.location.href = '/dashboard'          // full page reload
```

This causes a **full page reload**, losing all React state (including the just-set auth token in AuthContext). Should use `useNavigate()` from React Router.

---

### 27. `auth.js` middleware doesn't handle null user

[auth.js:9](file:///d:/project/zero/Backend/src/middleware/auth.js#L9):
```js
req.user = await User.findById(decoded.id).select('-passwordHash');
next();
```

If the user was deleted after the JWT was issued, `req.user` will be `null`. Downstream controllers will crash with "Cannot read properties of null".

---

### 28. No file type/size validation on uploads

[upload.js](file:///d:/project/zero/Backend/src/middleware/upload.js) accepts **any file type** and **any file size**. No `fileFilter` or `limits` configured. Users could upload executables, huge files, etc.

---

### 29. `CreditChart.jsx` — hardcoded data, no responsiveness

[CreditChart.jsx](file:///d:/project/zero/frontend/src/components/CreditChart.jsx) renders a hand-rolled SVG chart with hardcoded data points `[50,120,220,300,380,460,560]`. No real data is ever fetched.

---

### 30. No error handling for blockchain service initialization

[blockchainService.js:13-21](file:///d:/project/zero/Backend/src/services/blockchainService.js#L13-L21):

If `RPC_URL` or `ADMIN_PRIVATE_KEY` or `REGISTRY_CONTRACT_ADDRESS` are not set in `.env`, the module will crash on import with unhelpful errors. No validation or graceful fallback.

---

### 31. `projectController.js` missing `blockchainService` import

[projectController.js:20](file:///d:/project/zero/Backend/src/controllers/projectController.js#L20):
```js
await blockchainService.registerProjectOnChain(...)
```

But `blockchainService` is **never imported** in this file. It's imported in `auditorController.js` but not here. This will throw `ReferenceError: blockchainService is not defined`.

---

### 32. `ADMIN_PRIVATE_KEY` has a leading space

[Backend/.env:5](file:///d:/project/zero/Backend/.env#L5):
```
ADMIN_PRIVATE_KEY= 0xac0974bec...
```

There's a **space** between `=` and the key. `dotenv` will include the space, making the key ` 0xac09...` (with leading space), which will cause ethers.js to throw "invalid private key".

---

### 33. Deploy script uses ethers v5 API, package has ethers v5, but backend uses ethers v6

| Location | ethers version | API style |
|----------|---------------|-----------|
| [contract/package.json](file:///d:/project/zero/contract/package.json) | `^5.8.0` | v5: `deployed()`, `utils.keccak256` |
| [Backend/package.json](file:///d:/project/zero/Backend/package.json) | `^6.15.0` | v6: `JsonRpcProvider` |

This is fine (separate packages), but the `blockchainService.js` must be tested against the actual deployed contract, which uses v5-style deployment.

---

### 34. `AppShell.jsx` layout is unused

[AppShell.jsx](file:///d:/project/zero/frontend/src/layouts/AppShell.jsx) exists but is never imported or used anywhere.

---

### 35. No `.gitignore` file

The project has no `.gitignore`. This means `node_modules/`, `.env`, `cache/`, `artifacts/`, build outputs, and other generated files could all be committed to git.

---

## Summary by Severity

| Severity | Count | Impact |
|----------|-------|--------|
| 🔴 **CRITICAL** | 5 | App won't start / crashes at runtime |
| 🟠 **HIGH** | 8 | Security holes, auth bypasses, missing logic |
| 🟡 **MEDIUM** | 11 | Features don't work, API mismatches |
| 🔵 **LOW** | 11 | Code quality, minor bugs |
| **Total** | **35** | |

---

## Top Priority Fixes (in order)

1. **Fix `projectController.js` syntax** — backend won't start without this
2. **Fix `AddProject.jsx`** — remove duplicate request, use correct variable names
3. **Fix `.env`** — remove JS line, fix space in private key
4. **Fix `blockchainService.js`** — match actual contract function signatures
5. **Add user login flow** — `AuthContext` + `Login.jsx` for user role
6. **Add route protection** for user portal routes
7. **Add role validation** on server — don't trust client-sent `role`
8. **Fix API path mismatches** between frontend and backend
9. **Create missing backend endpoints** (notifications, dashboard, clients, marketplace GET)
10. **Connect frontend pages to real API** instead of hardcoded data
