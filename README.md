# Web App Template

Enterprise web application template built with React, Express, TypeScript, and Azure Databricks Lakebase. This template provides a complete foundation for building ontology-driven applications with modern tooling and enterprise-grade security.

---

## Quick Start

### Option 1: Local Development

```bash
# 1. Clone this repository
git clone https://github.com/your-org/web-app-template.git
cd web-app-template

# 2. Install dependencies
npm install

# 3. Configure environment
cp env.example .env.local
# Edit .env.local with your database credentials

# 4. Push schema to database
npm run db:push

# 5. Seed database (optional)
npm run db:seed

# 6. Start development server
npm run dev

# App available at http://localhost:3000
# API available at http://localhost:5000
```

### Option 2: Replit Deployment

```bash
# 1. Fork/import this repository in Replit

# 2. Install dependencies
npm install

# 3. Database is auto-provisioned by Replit
# Configure secrets in Replit Secrets panel (see env.example)

# 4. Push schema to database
npm run db:push

# 5. Start development server
npm run dev

# App available at https://your-repl.replit.dev
```

---

## Tech Stack

### Frontend

- **React 18** - UI framework with hooks
- **TypeScript** - Type safety
- **Vite** - Fast build tool & dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - High-quality accessible components (50+ components)
- **TanStack Query** - Server state management
- **Wouter** - Lightweight routing
- **React Hook Form + Zod** - Form validation
- **Lucide React** - Icon library
- **Framer Motion** - Animations
- **Recharts** - Charting

### Backend

- **Express** - HTTP server framework
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Primary database
- **Passport.js** - Authentication middleware
- **Zod** - Runtime validation

### Database

- **Azure Databricks Lakebase** - Production (enterprise-grade PostgreSQL)
- **Neon PostgreSQL** - Development (Replit)
- **Drizzle Kit** - Schema migrations

### Authentication

- **Replit Auth (OIDC)** - Development
- **Azure AD (Entra ID)** - Production
- **Azure Key Vault** - Secrets management

---

## Designing Your Application Ontology

The ontology is the heart of your application - it defines what "things" exist in your domain and how they relate to each other. **Work with your users to define it before writing code.**

### What is an Ontology?

An ontology consists of three concepts:

1. **Object Types** - The "nouns" of your application (e.g., User, Project, Task, Comment)
2. **Links** - The relationships between objects (e.g., User _owns_ Project, Task _belongsTo_ Project)
3. **Actions** - The "verbs" users can perform (e.g., AssignTask, CompleteProject, SubmitReview)

### Collaborative Design Process

#### 1. Discovery Workshop (with stakeholders)

Hold a 1-2 hour session with your users and ask:

- **"What are the main _things_ you work with day-to-day?"**
  - Listen for nouns: customers, orders, invoices, projects, tasks, etc.
  - These become your Object Types

- **"How do these things relate to each other?"**
  - Listen for relationships: "Every order belongs to a customer", "Tasks can be assigned to users"
  - These become your Links

- **"What do you _do_ with these things?"**
  - Listen for actions: "I create orders", "I assign tasks", "I approve invoices"
  - These become your Actions

#### 2. Whiteboard the Ontology

Use a physical or digital whiteboard:

- **Draw Object Types as boxes** with their key properties listed inside
- **Draw Links as labeled arrows** between boxes
  - Label: "Order → Customer" (belongs to)
  - Label: "Task → User" (assigned to)
  - Label: "User ↔ Project" (member of - many-to-many)
- **List Actions as sticky notes** placed near the objects they affect
  - "CreateOrder" near Order box
  - "AssignTask" between Task and User boxes

#### 3. Validate with Real Examples

Walk through real scenarios with your users:

- "When you create a new Order, what information do you need?"
- "What happens after you approve an Invoice?"
- "Who gets notified when a Task is completed?"

Look for:

- Missing Object Types ("Wait, we also track Shipments...")
- Missing Links ("Actually, Orders can have multiple Items...")
- Missing Actions ("We need to be able to bulk-assign Tasks...")

