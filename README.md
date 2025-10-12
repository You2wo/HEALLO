# My Next.js App

This project is a Next.js application.

## Prerequisites

- Node.js (version >= 18)
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd my-nextjs-app
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the environment variables:

   Create a `.env` file in the root directory and add the necessary environment variables.  Refer to `.env.example` if available, or the project documentation for the required variables.

   Example:
    ```
    DATABASE_URL="your_database_url"
    NEXTAUTH_SECRET="your_nextauth_secret"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4. Run Prisma migrations:

   ```bash
   npx prisma migrate dev
   ```

## Running the Application

1. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   This will start the Next.js development server at `http://localhost:3000`.

## Running the Backend

The backend is implemented using Next.js API routes in the `src/app/api` directory. These routes handle API requests and interact with the database.

To access the backend API, send requests to the appropriate endpoints. For example:

- `GET /api/auth/me`: Get the current user's information.
- `POST /api/auth/login`: Log in a user.
- `POST /api/auth/register`: Register a new user.
- `GET /api/goals`: Get all goals.
- `POST /api/goals`: Create a new goal.

Refer to the API route files in `src/app/api` for more information on the available endpoints and their functionality.

## Deployment

The project is configured for deployment on Vercel. You can deploy the project by pushing it to a Vercel repository.

Alternatively, you can use the following command to build the project for production:

```bash
npm run build
```

And then run the project in production mode:

```bash
npm run start
```

## Additional Notes

- The `test-api.js` file can be used to test the API endpoints.
- The `prisma` directory contains the Prisma schema and migrations.
