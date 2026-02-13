# IncidentRadar

A productivity-focused **personal incident tracking system** built with **React + TypeScript**.
Designed for engineers who manage tickets daily (ServiceNow/Jira) and need a fast, visual, action-driven workflow.

> Local-first today (IndexedDB). API-ready tomorrow (Node.js backend in a separate repo).

## Why this exists
ServiceNow/Jira are the source of truth, but they are not optimized for *personal daily tracking*.
IncidentRadar helps you avoid “silent tickets” by enforcing a simple rule:
**every incident must have a next action and a follow-up date**.

## Key features (MVP)
- Minimal **Kanban board** with drag & drop
- **Quick log modal** on card moves (action, result, next step, follow-up date, time spent)
- Smart indicators:
  - Overdue follow-up
  - “Stale” tickets (no update in 48h)
  - Missing next action
- “Today” view:
  - Overdue
  - Due today
  - Blocked/CGR
  - Stale > 48h
- Local persistence with **IndexedDB**
- Backup tools: **Export / Import JSON**
- Smart **tag suggestions** from text (DB2, SQLCODE, CGR, PROD/UAT/QA, etc.)

## Board columns
- Nuevo
- En análisis
- En gestión
- En espera
- Bloqueado / CGR
- Cerrado

## Initial catalogs
**Buzón / Aplicativo**
- BMOVIL, Core, Middleware, DB, Canales, Otros

**Canal**
- EECC, Web, App, API, Batch, Otro

**Prioridad**
- P1, P2, P3, P4

## Tech stack
- React + Vite
- TypeScript (strict)
- Zustand (state)
- Dexie (IndexedDB)
- dnd-kit (drag & drop)
- dayjs (dates)
- Tailwind CSS (UI)

## Getting started
```bash
npm install
npm run dev
