# Billing Fast - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is a comprehensive billing and inventory management application built with Next.js 15, TypeScript, and Tailwind CSS. The application includes both web and mobile versions with the following key features:

## Tech Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth animations
- **Icons**: Heroicons React
- **Charts**: Recharts for data visualization
- **Authentication**: NextAuth.js
- **Database**: Prisma with PostgreSQL
- **Payments**: Stripe integration
- **Forms**: React Hook Form with Zod validation

## Key Features to Implement
1. **Inventory Management**: Product catalog, stock tracking, barcode scanning
2. **GST-Compliant Billing**: Invoice generation with tax calculations
3. **Customer & Supplier Management**: CRM functionality
4. **Point of Sale System**: Quick billing interface
5. **Business Analytics**: Sales reports, profit analysis
6. **Subscription Management**: Multi-tier pricing plans
7. **Multi-device Access**: Responsive design for web and mobile

## Design Guidelines
- Use consistent color palette (primary: blue-600, success: green-500, warning: yellow-500, error: red-500)
- Implement smooth animations with Framer Motion
- Follow mobile-first responsive design
- Use Tailwind utility classes for styling
- Maintain consistent spacing and typography

## Code Standards
- Use TypeScript for type safety
- Implement proper error handling
- Follow Next.js 15 best practices with App Router
- Use server components when possible
- Implement proper loading states and animations
- Follow React hooks patterns and best practices

## Authentication Flow
- JWT-based authentication with NextAuth.js
- Role-based access control (Admin, Business Owner, Staff)
- Subscription-based feature access

## Database Schema
- Users, Businesses, Subscriptions
- Products, Categories, Inventory
- Customers, Suppliers
- Orders, Invoices, Payments
- Reports and Analytics data

When generating code:
1. Always use TypeScript with proper type definitions
2. Implement responsive design with Tailwind CSS
3. Add smooth animations where appropriate
4. Follow the established component structure and patterns
5. Include proper error handling and loading states
6. Ensure accessibility standards are met
