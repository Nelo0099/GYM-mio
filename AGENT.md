# AGENT.md - Gym Management Application

## Project Overview
This is a comprehensive gym management application built with Next.js, featuring user authentication, admin panel, QR-based attendance tracking, and Face ID recognition.

## Tech Stack
- **Frontend**: Next.js 14+ with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: NextAuth.js with credentials provider
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Deployment**: Vercel

## Key Features
- User registration and login (email/password + Face ID)
- Admin dashboard for user management
- QR code generation and scanning for attendance
- Face ID setup and recognition (mock implementation for production)
- Attendance tracking and reporting
- User role management (admin/user)

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/dashboard/    # Admin panel
│   ├── dashboard/          # User dashboard
│   ├── api/                # API routes
│   │   ├── admin/          # Admin-only APIs
│   │   ├── attendance/     # Attendance tracking
│   │   ├── auth/           # Authentication
│   │   └── faceid/         # Face ID management
│   └── login/              # Login page
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma database client
│   └── utils.ts            # Helper functions
└── hooks/                  # Custom React hooks
```

## Database Schema
- **User**: id, email, name, password, role, createdAt
- **Attendance**: id, userId, timestamp
- Face descriptors stored in memory (Map) for demo

## Face ID Implementation
- Mock face recognition for production compatibility
- Stores up to 6 face images per user in `public/FaceID/{userId}/`
- Client-side descriptor extraction (simulated)
- Server-side image storage and management

## API Endpoints
### Auth
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Attendance
- `GET /api/attendance?date=YYYY-MM-DD` - Get attendance for date
- `POST /api/attendance/record` - Record attendance

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/create-user` - Create new user
- `POST /api/admin/update-role` - Update user role
- `DELETE /api/admin/delete-user` - Delete user
- `GET /api/admin/export-attendances` - Export attendance data

### Face ID
- `GET /api/faceid/images?userId=...` - List user's face images
- `POST /api/faceid/images` - Upload face image
- `DELETE /api/faceid/images/{filename}` - Delete face image
- `GET /api/faceid/descriptors` - Get stored descriptors
- `POST /api/faceid/descriptors` - Upload face image (legacy)
- `PUT /api/faceid/descriptors` - Store face descriptors

## Environment Variables
- `NEXTAUTH_SECRET` - NextAuth secret key
- `NEXTAUTH_URL` - NextAuth URL (for production)
- `DATABASE_URL` - Database connection string

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Update database schema
- `npx prisma studio` - Open database GUI

## Deployment Notes
- Face ID uses mock recognition to avoid SSR issues
- Images stored in `public/FaceID/` directory
- Admin role required for user management features
- QR codes generated server-side for attendance

## Recent Issues Resolved
- Face ID API endpoints implemented (images GET/POST/DELETE)
- Admin dashboard Face ID button added
- Vercel build compatibility with mock face recognition
- Dynamic imports for face-api.js to prevent SSR errors

## TODO
- Add proper error handling for camera permissions
- Implement real face recognition (face-api.js server-side)
- Add face ID login flow integration
- Add image compression for uploads
- Add attendance export in multiple formats