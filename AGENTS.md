# DaNang Trip Admin - Agent Memory

## Project Overview
- **Name**: danangtrip-admin
- **Type**: React/TypeScript Admin Dashboard
- **Build Tool**: Vite
- **Language**: Vietnamese support (i18n)

## Tech Stack
- **Frontend**: React 18 with TypeScript
- **State Management**: Redux with Redux Thunk
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Yup/Zod validation
- **HTTP Client**: Axios
- **UI Components**: Lucide React, React Icons
- **Charts**: Recharts with D3
- **Animations**: Lottie React
- **i18n**: i18next with browser language detector

## Key Project Structure
```
src/
├── api/           - API endpoints and calls
├── components/    - Reusable UI components
├── config/        - Configuration files
├── constants/     - App constants
├── dataHelper/    - Data transformation utilities
├── hooks/         - Custom React hooks
├── i18n/          - Internationalization setup
├── layouts/       - Layout components
├── lib/           - Utility libraries
├── pages/         - Page components
├── providers/     - Context/Redux providers
├── routes/        - Route definitions
├── store/         - Redux store setup
├── types/         - TypeScript type definitions
├── utils/         - Utility functions
└── validations/   - Form validation schemas
```

## Important Notes
- Project has Vietnamese language support via i18n
- Uses Tailwind CSS for styling
- Form validation with react-hook-form + Yup/Zod
- Redux for state management
- TypeScript for type safety

## Dev Notes
- Build output: `dist/` directory
- Node modules included in repo (node_modules/)
- ESLint configured for code quality
