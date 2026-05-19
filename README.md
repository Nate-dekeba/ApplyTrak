# ApplyTrak

Apply track is a full-stack job application tracker that helps users organize their job search in one place. 
Users can add applications, track their status, view pipeline metrics, and manage their progress through multiple dashboard views.

## Features

- Create, update, and delete job applications
- Filter and track applications by status, including saved, applied, interviewing, offer, and rejected
- View applications in card, table, and Kanban-style layouts
- Drag and drop applications between status columns
- Search applications by job title, company, or location
- View job search metrics such as total applications, interviews, offers, and rejections
- User registration and login with JWT-based authentication
- Password hashing with bcrypt
- Responsive layout for desktop and mobile
- Light and dark mode support

## Tech Stack

**Frontend**
- React 19 + Vite
- Tailwind CSS v4
- Native HTML5 Drag & Drop (no libraries)

**Backend**
- Node.js + Express
- PostgreSQL (Neon cloud-hosted)
- JWT authentication
- bcryptjs

### Prerequisites
- Node.js 18+
- A PostgreSQL database
