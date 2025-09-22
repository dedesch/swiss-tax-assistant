# Vercel Deployment Guide for Swiss Tax Assistant

## Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Environment Variables**: Prepare your environment variables

## Deployment Steps

### 1. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your Swiss Tax Assistant repository
4. Vercel will automatically detect it as a Node.js project

### 2. Configure Environment Variables

In your Vercel project dashboard, go to **Settings > Environment Variables** and add:

**Required Variables:**
- `JWT_SECRET` - Your JWT secret key for authentication
- `OPENAI_API_KEY` - Your OpenAI API key for document processing
- `DATABASE_URL` - Your PostgreSQL database connection string

**Optional Variables:**
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins for CORS
- `NODE_ENV` - Automatically set to `production` by Vercel

### 3. Database Setup

For production, you have several options:

**Option A: Vercel Postgres (Recommended)**
1. In your Vercel project, go to **Storage** tab
2. Create a new **Postgres** database
3. Vercel will automatically add the `DATABASE_URL` environment variable

**Option B: External PostgreSQL**
1. Use a service like Neon, Supabase, or PlanetScale
2. Add the connection string as `DATABASE_URL` environment variable

### 4. Deploy

1. Click **Deploy** in Vercel
2. Vercel will build and deploy your application
3. Your app will be available at `https://your-project.vercel.app`

## Project Structure (Vercel-Ready)

```
swiss-tax-assistant/
├── api/
│   ├── index.js          # Main Express server (Vercel entry point)
│   ├── calculations.js   # Tax calculations API
│   ├── user-data.js      # User data management
│   ├── pdf-report.js     # PDF generation
│   └── document-upload.js # Document processing
├── public/
│   ├── index.html        # Landing page
│   ├── app.html          # Tax declaration app
│   ├── css/              # Stylesheets
│   ├── js/               # Frontend JavaScript
│   └── assets/           # Images and other assets
├── lib/                  # Shared libraries
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
└── .vercelignore        # Files to exclude from deployment
```

## Key Features for Vercel

- **Serverless Functions**: All API endpoints run as serverless functions
- **Static File Serving**: Public assets served via Vercel's CDN
- **Auto-scaling**: Automatically scales based on demand
- **Custom Domains**: Easy custom domain setup
- **SSL**: Free SSL certificates included

## Environment Variables Reference

### Required
```
JWT_SECRET=your-jwt-secret-here
OPENAI_API_KEY=sk-your-openai-key-here
DATABASE_URL=postgresql://user:password@host:port/database
```

### Optional
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are in `package.json`
2. **Environment Variables**: Ensure all required vars are set in Vercel dashboard
3. **Database Connection**: Verify DATABASE_URL is correct and accessible
4. **CORS Issues**: Add your Vercel domain to ALLOWED_ORIGINS

### Logs and Monitoring

- View deployment logs in Vercel dashboard
- Check function logs in **Functions** tab
- Monitor performance in **Analytics** tab

## Production Checklist

- [ ] All environment variables configured
- [ ] Database setup and accessible
- [ ] CORS origins configured for production domain
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Test all functionality after deployment

## Support

For Vercel-specific issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://vercel.com/community)

For application issues, ensure all API endpoints work correctly in the Vercel environment.