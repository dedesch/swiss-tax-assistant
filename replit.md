# Swiss Tax Declaration Assistant

## Overview
This is a full-stack web application that helps users navigate Swiss tax complexity, specifically specialized for Canton Aargau. The application provides tools for managing assets, securities, real estate, debts, and calculating tax declarations with PDF report generation.

## Recent Changes (September 26, 2025)
- **Vercel Conversion**: Successfully converted project back to Vercel serverless architecture
- **API Migration**: Converted Express.js server to individual Vercel serverless functions
- **Development Mode**: Implemented authentication bypass for development testing
- **Translation System**: Added comprehensive multi-language support (FR/EN/DE/IT)
- **Landing Page**: Enhanced with Swiss branding and conversion optimization
- **Authentication**: Robust JWT-based authentication with PostgreSQL backend

## Project Architecture

### Frontend
- **Technology**: Vanilla HTML, CSS, and JavaScript
- **Structure**: Single-page application with dynamic tab loading
- **Styling**: Custom CSS with gradient backgrounds and modern UI
- **Authentication**: JWT-based client-side authentication

### Backend
- **Technology**: Node.js serverless functions (Vercel)
- **API Structure**: Individual serverless functions under `/api/` directory
- **Authentication**: JWT tokens with bcrypt password hashing
- **PDF Generation**: Using Playwright for generating tax reports
- **Deployment**: Vercel serverless architecture with auto-scaling

### Database
- **Technology**: PostgreSQL
- **Connection**: Standard pg client with connection pooling
- **Tables**: 
  - `users` (authentication)
  - `tax_calculations` (user tax data storage)

### Key Features
- User registration and authentication
- Multi-tab interface for different tax categories
- Real-time tax calculations
- Data persistence with user accounts
- PDF report generation
- Canton Aargau specific tax rules

## Environment Setup
- **Port**: Application runs on port 5000
- **Database**: PostgreSQL via DATABASE_URL environment variable
- **Host**: Configured for 0.0.0.0 to work with Replit proxy
- **Cache Control**: Disabled caching for development

## User Preferences
- Project prefers to maintain existing architecture and conventions
- Uses ES6 modules throughout the codebase
- Follows existing code style and structure
- Minimal dependencies approach with standard libraries

## Deployment
- **Platform**: Vercel serverless functions
- **Configuration**: `vercel.json` with proper routing and build settings
- **Environment**: Production-ready with auto-scaling and CDN
- **Commands**: `npm run deploy` for production deployment