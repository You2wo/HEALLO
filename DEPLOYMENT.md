# Deployment Guide for Vercel

This guide will help you deploy your Next.js app to Vercel while maintaining local development compatibility.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Database Setup

### Local Development (SQLite)

For local development, the app uses SQLite. Your `.env` file should contain:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"
```

### Production (Vercel with PostgreSQL)

1. **Create a Vercel Postgres Database:**
   - Go to your Vercel dashboard
   - Navigate to the Storage tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name and region for your database
   - Click "Create"

2. **Get Database Connection String:**
   - After creating the database, Vercel will show you the connection details
   - Copy the `POSTGRES_PRISMA_URL` value

## Deployment Steps

### 1. Push Your Code to Git

Make sure all your changes are committed and pushed to your Git repository:

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel will auto-detect it's a Next.js project

### 3. Configure Environment Variables

In the Vercel project settings, add these environment variables:

- `DATABASE_URL`: Your Postgres connection string from Vercel Postgres (POSTGRES_PRISMA_URL)
- `JWT_SECRET`: A secure random string (generate a new one for production!)

**To generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Deploy

Click "Deploy" and Vercel will:
- Install dependencies
- Generate Prisma Client
- Run database migrations
- Build your Next.js app
- Deploy it

### 5. Run Initial Database Migration

After the first deployment, you need to push your database schema:

1. Install Vercel CLI locally (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Link your local project to Vercel:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.production
   ```

4. Run Prisma migration:
   ```bash
   DATABASE_URL="your-vercel-postgres-url" npx prisma migrate deploy
   ```

   Or use the Vercel Postgres connection string directly from your dashboard.

## Local Development

To continue developing locally with SQLite:

1. Make sure your `.env` file uses SQLite:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

2. Run migrations locally:
   ```bash
   npx prisma migrate dev
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Switching Between SQLite and PostgreSQL

The Prisma schema is now configured for PostgreSQL. If you need to switch back to SQLite for local development:

1. **For SQLite (local):**
   - Update `.env`: `DATABASE_URL="file:./dev.db"`
   - The schema works with both databases

2. **For PostgreSQL (production/Vercel):**
   - Use the Vercel Postgres connection string
   - Migrations will run automatically on deployment

## Important Notes

- **Never commit `.env` files** - they're already in `.gitignore`
- **Use `.env.example`** as a template for required environment variables
- **Generate a new JWT_SECRET** for production (don't use the example one!)
- **Database migrations** are automatically run on Vercel deployment via the `vercel-build` script
- **Prisma Client** is automatically generated during build and after npm install

## Troubleshooting

### Build Fails on Vercel

- Check that all environment variables are set correctly
- Verify the DATABASE_URL is the POSTGRES_PRISMA_URL from Vercel
- Check build logs for specific errors

### Database Connection Issues

- Ensure you're using the correct connection string format
- Verify the database is in the same region as your Vercel deployment for better performance
- Check that SSL mode is enabled in the connection string

### Local Development Issues

- Make sure you're using SQLite URL format: `file:./dev.db`
- Run `npx prisma generate` if you get Prisma Client errors
- Delete `node_modules` and `package-lock.json`, then run `npm install` if issues persist

## Continuous Deployment

Once set up, every push to your main branch will automatically:
1. Trigger a new deployment on Vercel
2. Run database migrations
3. Build and deploy your app

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
