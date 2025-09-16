cat > README.md << EOF
# Swiss Tax Declaration Assistant

A professional full-stack web application for handling Swiss tax declarations, particularly for complex international situations.

## Features

- User authentication and data persistence
- International asset and property management
- Automatic currency conversions
- Business vs private asset classification
- PDF report generation
- Responsive design for all devices

## Tech Stack

- **Frontend**: Vanilla JavaScript (modular architecture)
- **Backend**: Node.js with Vercel serverless functions
- **Database**: PostgreSQL (Vercel Postgres)
- **Authentication**: JWT with bcrypt password hashing
- **Deployment**: Vercel

## Project Structure

\`\`\`
swiss-tax-assistant/
├── api/                  # Backend API endpoints
├── lib/                  # Database utilities
├── public/               # Frontend files
│   ├── css/             # Stylesheets
│   ├── js/              # JavaScript modules
│   └── components/      # HTML components (optional)
├── package.json
└── vercel.json
\`\`\`

## Local Development

1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables
4. Run locally: \`vercel dev\`

## Deployment

1. Deploy to Vercel: \`npx vercel --prod\`
2. Add PostgreSQL database in Vercel dashboard
3. Configure environment variables

## Environment Variables

- \`JWT_SECRET\`: Secret key for JWT token generation
- \`POSTGRES_URL\`: Database connection string

## License

MIT
EOF