#### 4. Document in REQUIREMENTS-TEMPLATE.md

Transfer your whiteboard to the structured template in `docs/REQUIREMENTS-TEMPLATE.md`:

- List each Object Type with its properties and business rules
- Document each Link with cardinality (Many-to-One vs Many-to-Many)
- Specify each Action with inputs, preconditions, effects, and notifications

---

### From Ontology to Code

Here's how your ontology concepts map to implementation:

| You Define               | Code Generated                         | Example                                                        |
| ------------------------ | -------------------------------------- | -------------------------------------------------------------- |
| **Object Type: Task**    | Drizzle table in `shared/schema.ts`    | `export const task = pgTable("task", {...})`                   |
|                          | CRUD API routes in `server/routes.ts`  | `GET/POST/PATCH/DELETE /api/tasks`                             |
|                          | Storage methods in `server/storage.ts` | `getTask()`, `createTask()`, `updateTask()`                    |
|                          | List & Detail pages                    | `TaskList.tsx`, `TaskDetail.tsx`                               |
| **Link: Task → User**    | Foreign key column                     | `assigneeId: varchar("assignee_id").references(() => user.id)` |
| (Many-to-One)            | Nested in API response                 | `{ task: {...}, assignee: { firstName, lastName } }`           |
|                          | Dropdown/Select in UI                  | `<Select options={users} value={assigneeId} />`                |
| **Link: User ↔ Task**    | Junction table                         | `user_task_follower` with `userId` and `taskId`                |
| (Many-to-Many)           | Separate API endpoints                 | `POST /api/tasks/:id/follow`                                   |
|                          | Multi-select in UI                     | Tags or chip list component                                    |
| **Action: CompleteTask** | Storage method                         | `async completeTask(taskId, userId) {...}`                     |
|                          | API endpoint                           | `POST /api/tasks/:id/complete`                                 |
|                          | Button in UI                           | `<Button onClick={handleComplete}>Complete</Button>`           |

---

### Tips for Good Ontologies

1. **Start simple** - Begin with 3-5 core Object Types. You can always add more later.

2. **Use domain language** - Name things what your users call them, not technical terms.
   - Good: "Customer", "Order", "Invoice"
   - Bad: "Entity1", "Record", "Data"

3. **Actions have side effects** - If it just reads data, it's not an Action; it's part of the Object Type's API.
   - Action: "ApproveInvoice" (changes status, sends notification)
   - Not an Action: "ViewInvoice" (just reads data)

4. **Links have direction** - Be specific about the relationship.
   - Good: "Task belongsTo Project" (Many-to-One)
   - Bad: "Task and Project are related" (unclear)

5. **One Link per relationship** - Don't create both "Task → User" and "User → Task"
   - Define one direction; the reverse is implied

6. **Validate with "Can I delete?"** - If you can't delete an Object because others depend on it, you've found a Link.

---

## Project Structure

```
web-app-template/
├── client/                      # Frontend React application
│   ├── index.html
│   └── src/
│       ├── App.tsx              # Root component with routing
│       ├── main.tsx             # Entry point
│       ├── index.css            # Global styles & theme
│       ├── components/
│       │   ├── layout/          # Header, Sidebar
│       │   └── ui/              # shadcn/ui components (50+)
│       ├── hooks/               # Custom React hooks
│       ├── lib/                 # Utilities
│       └── pages/               # Page components
├── server/                      # Backend Express application
│   ├── index.ts                 # Server entry point
│   ├── routes.ts                # API routes (Object Types → endpoints)
│   ├── storage.ts               # Data access layer (Actions → methods)
│   ├── db.ts                    # Database connection
│   ├── lakebase-connection.ts   # Lakebase OAuth token manager
│   ├── replitAuth.ts            # Authentication (Replit + Azure AD)
│   ├── static.ts                # Production static serving
│   └── vite.ts                  # Vite dev server integration
├── shared/                      # Shared TypeScript code
│   └── schema.ts                # Drizzle ORM schema (Object Types → tables)
├── scripts/                     # Operational scripts
│   ├── seed-database.ts         # Development seed data
│   └── launch-both.js           # Dev server launcher
├── docs/                        # Documentation
│   ├── REQUIREMENTS-TEMPLATE.md # Ontology requirements template
│   ├── AI-PROMPTS.md            # Prompt templates for AI coding
│   └── ARCHITECTURE.md
├── migrations/                  # Database migrations
├── env.example                  # Environment variables template
├── components.json              # shadcn/ui configuration
├── drizzle.config.ts            # Drizzle ORM configuration
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── README.md                    # This file
```

