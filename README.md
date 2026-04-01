# Invicta Jewel — E‑Commerce Platform

Production-oriented monorepo: **.NET 8** Web API (clean architecture) and **Angular 19** storefront (standalone components, Angular Material, Tailwind CSS), with **SQL Server** via EF Core.

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/) and npm
- SQL Server or [LocalDB](https://learn.microsoft.com/sql/database-engine/configure-windows/sql-server-express-localdb) (default connection string uses LocalDB)

## Backend

```powershell
cd backend\InvictaJewel.API
dotnet run
```

- HTTPS API (profile **https**): `https://localhost:7098`
- Swagger UI (Development): `/swagger`
- Connection string: `backend/InvictaJewel.API/appsettings.json` → `ConnectionStrings:DefaultConnection`
- On first run, migrations apply and **demo categories/products** are seeded if the database is empty.
- **Admin JWT**: `POST /api/auth/login` with `Admin:Email` / `Admin:Password` from configuration. Use the Bearer token for admin endpoints in Swagger.

New migrations (from repo root):

```powershell
cd backend
dotnet ef migrations add <Name> --project InvictaJewel.Infrastructure --startup-project InvictaJewel.API --output-dir Persistence\Migrations
```

## Frontend

```powershell
cd frontend
npm install
npx ng serve
```

- App: `http://localhost:4200`
- Development API calls use `src/environments/environment.development.ts` (`apiUrl: '/api'`) and **`proxy.conf.json`** → `https://localhost:7098`. Run the API on port **7098** or adjust the proxy.

Production build output: `frontend/dist/frontend` (configure IIS or static hosting + API URL in `src/environments/environment.ts`).

## Solution layout

| Path | Description |
|------|-------------|
| `backend/InvictaJewel.Domain` | Entities, domain constants |
| `backend/InvictaJewel.Application` | DTOs, services, AutoMapper, repository interfaces |
| `backend/InvictaJewel.Infrastructure` | EF Core, repositories, file storage, migrations |
| `backend/InvictaJewel.API` | Controllers, auth, Swagger, CORS, rate limiting |
| `frontend/src/app` | Features (lazy-loaded), shared UI, core services |

## Security notes for production

- Replace `Jwt:Key`, `Admin:Password`, and CORS origins.
- Serve the SPA and API over HTTPS; lock down `InvictAddress` / firewall rules as needed.
- Review AutoMapper advisory **GHSA-rvv3-g6hj-g44x** and upgrade mapping stack when a fixed major version fits your dependencies.

## Documentation

- [`docs/API.md`](docs/API.md) — endpoint summary
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — IIS / hosting notes
