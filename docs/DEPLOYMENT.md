# Deployment notes (IIS / WinHost style)

## API (.NET 8)

- Install the [.NET 8 Hosting Bundle](https://dotnet.microsoft.com/download/dotnet/8.0).
- Application pool: **No Managed Code**, integrated pipeline, **32-bit applications: false**, idle timeout **0** if you want always-on.
- Publish the API (`dotnet publish -c Release`) and point the site physical path at the publish folder.
- Set `ASPNETCORE_ENVIRONMENT`, connection strings, `Jwt:Key`, `Admin:*`, and CORS origins via environment variables or `appsettings.Production.json` (not committed by default).

## SQL Server

- Run EF migrations against the production database (from dev machine or CI):

```powershell
dotnet ef database update --project backend/InvictaJewel.Infrastructure --startup-project backend/InvictaJewel.API
```

## Angular

- Build: `cd frontend && npx ng build --configuration production`.
- Deploy `frontend/dist/frontend/browser` (Angular 19 application builder) as the site root for the SPA.
- Add an **I URL Rewrite** rule so unknown paths serve `index.html` (typical SPA fallback).
- Set `frontend/src/environments/environment.ts` `apiUrl` to the public API base (e.g. `https://invictajewel.com/api`).
- Enable gzip/brotli at the reverse proxy or IIS level.

## Static uploads

- Product images are stored under `wwwroot/uploads/products` on the API host; ensure that folder is writable by the app pool identity and included in backups (or switch storage to blob/CDN for scale).
