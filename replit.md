# Swiss Tax Declaration Assistant

## Overview
This is a full-stack web application that helps users navigate Swiss tax complexity, specifically specialized for Canton Aargau. The application provides tools for managing assets, securities, real estate, debts, and calculating tax declarations with PDF report generation.

## Recent Changes (September 22, 2025)
- **Project Setup**: Successfully imported from GitHub and adapted for Replit environment
- **Server Migration**: Converted from Vercel dev environment to Express.js server for Replit
- **Database Setup**: Updated database connection from Vercel PostgreSQL to standard PostgreSQL client
- **Workflow Configuration**: Set up development workflow on port 5000
- **Deployment Configuration**: Configured autoscale deployment for production
- **Bug Fixes**: Fixed CSS reference issue in HTML file

## Project Architecture

### Frontend
- **Technology**: Vanilla HTML, CSS, and JavaScript
- **Structure**: Single-page application with dynamic tab loading
- **Styling**: Custom CSS with gradient backgrounds and modern UI
- **Authentication**: JWT-based client-side authentication

### Backend
- **Technology**: Node.js with Express.js server
- **API Structure**: RESTful API endpoints under `/api/` prefix
- **Authentication**: JWT tokens with bcrypt password hashing
- **PDF Generation**: Using Playwright for generating tax reports

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
- **Target**: Autoscale deployment (suitable for stateless web applications)
- **Command**: `npm start` (runs Express.js server)
- **Environment**: Production-ready with proper error handling