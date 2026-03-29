# Frontend Angular — Multi-Project Workspace

Angular 19 multi-project workspace that hosts shared libraries and a standalone application.

## Workspace Structure

```
ruku-features/
├── src/                        # Main application (shell that consumes libraries)
│   └── app/
│       ├── app.component.ts    # Root component (Header + RouterOutlet + Footer)
│       ├── app.config.ts       # App providers (router, HTTP, LIB_ENVIRONMENT)
│       └── app.routes.ts       # App routes (login, features)
├── projects/                   # Libraries and sub-projects
│   └── ruku-bookings/          # Shared booking/scheduling library
│       └── src/
│           ├── lib/            # Components, services, models, guards
│           └── public-api.ts   # Library public exports
├── dist/                       # Build output
│   ├── ruku-bookings/          # Built library (consumed by other apps)
│   └── ruku-features/       # Built application
├── angular.json                # Workspace config (all projects registered here)
├── tsconfig.json               # Base TS config (paths: ruku-bookings -> dist/)
├── tsconfig.app.json           # App-specific TS config (extends base)
├── package.json                # Workspace dependencies and scripts
└── environment.ts              # Environment config (API URL, OAuth keys)
```

## Projects

### ruku-bookings (library)

Shared library providing booking/scheduling functionality:

- **Components**: Header, Footer, HorizontalCardList, ServiceManager, AvailabilityManager, ScheduleManager
- **Pages**: Login (email + Google/GitHub OAuth), Feature (dashboard with child routes)
- **Services**: Auth, Product, Availability, Schedule, ImageUpload (all extend BaseService)
- **Guards**: authGuard
- **Models**: Service, Availability, Schedule
- **Shared**: MaterialModule

### ruku-features (application)

Standalone app at the workspace root (`src/`) that imports from `ruku-bookings` to run the library independently. Routes: `/login`, `/features/*`.

## Commands

```bash
# Run the app (builds library first, then serves)
npm run start

# Build the library only (for consumption by other apps like jk-portfolio)
npm run build

# Build the full app (library + application)
npm run build:app

# Run unit tests
npm run test
```

## Adding a New Project

1. **Library**: `ng generate library my-new-lib`
2. **Application**: `ng generate application my-new-app`

Both are added under `projects/` and registered in `angular.json` automatically. Import from libraries using the package name (mapped via `tsconfig.json` paths).

## Consuming from Other Apps (e.g., jk-portfolio)

1. Build the library: `npm run build` (outputs to `dist/ruku-bookings/`)
2. In the consuming app, reference it via `package.json`:
   ```json
   "ruku-bookings": "file:lib/ruku-bookings"
   ```
3. Create a junction/symlink: `lib/ruku-bookings` -> `path/to/ruku-features/dist/ruku-bookings`
4. Import in code: `import { HeaderComponent, AuthService } from 'ruku-bookings';`

## Connected Backend

- **RukuServiceApi** at `http://localhost:5002/api`
- JWT authentication with role-based authorization

## Deployment

This project does not have its own Dockerfile. For production deployment, the **[jk-portfolio-deploy](https://github.com/jjkst/jk-portfolio-deploy)** project builds the `ruku-bookings` library from this workspace and feeds it into the jk-portfolio build automatically using a multi-stage Docker build.
