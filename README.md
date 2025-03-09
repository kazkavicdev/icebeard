# Team Management App

A Next.js application for managing team members with authentication and interactive games.

## Features

- User authentication (login/register)
- Team member management (add, delete, toggle status)
- Emoji Game for team interaction
- Map Game for geographical team activities

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Prisma ORM
- PostgreSQL
- NextAuth.js for authentication
- TailwindCSS for styling
- React Leaflet for maps

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file with:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/your-db-name"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment on Vercel

1. Create a [Vercel account](https://vercel.com/signup)
2. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Set up environment variables in Vercel:
   - Go to your project settings
   - Add the following environment variables:
     - `DATABASE_URL` (Your production PostgreSQL URL)
     - `NEXTAUTH_SECRET` (A secure random string)
     - `NEXTAUTH_URL` (Your production URL)

6. Set up a production database:
   - Create a PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/storage/postgres))
   - Update the `DATABASE_URL` in Vercel environment variables
   - Run migrations:
     ```bash
     vercel env pull .env.production.local
     npx prisma migrate deploy
     ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
