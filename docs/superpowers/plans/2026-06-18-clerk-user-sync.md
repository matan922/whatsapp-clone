# Clerk User Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync Clerk-authenticated users into MongoDB on first API request, and attach the Clerk JWT automatically to every frontend API call.

**Architecture:** The frontend axios client gets a request interceptor that fetches the Clerk JWT and injects it as a Bearer token. The backend has a `requireAuth` middleware that verifies the JWT with `@clerk/backend`, upserts the user in MongoDB (pulling displayName and avatar from Clerk claims), and attaches the DB user to `req.user`.

**Tech Stack:** `@clerk/backend` (JWT verification), Mongoose (upsert), axios interceptors (`@clerk/react` `useAuth`), Express 5, TypeScript

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `backend/src/models/User.ts` | Modify | Add `displayName`, `avatar`, `phoneNumber` fields |
| `backend/src/middleware/requireAuth.ts` | Create | Verify JWT, upsert user, attach to `req.user` |
| `backend/src/index.ts` | Modify | Apply `requireAuth` to protected routes |
| `backend/src/types/express.d.ts` | Create | Extend Express `Request` with `user` field |
| `frontend/src/services/apiClient.ts` | Modify | Add axios interceptor to attach Clerk JWT |
| `frontend/src/components/AuthenticatedApp.tsx` | Create | Wrapper component that sets up the interceptor |
| `frontend/src/App.tsx` | Modify | Wrap protected routes in `AuthenticatedApp` |

---

### Task 1: Install `@clerk/backend` on the backend

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Install the package**

Run in `backend/`:
```bash
npm install @clerk/backend
```

Expected output: `added N packages` with `@clerk/backend` listed.

- [ ] **Step 2: Verify it's in dependencies**

Open `backend/package.json` and confirm `"@clerk/backend"` appears under `"dependencies"`.

- [ ] **Step 3: Ensure CLERK_SECRET_KEY is in your .env**

Your `backend/.env` must contain:
```
CLERK_SECRET_KEY=sk_test_your_key_here
```

Get this from your Clerk dashboard → API Keys. The `verifyToken` call will fail without it.

---

### Task 2: Extend the User model

**Files:**
- Modify: `backend/src/models/User.ts`

- [ ] **Step 1: Update the schema**

Replace the full contents of `backend/src/models/User.ts` with:

```typescript
import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    clerkId: {
        type: String,
        required: true,
        unique: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "",
    },
    phoneNumber: {
        type: String,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.model("User", userSchema);
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/models/User.ts
git commit -m "feat: add displayName, avatar, phoneNumber to User model"
```

---

### Task 3: Create the Express type extension

**Files:**
- Create: `backend/src/types/express.d.ts`

This is needed so TypeScript knows `req.user` exists on Express requests.

- [ ] **Step 1: Create the types file**

Create `backend/src/types/express.d.ts` with:

```typescript
import { Document } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user?: Document & {
                _id: unknown;
                clerkId: string;
                displayName: string;
                avatar: string;
                phoneNumber: string | null;
                createdAt: Date;
            };
        }
    }
}
```

- [ ] **Step 2: Ensure tsconfig includes it**

Open `backend/tsconfig.json` and confirm `"include"` covers `"src/**/*"`. If it does, the new file is automatically picked up. No change needed.

- [ ] **Step 3: Commit**

```bash
git add backend/src/types/express.d.ts
git commit -m "chore: extend Express Request type with user field"
```

---

### Task 4: Create the `requireAuth` middleware

**Files:**
- Create: `backend/src/middleware/requireAuth.ts`

- [ ] **Step 1: Create the middleware file**

Create `backend/src/middleware/requireAuth.ts` with:

```typescript
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@clerk/backend";
import User from "../models/User.js";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        const clerkId = payload.sub;
        const displayName = `${payload.given_name ?? ""} ${payload.family_name ?? ""}`.trim()
            || (payload.username as string | undefined)
            || "User";
        const avatar = (payload.image_url as string | undefined) ?? "";

        const user = await User.findOneAndUpdate(
            { clerkId },
            { $setOnInsert: { clerkId, displayName, avatar, phoneNumber: null } },
            { upsert: true, new: true }
        );

        req.user = user!;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/middleware/requireAuth.ts
git commit -m "feat: add requireAuth middleware with Clerk JWT verification and user upsert"
```

---

### Task 5: Apply `requireAuth` in the Express app

**Files:**
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Import and apply the middleware**

