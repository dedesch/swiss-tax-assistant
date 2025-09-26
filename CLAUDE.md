# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Local Development
- `npm run dev` - Start development server on port 5000 (uses server.js)
- `npm start` - Start production server (uses api/index.js for Vercel)
- `npm run build` - No build step required (static files served directly)

### Database Setup
The application uses PostgreSQL with automatic table creation. Environment variables required:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT authentication
- `OPENAI_API_KEY` - For document processing features

## Project Architecture

### Deployment Strategy
This is a **dual-deployment application** designed to work in both local development and Vercel serverless environments:

- **Local Development**: Uses `server.js` with Express server on port 5000
- **Vercel Production**: Uses `api/index.js` as serverless function entry point
- **Static Assets**: Served from `public/` directory via Express static middleware or Vercel static hosting

### Backend Structure
```
api/
├── index.js           # Vercel serverless entry point
├── calculations.js    # Tax calculation endpoints
├── user-data.js       # User authentication and data persistence
├── pdf-report.js      # PDF generation using jsPDF
└── document-upload.js # Document processing with OpenAI
```

API endpoints use `app.all()` pattern to handle different HTTP methods in single handler functions.

### Frontend Architecture
**Technology**: Vanilla JavaScript with modular architecture
```
public/js/
├── main.js                    # Primary application controller
├── auth.js                    # Authentication management
├── api-client.js              # API communication layer
├── calculations.js            # Tax calculation logic
├── forms.js                   # Dynamic form generation
├── swiss-tax-handlers.js      # Swiss-specific tax rules
├── document-upload-manager.js # File upload handling
└── modals.js                  # UI modal components
```

**Key Frontend Patterns**:
- Module-based organization with ES6 imports/exports
- Tab-based navigation system for tax categories
- Form state management with local storage persistence
- Real-time calculation updates
- Authentication token management in localStorage

### Database Schema
Uses PostgreSQL with `lib/db.js` providing database utilities:
- **users**: Authentication (email, password_hash, timestamps)
- **tax_calculations**: User tax data (user_id, tax_year, data as JSONB)

Database functions include automatic table creation and upsert operations for tax calculations.

### Tax Calculation System
The application implements Swiss Canton Aargau tax rules with:
- Asset categorization (securities, real estate, business vs private)
- Automatic currency conversion handling
- Debt classification and limits
- Progressive tax rate calculations
- PDF report generation with jsPDF and jsPDF-AutoTable

### Authentication Flow
- JWT-based authentication with bcryptjs password hashing
- Token stored in localStorage with automatic renewal
- Protected routes require valid JWT tokens
- User registration with email uniqueness constraints

### File Processing
Uses OpenAI API for document analysis and data extraction from uploaded tax documents, with Playwright for PDF generation in serverless environments.

## Important Notes

### Environment Differences
- Development uses `server.js` (standard Express server)
- Production uses `api/index.js` (Vercel serverless function)
- Both share the same API handler modules

### CORS Configuration
Configured for both local development and production domains via `ALLOWED_ORIGINS` environment variable.

### Security
- JWT secrets must be configured in production
- Password hashing uses bcryptjs
- CORS restrictions in place
- Environment variable validation on startup