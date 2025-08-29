# TRAE Rules: Polling App with QR Code Sharing

## 1. Project Overview
- The app allows users to register, log in, create polls, and share polls via unique links and QR codes.  
- Users can vote on polls (authenticated or anonymous), with votes updating in real-time.  
- All code must adhere to the rules, patterns, and conventions in this document to ensure quality, consistency, and maintainability.

## 2. Technology Stack
- **Language**: TypeScript only. Strict typing is required for all components, utilities, and server actions.  
- **Framework**: Next.js (App Router). Use server-first architecture wherever possible.  
- **Database & Auth**: Supabase (Postgres + Auth + Realtime). All data interactions must go through the Supabase client.  
- **Styling**: Tailwind CSS + shadcn/ui. All UI elements must leverage these components for consistency.  
- **State Management**:
  - Use Server Components for server state.  
  - For local UI state in Client Components, use `useState` or `useReducer`.  
- **API Communication**:
  - Use Next.js Server Actions for mutations (poll creation, voting, QR generation).  
  - Server Components should fetch data using Supabase clients directly.  
- **Utilities**: QR code generation via `qrcode.react` or similar. No new libraries unless approved.

## 3. Architecture & Directory Structure


## 4. Component & Code Design
- **Server Components**:
  - Default for pages and components that fetch or display data.  
  - Do not use client-side hooks (`useState`, `useEffect`) unless strictly necessary.  

- **Client Components**:
  - Marked with `'use client'`.  
  - Only for interactivity: vote buttons, QR scanner, modals, and local UI state.  

- **Naming Conventions**:
  - Components: PascalCase (`CreatePollForm.tsx`)  
  - Utility functions & Server Actions: camelCase (`submitVote.ts`)  
  - File names for routes: lowercase, hyphen-separated (`/polls/new/page.tsx`)  

- **Error Handling**:
  - Use try/catch in Server Actions and Route Handlers.  
  - Use `error.tsx` for route segments to handle UI-level errors gracefully.  

- **Secrets & Environment Variables**:
  - Never hardcode keys.  
  - Supabase URL and anon/service keys must be stored in `.env.local`.  
  - Access keys via `process.env.NEXT_PUBLIC_SUPABASE_URL` or `process.env.SUPABASE_SECRET_KEY`.

## 5. Code Patterns
- **Forms & Mutations**:
  - Forms should call Server Actions.  
  - Do not create separate API route handlers just to fetch from the client.  
  - Minimal client-side JS: only handle form state, validation, or UI feedback.  

- **Data Fetching**:
  - Fetch directly in Server Components using Supabase clients.  
  - Do not use `useEffect` or `useState` for fetching data in page components.  

- **Real-Time Updates**:
  - Use Supabase Realtime subscriptions in Client Components where needed (vote counts, live poll updates).  

- **QR Code Handling**:
  - QR generation should happen in Server Actions or server-rendered components.  
  - QR scanning should be handled in Client Components.

- **Authentication & Authorization**:
  - Always enforce auth via Supabase session on server-side.  
  - Protect private routes using middleware or server-side checks.  
  - Ensure users can only modify or delete polls they own.

## 6. Verification Checklist
Before merging any feature:

- [ ] Does the code use **Next.js App Router** and **Server Components** for fetching data?  
- [ ] Are **Server Actions** used for all data mutations (poll creation, voting, QR generation)?  
- [ ] Is the **Supabase client** used for all database interactions?  
- [ ] Are **shadcn/ui components** used wherever appropriate?  
- [ ] Are Supabase keys and other secrets **loaded from environment variables** and never hardcoded?  
- [ ] Are RLS policies respected in all database mutations?  
- [ ] Are Client Components marked with `'use client'` only where necessary?  
- [ ] Are error handling and feedback patterns consistent (try/catch + `error.tsx`)?  
- [ ] Are naming conventions consistent across files and components?  
- [ ] Is the QR code logic properly encapsulated (server generation, client scanning)?  
- [ ] Are forms submitting via Server Actions instead of client-side fetch?  
