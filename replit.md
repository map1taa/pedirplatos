# Restaurant Dish Ordering System

## Overview

This is a full-stack web application for a Japanese restaurant dish ordering system ("お皿オーダー"). The application allows customers to browse dishes, add them to a cart, and place orders. It also includes an admin interface for managing dish inventory.

## User Preferences

Preferred communication style: Simple, everyday language.
Layout preferences: Separate pages for dish management and product listing, with product list displayed in horizontal rectangular rows.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context for cart state, TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM (DatabaseStorage implementation)
- **File Handling**: Multer for image uploads
- **Email**: Nodemailer for order notifications

## Key Components

### Frontend Components
1. **Product Grid**: Displays dishes with filtering and grid/list view options
2. **Shopping Cart**: Sidebar cart with quantity management and checkout flow
3. **Product Management**: Admin interface for adding/editing dishes with image upload
4. **Checkout Modal**: Order form with customer details and payment options

### Backend Services
1. **Storage Layer**: Abstract storage interface with PostgreSQL database implementation
2. **Route Handlers**: RESTful API endpoints for dishes and orders
3. **File Upload**: Image handling with validation and storage
4. **Email Service**: Order confirmation emails
5. **Database Seeding**: Automatic sample data population on startup

### Shared Schema
- Centralized TypeScript types and Zod validation schemas
- Database table definitions using Drizzle ORM
- Consistent data models across frontend and backend

## Data Flow

1. **Product Display**: Frontend fetches dishes from `/api/dishes` endpoint
2. **Cart Management**: Local state management with React Context
3. **Order Processing**: 
   - Frontend sends order data to `/api/orders`
   - Backend validates and stores order
   - Email confirmation sent to customer
4. **Admin Operations**: CRUD operations for dish management with image upload

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via Drizzle)
- **Neon Database**: Serverless PostgreSQL provider (based on connection string)

### UI Components
- **Radix UI**: Accessible component primitives
- **shadcn/ui**: Pre-built component library with Tailwind CSS
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool with HMR
- **Replit Integration**: Development environment optimizations
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development
- Vite dev server for frontend with proxy to Express backend
- Hot module replacement for rapid development
- PostgreSQL database with automatic seeding

### Production
- **Frontend**: Static build served by Express
- **Backend**: Bundled Node.js application
- **Database**: PostgreSQL with connection pooling
- **File Storage**: Local filesystem (uploads directory)
- **Environment**: Configured via environment variables

### Build Process
1. Frontend assets built with Vite to `dist/public`
2. Backend bundled with ESBuild to `dist/index.js`
3. Static file serving integrated into Express app
4. Database migrations applied via Drizzle Kit

The architecture prioritizes developer experience with TypeScript throughout, modern tooling, and clear separation of concerns while maintaining simplicity for a restaurant ordering system.

## Recent Changes

### January 27, 2025
- Separated dish management from product listing into dedicated pages
- Created new `/management` route for dish administration
- Updated product grid to display items in horizontal rectangular list format
- Removed grid/list view toggle in favor of consistent horizontal layout
- Enhanced visual design with larger product cards and improved spacing
- Added quantity selector controls (+/- buttons and number input) before adding items to cart
- Items can now be added in specified quantities (1-99) with visual feedback
- Migrated from in-memory storage to PostgreSQL database with Drizzle ORM
- Added database relations and automatic seeding with sample data