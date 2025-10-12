# My NextJS App

A full-stack Next.js application with authentication, journaling, mood tracking, and goal management.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### Setup
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-nextjs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env .env.local  # or create manually
   ```

   Your `.env` file should contain:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   ```

4. **Initialize database**
   ```bash
   npm run setup
   ```

   This will:
   - Generate Prisma client
   - Create the SQLite database
   - Apply the schema

5. **Start development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run setup` - Initialize database (first time setup)

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/             # API routes
│   ├── (pages)/         # Page components
│   └── components/      # Reusable components
├── contexts/            # React contexts
├── lib/                 # Utility functions
└── prisma/
    └── schema.prisma    # Database schema
```

## 🚀 Deployment

### To Vercel

1. **Change database configuration:**
   ``` prism
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set up Vercel Postgres:**
   - Create database in Vercel dashboard
   - Add `DATABASE_URL` to environment variables
   - Add `JWT_SECRET` to environment variables

3. **Deploy:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx vercel --prod
   ```

## 📝 Features

- 🔐 User authentication (register/login)
- 📓 Journal entries
- 😊 Mood tracking
- 🎯 Goal management
- 🔥 Streak tracking
- 🐾 Virtual pet game

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** SQLite (local) / PostgreSQL (production)
- **ORM:** Prisma
- **Authentication:** JWT
- **UI:** React + Tailwind CSS
- **Game:** Phaser.js

## 🔍 Troubleshooting

### "Internal server error" on login
1. Check if `.env` file exists with correct `DATABASE_URL`
2. Run `npm run setup` to initialize database
3. Ensure `prisma/dev.db` file exists

### Database issues when transferring project
- The `prisma/dev.db` file is gitignored
- Always use `npm run setup` on new machines
- Never transfer database files between machines

## 📄 License

MIT License
