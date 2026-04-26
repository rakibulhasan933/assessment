# Programming Hero Assessment Platform

## Project Overview

This project is an assignment and submission management platform built for two types of users:

- `Instructor`
- `Student`

The goal of the project is to make assignment management easier by allowing instructors to create assignments, review submissions, give feedback, and monitor analytics, while students can view assignments, submit their work, and track their progress.

This project was built using:

- `Next.js`
- `React`
- `TypeScript`
- `Drizzle ORM`
- `Neon PostgreSQL`
- `Tailwind CSS`

## What I Would Say As The Developer

If I explain this project as the developer who built it, I would say that this is not just a frontend dashboard project. The real work was in making sure the platform behaves correctly for different users and that the data stays trustworthy across the full workflow.

I had to think about:

- who is logged in
- what role they have
- what data they are allowed to access
- who can create or review submissions
- how feedback and submission status affect the rest of the system

So from a developer's perspective, the most important part of this project is not only the UI. It is the authentication, authorization, and submission review flow.

## Most Challenging Part

The most difficult part of this project was implementing authentication and role-based authorization correctly.

This was the hardest part because the system has two separate roles:

- `student`
- `instructor`

Both roles use the same application, but they should not have the same permissions.

For example:

- a student should be able to submit work but should not review submissions
- an instructor should be able to create assignments and review student work
- both users should only see the correct dashboard and allowed data

That made the project more challenging because I had to make sure route protection, session handling, and API permissions all stayed consistent.

Another challenging part was the submission review workflow. When an instructor changes a submission status or adds feedback, that action directly affects student-facing results and also influences analytics. Because of that, I had to be careful that only the correct instructor could review the correct submission.

## How I Found The Most Critical Part

If I were reviewing this project as a developer, I would first inspect the places where a wrong decision could break security or system trust.

I identified the most critical area by following this logic:

### 1. Authentication comes first

I checked how users log in, how sessions are created, and how the system recognizes whether a user is a student or instructor.

### 2. Role-based access decides safety

After that, I looked at how routes and API endpoints are protected, because this determines whether users can access things they should not access.

### 3. Submission review affects real outcomes

Then I looked at the review flow, because instructor feedback and status changes affect student results and platform analytics.

From that analysis, I concluded that the most critical part of the project is the auth and review pipeline.

## Key Features

- User registration and login
- Role-based dashboard for instructor and student
- Assignment creation and management
- Student submission system with URL and notes
- Instructor review and feedback system
- Analytics for submission performance
- AI-assisted feedback support with fallback logic

## Project Structure

```text
src/
  app/
    api/
      ai/
      assignments/
      auth/
      instructor/
      submissions/
    dashboard/
    login/
  components/
    analytics/
    auth/
    dashboard/
    ui/
  lib/
    ai/
    auth/
    db/
```

## Setup Instructions

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env` file and add:

```env
DATABASE_URL=your_database_url
AUTH_SECRET=your_secret_key
AI_GATEWAY_API_KEY=optional
AI_MODEL=optional
```

### 3. Push database schema

```bash
pnpm db:push
```

### 4. Run the development server

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `pnpm dev` - start development server
- `pnpm build` - build the application
- `pnpm start` - run production server
- `pnpm lint` - run linting
- `pnpm db:generate` - generate Drizzle migration
- `pnpm db:migrate` - run migrations
- `pnpm db:push` - push schema to database
- `pnpm db:studio` - open database studio
- `pnpm seed:admin` - seed admin/instructor data

## Developer Reflection

If I were describing my own learning from this assignment, I would say this project taught me that building a working UI is only one part of full-stack development. The more difficult and important part is making sure authentication, permissions, and data flow are correct.

This assignment helped me practice:

- building secure role-based features
- managing database-backed workflows
- designing API routes with permission checks
- thinking about how backend logic affects frontend behavior

## Conclusion

This project is a full-stack assessment platform where the main challenge was not only building pages, but making sure the system works correctly for different user roles. As the developer, I would say the most difficult and most important part was handling authentication, authorization, and instructor review logic in a reliable way.
