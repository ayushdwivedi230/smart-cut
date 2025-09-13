# Overview

Smart Cut is a comprehensive salon booking platform that connects customers with barbers and salons. The application features a React frontend with a Node.js/Express backend, enabling users to discover local salons, book appointments, and manage their haircare experiences. The platform supports multiple user roles (customers, barbers, admins) with role-based dashboards and functionality.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Custom component library built on Radix UI primitives with shadcn/ui styling
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API with role-based access control middleware
- **Development**: Hot module replacement with Vite integration for development mode

## Database Design
- **Users Table**: Stores customer, barber, and admin accounts with role-based permissions
- **Salons Table**: Salon information with owner relationships and approval status
- **Barbers Table**: Barber profiles linked to users and salons with availability tracking
- **Services Table**: Services offered by barbers with pricing
- **Appointments Table**: Booking system with status tracking and customer/barber relationships
- **Reviews Table**: Customer feedback system for barbers

## Authentication & Authorization
- **JWT Tokens**: Stateless authentication with role-based claims
- **Role-Based Access**: Three user types (customer, barber, admin) with distinct permissions
- **Protected Routes**: Middleware validation for API endpoints and frontend route guards
- **Password Security**: Bcrypt hashing with salt rounds for secure password storage

## File Structure
- **Client**: React application in `/client` directory with components, pages, and utilities
- **Server**: Express backend in `/server` directory with routes and business logic
- **Shared**: Common TypeScript types and Zod schemas in `/shared` directory
- **Database**: Drizzle migrations and configuration for schema management

# External Dependencies

## Database
- **Neon Database**: PostgreSQL serverless database (@neondatabase/serverless)
- **Connection**: Environment variable DATABASE_URL for connection string

## UI & Styling
- **Radix UI**: Comprehensive set of unstyled UI primitives for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Custom font loading (DM Sans, Architects Daughter, Fira Code, Geist Mono)

## Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **ESBuild**: Fast bundling for production server builds
- **Replit Integration**: Development environment plugins and error handling

## Authentication & Security
- **JSON Web Tokens**: Stateless authentication mechanism
- **Bcrypt**: Password hashing and comparison
- **CORS**: Cross-origin resource sharing configuration

## Data Fetching & Forms
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: Runtime type validation for forms and API schemas