---

## Development Workflow

### 1. Define Your Ontology

Start by filling out `docs/REQUIREMENTS-TEMPLATE.md`:

1. List your **Object Types** with properties
2. Define **Links** between objects
3. Specify **Actions** users can perform

Review with stakeholders before writing code.

### 2. Implement Object Types

For each Object Type:

1. **Add table to `shared/schema.ts`:**

   ```typescript
   export const task = pgTable("task", {
     id: varchar("id")
       .primaryKey()
       .default(sql`generate_ulid()`),
     title: varchar("title", { length: 255 }).notNull(),
     status: varchar("status", { length: 50 }).notNull().default("open"),
     // Add your properties here
   });
   ```

2. **Add storage methods to `server/storage.ts`:**

   ```typescript
   async getTasks(): Promise<any[]> { ... }
   async getTaskById(id: string): Promise<any | null> { ... }
   async createTask(data: InsertTask): Promise<any> { ... }
   async updateTask(id: string, data: Partial<InsertTask>): Promise<any> { ... }
   ```

3. **Add API routes to `server/routes.ts`:**

   ```typescript
   app.get("/api/tasks", requireAuth, async (req, res) => { ... });
   app.post("/api/tasks", requireAuth, async (req, res) => { ... });
   ```

4. **Create UI pages:**
   - `client/src/pages/TaskList.tsx` - List view
   - `client/src/pages/TaskDetail.tsx` - Detail view

### 3. Implement Links

**For Many-to-One Links (Foreign Keys):**

1. Add foreign key to schema:

   ```typescript
   ownerId: varchar("owner_id").references(() => user.id);
   ```

2. Join in storage queries:

   ```typescript
   .leftJoin(user, eq(task.ownerId, user.id))
   ```

3. Return nested in API response:
   ```typescript
   { task: {...}, owner: { firstName, lastName } }
   ```

**For Many-to-Many Links (Junction Tables):**

1. Create junction table in schema:

   ```typescript
   export const taskFollower = pgTable("task_follower", {
     taskId: varchar("task_id").references(() => task.id),
     userId: varchar("user_id").references(() => user.id),
   });
   ```

2. Add API endpoints:
   ```typescript
   app.post("/api/tasks/:id/follow", ...)
   app.delete("/api/tasks/:id/follow", ...)
   ```

### 4. Implement Actions

For each Action:

1. **Add method to `server/storage.ts`:**

   ```typescript
   async completeTask(id: string, userId: string): Promise<any> {
     // Validate preconditions
     // Update database
     // Record in history
     // Trigger notifications
   }
   ```

2. **Add API endpoint to `server/routes.ts`:**

   ```typescript
   app.post("/api/tasks/:id/complete", requireAuth, async (req, res) => {
     const userId = (req.user as any)?.claims?.sub;
     const task = await storage.completeTask(req.params.id, userId);
     res.json(task);
   });
   ```

3. **Add UI trigger:**
   ```typescript
   <Button onClick={() => completeTaskMutation.mutate(taskId)}>
     Complete Task
   </Button>
   ```

---

## AI-Assisted Development (Vibe Coding)

This template is designed for AI-assisted development. Use the prompt templates in `docs/AI-PROMPTS.md` throughout the development lifecycle.

### Recommended Workflow

1. **Define Ontology** → Use prompts to validate Object Types, Links, and Actions with AI
2. **Implement Schema** → Prompt AI to generate Drizzle tables from your ontology
3. **Build APIs** → Prompt AI to create CRUD endpoints and Action routes
4. **Create UI** → Prompt AI to generate pages, forms, and components
5. **Test & Debug** → Use debugging prompts when issues arise
6. **Iterate** → Refactor and optimize with AI assistance

