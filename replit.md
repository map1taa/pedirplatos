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
- **Simplified Database Schema**: Removed size, category, and description fields from dishes table
- **Compact B2B UI Design**: Implemented 11pt font size globally for maximum information density
- **Product Display Optimization**: Converted from horizontal cards to dense table layout for B2B efficiency
  - Smaller product images (48x48px thumbnails)
  - Compact table rows with minimal padding
  - Streamlined quantity controls with smaller buttons
- **Header and Navigation Updates**: Reduced header height and button sizes for space efficiency
- **Shopping Cart Redesign**: Compact sidebar with reduced spacing and smaller UI elements
- **Form Optimization**: Reduced form field sizes and spacing in product management
- **Default Quantity Behavior**: Items start at 0 quantity with validation preventing empty cart additions
- **Database Migration**: Successfully migrated from in-memory storage to PostgreSQL with simplified schema
- **Spanish Localization**: Complete Spanish language interface throughout the application
  - All user-facing text converted from Japanese to Spanish
  - Form validation messages translated to Spanish
  - Navigation, buttons, and labels fully localized
  - Error messages and toast notifications in Spanish
- **Category Management System**: Implemented comprehensive category management functionality
  - Added categories table with door image support for product grouping
  - Created category management API with CRUD operations
  - Enhanced product management interface with 3-tab design (Products, List, Categories)
  - Category selector in product form for assigning products to categories
  - Door image upload functionality for category visual grouping
  - Categories tab with creation form and existing categories list
  - Full integration between products and categories for organized display
- **Japanese Localization Update**: Complete Japanese translation of all interfaces
  - Management interface fully translated to Japanese (商品管理, カテゴリ管理)
  - Shopping cart and checkout modal in Japanese
  - Product grid with Japanese headers and actions
  - All form validation messages and toast notifications in Japanese
  - Currency display changed from € to ¥ throughout the application
  - Email notifications remain in Spanish as per customer requirements
- **Management Interface Redesign**: Complete overhaul to match product page layout
  - Categories displayed with door images same as customer-facing view
  - Products grouped under each category with table layout
  - Direct add/edit/delete buttons for each category and product
  - Simple modal dialogs for product and category creation/editing
  - Removed complex 3-tab interface in favor of unified category-based view
  - Category management integrated into main view with inline controls
- **Direct Image Upload Enhancement**: Implemented drag-and-drop functionality
  - Door images can be updated by dragging images directly onto the image area
  - Product images support direct drag-and-drop upload in management interface
  - Visual feedback with hover effects and upload indicators
  - No form fields required - images update immediately upon drop
  - Door image height increased to 256px (2x original) for better visibility
- **Static HTML Version**: Created standalone HTML version for easy deployment
  - Complete static HTML/CSS/JavaScript implementation
  - No database or server dependencies required
  - All core functionality preserved (product display, cart, checkout)
  - Sample data embedded for immediate functionality
  - Compatible with any static hosting service (GitHub Pages, Netlify, etc.)