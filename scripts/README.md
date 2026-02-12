# Scripts

This folder contains operational scripts for database management and development utilities.

## Available Scripts

### seed-database.ts

Seeds the database with example data for development.

**Usage:**

```bash
npm run db:seed              # Seed data (keeps existing)
npm run db:seed:fresh        # Drop and recreate with seed data
npm run db:create            # Create schema only
```

**Customization:**
Edit the `seedData()` function to create seed data that matches your ontology. Add your Object Types, Links, and example records.

---

## Adding Your Own Scripts

Common scripts to add:

### Data Import

```typescript
// scripts/import-data.ts
// Import data from CSV/Excel/API
```

### Data Export

```typescript
// scripts/export-data.ts
// Export data to CSV/Excel for reporting
```

### Maintenance Tasks

```typescript
// scripts/cleanup-old-data.ts
// Archive or delete old records
```

### Analytics

```typescript
// scripts/generate-reports.ts
// Generate periodic reports
```