### Key Prompting Tips

| Tip                     | Example                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Reference files**     | `@shared/schema.ts` shows the AI your actual code                                                                   |
| **Be specific**         | "Add validation" → "Add Zod validation that requires title (3-100 chars) and optional description (max 1000 chars)" |
| **Show patterns**       | "Follow the pattern in `@server/routes.ts` for the items endpoint"                                                  |
| **State constraints**   | "Don't change the database schema" or "Must work with existing auth"                                                |
| **Ask for explanation** | Append "Please explain your approach" when learning                                                                 |

### Sample Prompts by Phase

**Ontology Phase:**

```
I need to add a new Object Type: Invoice
Properties: invoiceNumber, amount, dueDate, status, customerId
Please validate this design and suggest any missing properties or Links.
```

**Implementation Phase:**

```
Create CRUD endpoints for Invoice using the pattern in @server/routes.ts
Include: pagination, filtering by status and customerId, and proper auth
```

**UI Phase:**

```
Create an Invoice list page with a table showing number, customer, amount, due date, and status.
Include filtering and a "Create Invoice" button. Follow the pattern in @client/src/pages/Dashboard.tsx
```

See `docs/AI-PROMPTS.md` for comprehensive templates covering the full development lifecycle.

---

## Available Scripts

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Start all dev servers (Vite + Express)    |
| `npm run build`         | Build for production                      |
| `npm run start`         | Start production server                   |
| `npm run check`         | TypeScript type checking                  |
| `npm run db:generate`   | Generate migration from schema changes    |
| `npm run db:push`       | Push schema directly to database (dev)    |
| `npm run db:migrate`    | Run migrations (production)               |
| `npm run db:studio`     | Open Drizzle Studio (database GUI)        |
| `npm run db:seed`       | Seed database with example data           |
| `npm run db:seed:fresh` | Drop and recreate database with seed data |

---

## Database Setup

This template supports two database modes:

### Mode 1: Standard PostgreSQL (Replit/Neon)

