# Database

Schema is owned by **EF Core** in `backend/InvictaJewel.Infrastructure`.

- **Migrations**: `Persistence/Migrations`
- **Seed data**: `DbInitializer` runs on startup after `MigrateAsync` when the catalog is empty (development/demo).

For production, prefer controlled migrations (`dotnet ef database update`) and optional SQL scripts exported from migrations if your DBA workflow requires them.
