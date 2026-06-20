# Clerk User Sync Design

**Date:** 2026-06-18  
**Status:** Approved

## Overview

After a user registers or signs in via Clerk on the frontend, the backend needs to know who they are so it can associate messages and conversations with a real MongoDB user. We use an on-first-request sync approach: the frontend attaches a Clerk JWT to every API request, the backend verifies it and upserts the user in MongoDB automatically.

## 1. User Model

Extend `backend/src/models/User.ts`:

| Field | Type | Source |
|---|---|---|
| `clerkId` | String, required, unique | Clerk JWT `sub` claim |
| `displayName` | String, required | Clerk `firstName + lastName` or `username` |
| `avatar` | String | Clerk `imageUrl` |
| `phoneNumber` | String, optional | User-provided later |
| `createdAt` | Date | Auto |

## 2. Backend Auth Middleware

File: `backend/src/middleware/requireAuth.ts`

- Reads `Authorization: Bearer <token>` header
- Verifies the JWT using `@clerk/backend` (`verifyToken`)
- Upserts user in MongoDB on first request: creates with `displayName` and `avatar` pulled from JWT claims; skips if already exists
- Attaches the DB user to `req.user`
- Applied to all routes except `/api/health`

## 3. Frontend JWT Interceptor

File: `frontend/src/services/apiClient.ts`

- Add an axios request interceptor
- Before each request, call Clerk's `getToken()` 
- Inject result as `Authorization: Bearer <token>` header
- Applied globally — no per-request changes needed

## Out of Scope

- Webhook-based sync (Clerk pushing user events) — can be added later
- Phone number collection flow — optional, user can add from settings later
- Profile editing UI — future work