Simple connection string approach:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/database
```

### Mode 2: Azure Databricks Lakebase

Enterprise-grade with automatic OAuth token refresh:

```bash
USE_LAKEBASE=true
LAKEBASE_HOSTNAME=your-workspace.azuredatabricks.net
LAKEBASE_DATABASE=databricks_postgres
AZURE_TENANT_ID=your-tenant-id
DATABRICKS_WORKSPACE_URL=https://your-workspace.azuredatabricks.net
```

**For local development with Lakebase:**

1. Get a Databricks Personal Access Token:
   - Go to Databricks → Settings → Developer → Access Tokens
   - Click "Generate New Token"
   - Copy the token

2. Set in `.env.local`:
   ```bash
   USE_LAKEBASE=true
   DATABRICKS_TOKEN=your-token-here
   PGUSER=yourname@example.com
   ```

**For Azure production:**

- Uses Service Principal + Azure Key Vault
- Automatic token refresh every 50 minutes
- See `server/lakebase-connection.ts` for details

---

## Authentication

### Replit (Development)

Replit Auth (OIDC) is configured automatically:

- Users sign in with Replit accounts
- Sessions stored in PostgreSQL
- No additional configuration needed

### Azure AD (Production)

Enterprise authentication with Azure Active Directory:

- Users sign in with organizational accounts
- Token refresh handled automatically
- Configure in Azure Portal

### Local Development

For local development without Replit:

- Mock user auto-configured
- Edit email in `.env.local` with `PGUSER=yourname@example.com`

---

## Customizing This Template

### Step 1: Define Your Ontology

Open `docs/REQUIREMENTS-TEMPLATE.md` and work through it with your users:

1. **User Personas** - Who will use this application?
2. **Core Features** - What capabilities do they need?
3. **Object Types** - What are the main "things" in your domain?
4. **Links** - How do these things relate?
5. **Actions** - What operations can users perform?

### Step 2: Implement Your Schema

Add your Object Types to `shared/schema.ts`:

```typescript
// Template includes: user, organization
// Add your own Object Types following the pattern
export const yourObjectType = appSchema.table("your_object_type", {
  id: varchar("id")
    .primaryKey()
    .default(sql`generate_ulid()`),
  // Add your properties here
});
```

### Step 3: Add Storage Methods

Update `server/storage.ts`:

- Add CRUD methods for your Object Types
- Implement your Actions

### Step 4: Add API Routes

Update `server/routes.ts`:

- Add routes for your Object Types (follow Organization/User patterns)
- Add Action endpoints (e.g., `/api/tasks/:id/complete`)

### Step 5: Build UI Pages

Create pages in `client/src/pages/`:

- List view for each Object Type
- Detail view for each Object Type
- Forms for Actions

Update `client/src/App.tsx` with your routes.

### Step 6: Customize Branding

- Update `client/index.html` - Change title
- Update `client/src/pages/Landing.tsx` - Replace branding
- Update `client/src/index.css` - Adjust color variables
- Replace logo in `client/src/components/layout/Header.tsx`

---

## Folder Naming Conventions

Follow these patterns when adding your own code:

### Database (shared/schema.ts)

- **Tables:** Singular, lowercase (e.g., `user`, `order`, `task`)
- **Junction tables:** `object1_object2` (e.g., `user_project`, `task_tag`)

### API (server/routes.ts)

- **Resources:** Plural, lowercase (e.g., `/api/users`, `/api/orders`)
- **Actions:** Verb, singular (e.g., `/api/orders/:id/approve`, `/api/tasks/:id/assign`)

### Frontend (client/src/)

- **Pages:** PascalCase, singular (e.g., `TaskList.tsx`, `OrderDetail.tsx`)
- **Components:** PascalCase, descriptive (e.g., `TaskCard.tsx`, `UserAvatar.tsx`)
- **Hooks:** camelCase, prefixed with `use` (e.g., `useTasks.ts`, `useOrders.ts`)

---

## Database Migrations

### Development (Prototyping)

Use `db:push` for quick iteration:

```bash
# Make changes to shared/schema.ts
npm run db:push
# Schema immediately updated in database
```

### Production (Migrations)

Use migrations for controlled schema changes:

```bash
# 1. Make changes to shared/schema.ts
# 2. Generate migration
npm run db:generate

# 3. Review generated SQL in migrations/
# 4. Apply migration
npm run db:migrate
```

---

## Environment Variables

Copy `env.example` to `.env.local` and configure:

### Required (All Environments)

- `NODE_ENV` - `development` or `production`
- `PORT` - Server port (default: 5000)
- `SESSION_SECRET` - Random secret for sessions

### Required (Database)

**Option A - Standard PostgreSQL:**

- `DATABASE_URL` - Full connection string

**Option B - Databricks Lakebase:**

- `USE_LAKEBASE=true`
- `LAKEBASE_HOSTNAME`
- `LAKEBASE_DATABASE`
- `AZURE_TENANT_ID`
- `DATABRICKS_WORKSPACE_URL`

See `env.example` for complete list and documentation.

---

## Deployment

### Replit Deployment

1. Click "Deploy" button in Replit
2. Configure production secrets in Replit Secrets
3. Database auto-provisioned

### Azure Deployment

1. **Provision Resources:**
   - Azure Web App (B2+ tier)
   - Databricks Workspace with Lakebase
   - Azure Key Vault
   - Azure AD App Registration

2. **Configure Service Principal:**

   ```bash
   az ad sp create-for-rbac --name "app-template-sp"
   az keyvault secret set --vault-name your-vault --name "databricks-client-secret" --value "..."
   ```

3. **Set App Service Environment Variables** (see env.example)

4. **Deploy:**
   ```bash
   npm run build
   # Upload dist/ to App Service
   ```

---

## Architecture

### Application Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React/Vite)                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│  │ Pages   │  │Components│  │ Hooks   │                     │
│  └─────────┘  └─────────┘  └─────────┘                     │
│                                                              │
│  TanStack Query (Server State) + Wouter (Routing)           │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/JSON
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Express/Node.js)                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                     │
│  │ Routes  │  │ Storage │  │  Auth   │                     │
│  └─────────┘  └─────────┘  └─────────┘                     │
│                                                              │
│  Drizzle ORM + Passport.js                                  │
└────────────────────────┬─────────────────────────────────────┘
                         │ SQL
                         ▼
┌─────────────────────────────────────────────────────────────┐
│          PostgreSQL (Lakebase or Neon)                       │
│                                                              │
│  Object Types → Tables → APIs → UI Pages                    │
└─────────────────────────────────────────────────────────────┘
```

