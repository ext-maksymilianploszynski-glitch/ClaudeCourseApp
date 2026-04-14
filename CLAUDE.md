# CLAUDE.md — Warehouse Management App

## Project Overview

A lightweight warehouse inventory management web application.
- **Frontend:** React (Vite + TypeScript)
- **Backend:** ASP.NET Core Web API (.NET 8, Minimal API style preferred)
- **Database:** SQLite via Entity Framework Core
- **No authentication** (for now)

## Repository Structure

```
/
├── backend/          # ASP.NET Core Web API
│   ├── WarehouseApi/
│   │   ├── Data/             # EF Core DbContext, migrations
│   │   ├── Models/           # Entity classes
│   │   ├── DTOs/             # Request/Response DTOs
│   │   ├── Endpoints/        # Minimal API endpoint groups
│   │   └── Program.cs
│   └── WarehouseApi.sln
├── frontend/         # React app (Vite + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/              # API client (fetch/axios wrappers)
│   │   └── types/            # TypeScript types mirroring DTOs
│   └── package.json
├── CLAUDE.md
└── SPEC.md
```

## Coding Conventions

### Backend (.NET)
- Use **Minimal API** endpoint groups (`MapGroup`) organized per feature (products, orders, stock)
- One file per endpoint group in `Endpoints/`
- DTOs are separate from entity models — never return EF entities directly
- EF Core migrations: always use `dotnet ef migrations add <Name>` and commit migration files
- Return `Results.Ok`, `Results.NotFound`, `Results.BadRequest` consistently
- Low stock threshold is stored per product (`LowStockThreshold` field)

### Frontend (React)
- Functional components only, no class components
- Use **React Query** (`@tanstack/react-query`) for all server state
- API calls go through `/src/api/` — no raw fetch calls inside components
- TypeScript strict mode enabled
- Component files: PascalCase (`ProductList.tsx`)
- Keep components small — extract sub-components when a component exceeds ~80 lines

## Running Locally

### Backend
```bash
cd backend/WarehouseApi
dotnet restore
dotnet ef database update
dotnet run
# API runs on https://localhost:5001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

## Key Domain Rules

- **Stock level** is derived from order history — never stored as a raw mutable number
  (or if denormalized for performance, always recalculated on order save)
- **Low stock alert** is triggered when `CurrentStock <= LowStockThreshold`
- Orders have two directions: `Incoming` (purchase/delivery) and `Outgoing` (shipment/issue)
- Order status flow: `Draft` → `Confirmed` → `Completed`
- Completing an `Incoming` order **increases** stock; completing an `Outgoing` order **decreases** stock
- Stock can never go negative — validate before completing outgoing orders

## What NOT to Do

- Do not add authentication until explicitly requested
- Do not add multi-warehouse support until explicitly requested
- Do not return EF entity objects from API endpoints — always use DTOs
- Do not store stock quantity as a mutable field without a corresponding order record