Replace the full contents of `backend/src/index.ts` with:

```typescript
import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from './config/db.js';
import { requireAuth } from './middleware/requireAuth.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Public routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Protected routes — all routes below require a valid Clerk JWT
app.use(requireAuth);

// TODO: add protected routes here (e.g. app.use('/api/messages', messagesRouter))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

- [ ] **Step 2: Test the middleware manually**

Start the backend:
```bash
npm run dev
```

Hit the health endpoint (should work without auth):
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"ok"}`

Hit a protected route without a token (add a temp route above `app.listen` to test):
```typescript
app.get("/api/me", (req, res) => { res.json(req.user); });
```
```bash
curl http://localhost:5000/api/me
```
Expected: `{"error":"Unauthorized"}`

- [ ] **Step 3: Commit**

```bash
git add backend/src/index.ts
git commit -m "feat: apply requireAuth middleware to all protected routes"
```

---

### Task 6: Add the Clerk JWT interceptor to the frontend

**Files:**
- Create: `frontend/src/components/AuthenticatedApp.tsx`
- Modify: `frontend/src/services/apiClient.ts`
- Modify: `frontend/src/App.tsx`

The interceptor needs `useAuth` from Clerk, which requires a React component. We create a wrapper `AuthenticatedApp` that registers the interceptor once on mount and wraps all routes that need auth.

- [ ] **Step 1: Update `apiClient.ts` to export an interceptor setter**

Replace the full contents of `frontend/src/services/apiClient.ts` with:

```typescript
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/";

export const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const setAuthInterceptor = (getToken: () => Promise<string | null>) => {
    api.interceptors.request.use(async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });
};
```

- [ ] **Step 2: Create `AuthenticatedApp.tsx`**

Create `frontend/src/components/AuthenticatedApp.tsx` with:

```typescript
import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setAuthInterceptor } from "../services/apiClient";
import { Outlet } from "react-router";

const AuthenticatedApp = () => {
    const { getToken } = useAuth();

    useEffect(() => {
        setAuthInterceptor(getToken);
    }, [getToken]);

    return <Outlet />;
};

export default AuthenticatedApp;
```

- [ ] **Step 3: Update `App.tsx` to wrap protected routes**

Replace the full contents of `frontend/src/App.tsx` with:

```typescript
import { Route, Routes } from "react-router";
import LoginPage from "./pages/authentication/LoginPage";
import RegisterPage from "./pages/authentication/RegisterPage";
import MainPage from "./pages/main/MainPage";
import SSOCallbackPage from "./pages/authentication/SSOCallbackPage";
import AuthenticatedApp from "./components/AuthenticatedApp";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/sso-callback" element={<SSOCallbackPage />} />
      <Route element={<AuthenticatedApp />}>
        <Route path="/main" element={<MainPage />} />
      </Route>
    </Routes>
  );
}

export default App;
```

- [ ] **Step 4: Verify the interceptor works**

Start both frontend and backend. Sign in via Clerk and navigate to `/main`. Open browser DevTools → Network tab. Find any API request to `localhost:5000` — it should have an `Authorization: Bearer eyJ...` header.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/apiClient.ts frontend/src/components/AuthenticatedApp.tsx frontend/src/App.tsx
git commit -m "feat: attach Clerk JWT to all API requests via axios interceptor"
```

---

### Task 7: End-to-end verification

- [ ] **Step 1: Add a `/api/me` route to the backend temporarily**

In `backend/src/index.ts`, after `app.use(requireAuth)`, add:

```typescript
app.get("/api/me", (req, res) => {
    res.json(req.user);
});
```

- [ ] **Step 2: Register a new user via the frontend**

Go to `http://localhost:5173/register`, register a new account, verify email, and land on `/main`.

- [ ] **Step 3: Check MongoDB**

In MongoDB Compass (or `mongosh`), check your `users` collection:
```
db.users.find()
```
Expected: one document with `clerkId`, `displayName`, `avatar` populated.

- [ ] **Step 4: Call `/api/me` from the browser**

In the browser console on `/main`:
```javascript
fetch('http://localhost:5000/api/me', {
  headers: { Authorization: `Bearer ${await window.Clerk.session.getToken()}` }
}).then(r => r.json()).then(console.log)
```
Expected: the user document from MongoDB.

- [ ] **Step 5: Remove the temp `/api/me` route and commit**

```bash
git add backend/src/index.ts
git commit -m "chore: remove temp /api/me debug route"
```