### Ontology-to-Code Flow

```
Define Ontology (REQUIREMENTS-TEMPLATE.md)
         │
         ├─→ Object Types → shared/schema.ts (Drizzle tables)
         │                → server/storage.ts (CRUD methods)
         │                → server/routes.ts (API endpoints)
         │                → client/src/pages/ (List & Detail views)
         │
         ├─→ Links → Foreign keys (Many-to-One)
         │         → Junction tables (Many-to-Many)
         │         → Nested API responses
         │         → Dropdown/Select UI components
         │
         └─→ Actions → server/storage.ts (action methods)
                     → server/routes.ts (POST endpoints)
                     → client/src/pages/ (Button triggers)
```

---

## Example: Task Management System

Here's a complete walkthrough from ontology to code:

### Ontology Definition

**Object Types:**

1. User, Project, Task

**Links:**

- Task → Project (belongsTo, Many-to-One)
- Task → User (assignedTo, Many-to-One)
- User ↔ Task (following, Many-to-Many)

**Actions:**

1. CreateTask, AssignTask, CompleteTask

### Generated Code

**Schema (shared/schema.ts):**

```typescript
export const task = pgTable("task", {
  id: varchar("id")
    .primaryKey()
    .default(sql`generate_ulid()`),
  projectId: varchar("project_id").references(() => project.id), // Link
  assigneeId: varchar("assignee_id").references(() => user.id), // Link
  status: varchar("status", { length: 50 }).notNull(),
});

export const taskFollower = pgTable("task_follower", {
  // Many-to-Many Link
  taskId: varchar("task_id").references(() => task.id),
  userId: varchar("user_id").references(() => user.id),
});
```

**API Routes:**

- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `POST /api/tasks/:id/assign` - AssignTask Action
- `POST /api/tasks/:id/complete` - CompleteTask Action
- `POST /api/tasks/:id/follow` - Follow Action (Many-to-Many Link)

**UI Pages:**

- `TaskList.tsx` - Browse all tasks
- `TaskDetail.tsx` - View/edit single task
- Buttons for Actions (Assign, Complete, Follow)

---

## UI Component Library

This template includes **50+ high-quality components** from shadcn/ui:

### Forms

- Button, Input, Textarea, Select, Checkbox, Radio, Switch
- Label, Form (with React Hook Form integration)

### Data Display

- Table, Card, Badge, Avatar, Separator
- Accordion, Collapsible, Tabs

### Overlays

- Dialog, Popover, Tooltip, Hover Card
- Dropdown Menu, Context Menu, Command Palette

### Feedback

- Toast, Alert Dialog, Progress

### Layout

- Scroll Area, Resizable Panels

All components are:

- Fully accessible (ARIA compliant)
- Keyboard navigable
- Dark mode compatible
- Customizable via CSS variables

See `client/src/components/ui/` for all available components.

---

## License

MIT

---

## Support

For questions or issues:

1. Review `docs/REQUIREMENTS-TEMPLATE.md` for ontology guidance
2. Check `docs/ARCHITECTURE.md` for technical details
3. Open an issue on GitHub

---

**Built for rapid ontology-driven development**

**Tech Stack:** React • TypeScript • Express • Drizzle ORM • PostgreSQL • TailwindCSS • shadcn/ui • Azure
