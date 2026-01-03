# Copilot Instructions - IPOST Frontend

## Project Overview
**IPOST** is a React + TypeScript + Vite web application for an online school management system with role-based dashboards (Super Admin, Admin, Teacher, Student). The frontend communicates with a backend API (`VITE_BACKEND_URL`, default: `http://localhost:3030/api/v1`).

### Tech Stack
- **React 19** with TypeScript 5.9
- **Vite 7** for bundling (dev port 5050)
- **Tailwind CSS 4** + **Ant Design 6** for UI
- **React Router 7** for navigation
- **TanStack React Query 5** for server state & data fetching
- **React Hook Form + Zod** for form validation
- **Axios** with interceptors for API requests
- **js-cookie** for token management

## Architecture & Key Patterns

### 1. **Multi-Role Page Structure** (`src/page/`)
The app has distinct role-based modules under `src/page/`:
- `admin/` → Admin login + dashboards
  - `auth/` → Login form (admin/super-admin authentication)
  - `admin/` → Regular admin dashboard
  - `super-admin/` → Super admin dashboard with nested admin management
- `teacher/` → Teacher authentication + dashboard
- `student/` → Student dashboard
- `main/` → Public pages (home, privacy policy)

**Pattern**: Each role has its own login flow and isolated dashboard routes. Routes are defined in `App.tsx` with nested `<Outlet>` patterns for dashboards.

### 2. **API Layer** (`src/config/`)
- **`request.ts`**: Axios instance with auto-injected Bearer token from `frontToken` cookie
  - Token injected via request interceptor
  - All API calls use this configured instance
- **`config.ts`**: `BACKEND_URL` from environment variable
- **`enum.ts`**: Token cookie name constant (`frontToken`)
- **`roles.ts`**: Role enum (SUPER_ADMIN, ADMIN, TEACHER, STUDENT)

**Authentication Flow**: Post login → receive token → save to `frontToken` cookie → auto-attached to all requests

### 3. **Data Fetching Pattern** (React Query + Custom Hooks)
Example from `src/page/admin/super-admin/admin/service/useGetList.ts`:
```typescript
export const useGetList = (params: GetListParams) => {
  return useQuery<GetListResponse>({
    queryKey: ['getlist', params],
    queryFn: async () => {
      const queryParams = {
        page: params.page,
        limit: params.limit,
        search: params.search?.trim(),
        sortField: params.sort.field,
        sortOrder: params.sort.order
      };
      return request.get('/admin/list', { params: queryParams }).then(r => r.data);
    }
  });
};
```
**Conventions**:
- Custom hooks named `use[Feature]` exported from `service/` folders
- Query keys include params for automatic cache invalidation
- Response types defined as interfaces above the hook
- Always extract `.data` from axios response

### 4. **Form Pattern** (React Hook Form + Zod)
Login form in `src/page/admin/auth/login.tsx` demonstrates the standard:
- Zod schema for validation (`z.object`, min/max rules in Uzbek)
- React Hook Form with `zodResolver`
- Ant Design Form + Input components
- `Controller` wrapper for Ant Design field binding
- On success: save token via `Cookies.set()` + navigate
- Error handling: Display `err.response.data.message`

### 5. **List/Table Management Pattern**
`src/page/admin/super-admin/admin/list-admin.tsx` shows composable list UI:
- `Header` component (search input + pagination controls)
- `Sort` component (sort field selection)
- `AdminCard` component (list item display)
- `Pagination` component (page navigation)
- State: `page`, `sort`, `limit`, `modalType` (edit/more)

**Note**: Backend returns nested response structure: `{ data: Admin[], meta: { totalItems, totalPages }, stats: { active, inactive, deleted } }`

### 6. **Styling Convention**
- **Tailwind-first**: Primary styling via Tailwind utility classes
- **Ant Design components**: For forms, buttons, modals, icons
- **Custom CSS minimal**: Only in `src/index.css` for global fonts (Inter)
- Responsive breakpoints follow Tailwind defaults
- Icon library: `lucide-react` for custom icons, `@ant-design/icons` for form icons

## Development Workflows

### Build & Run
```bash
npm run dev      # Vite dev server on localhost:5050
npm run build    # TypeScript compile + Vite build → dist/
npm run lint     # ESLint check (recommended-typescript rules)
npm run preview  # Preview production build
```

### Environment Setup
- Create `.env` file with `VITE_BACKEND_URL=<api-endpoint>`
- For testing with ngrok tunnel: `vite.config.ts` allowedHosts includes `cataractal-unperiphrastic-catherina.ngrok-free.dev`

### API Integration
- Always use `request` instance from `src/config/request.ts`
- Token automatically added; no manual header needed
- Query params passed via `{ params: {...} }` in axios options
- Response structure: `{ data: T, meta?: {...}, stats?: {...} }`

## Project-Specific Conventions

1. **Import Alias**: Use `@/` prefix for absolute imports (e.g., `@/config/request`)
2. **Component Types**: Functional components with `React.FC` type
3. **State in Lists**: Use local state for pagination, sorting, search; React Query for data
4. **Modal Management**: `showModal` + `modalType` state pattern (edit/more/delete flows)
5. **Error Messages**: Display `err.response.data.message` to users via `message.error()` (Ant Design)
6. **Role-Based Navigation**: Post-login, redirect based on `user.role` (check `Roles` enum)

## Key Files to Reference
- `src/App.tsx` - Route definitions & app structure
- `src/page/admin/auth/login.tsx` - Form + mutation pattern
- `src/page/admin/super-admin/admin/list-admin.tsx` - List UI + state management
- `src/config/request.ts` - API client setup
- `vite.config.ts` - Build configuration (aliases, proxy)
- `tsconfig.json` - TypeScript path mapping

## Common Tasks

### Adding a New Admin List Feature
1. Create component in `src/page/admin/super-admin/admin/components/`
2. Add query hook in `service/` folder (extend `useGetList` params)
3. Update `list-admin.tsx` state + event handlers
4. Use Tailwind + Ant Design for UI

### Creating Admin/Super-Admin Feature
1. Add route in `App.tsx` under `/super-admin` or `/admin` paths
2. Create service hook using `useQuery` from `useGetList.ts` pattern
3. Build UI with role-specific access (check `Roles` in auth response)

### API Response Handling
Check `useGetList.ts` for pagination/stats extraction:
- `data?.data || []` - items array
- `data?.meta?.totalItems || 0` - total count
- `data?.meta?.totalPages` - page count
- `data?.stats?.{ active, inactive, deleted }` - status breakdown

---
**Last Updated**: January 2026 | Frontend version: React 19 + Vite 7
