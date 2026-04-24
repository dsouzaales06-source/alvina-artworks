# Alvina Artworks E-Commerce Platform - Setup & Deployment Guide

## Overview

Alvina Artworks is a fully functional e-commerce platform for selling handmade candles, wedding decorations, and Catholic church decorations. The platform includes a customer-facing storefront, shopping cart, checkout, and a complete admin panel for managing products and orders.

## Technology Stack

- **Frontend**: React 19, Tailwind CSS 4, TypeScript
- **Backend**: Express 4, tRPC 11, Node.js
- **Database**: MySQL/TiDB
- **Authentication**: Manus OAuth
- **Storage**: S3 (for product images)
- **Testing**: Vitest

## Prerequisites

Before deploying, ensure you have:

1. **Database Access**: MySQL or TiDB connection string
2. **OAuth Credentials**: Manus OAuth application ID and secrets
3. **S3 Storage**: AWS S3 bucket for product images
4. **Node.js**: Version 22.13.0 or higher
5. **pnpm**: Package manager (included in the template)

## Initial Setup

### 1. Environment Variables

The following environment variables are automatically injected by the Manus platform:

- `DATABASE_URL`: MySQL/TiDB connection string
- `JWT_SECRET`: Session cookie signing secret
- `VITE_APP_ID`: Manus OAuth application ID
- `OAUTH_SERVER_URL`: Manus OAuth backend URL
- `VITE_OAUTH_PORTAL_URL`: Manus login portal URL
- `OWNER_OPEN_ID`: Owner's Manus OpenID
- `OWNER_NAME`: Owner's name
- `BUILT_IN_FORGE_API_URL`: Manus built-in APIs URL
- `BUILT_IN_FORGE_API_KEY`: Bearer token for Manus APIs (server-side)
- `VITE_FRONTEND_FORGE_API_KEY`: Bearer token for frontend
- `VITE_FRONTEND_FORGE_API_URL`: Manus APIs URL (frontend)

### 2. Database Setup

The database schema is automatically created during the first deployment. The schema includes:

- **users**: User accounts with OAuth integration
- **categories**: Product categories (Candles, Wedding Decorations, Catholic Church Decorations)
- **products**: Product listings with images and pricing
- **cartItems**: Shopping cart items per user
- **orders**: Order records with customer information
- **orderItems**: Individual items in each order

### 3. Seed Sample Data (Optional)

To populate the database with sample products:

```bash
pnpm node seed-db.mjs
```

This will create:
- 3 product categories
- 8 sample products across all categories

## Running the Application

### Development

```bash
pnpm dev
```

The dev server will start at `http://localhost:3000`

### Production Build

```bash
pnpm build
pnpm start
```

## Key Features

### Customer Features

1. **Homepage**: Hero banner, featured collections, brand story
2. **Product Catalog**: Browse products by category (Candles, Wedding Decorations, Catholic Church Decorations)
3. **Product Details**: View product information, images, and pricing
4. **Shopping Cart**: Add/remove items, update quantities
5. **Checkout**: Enter shipping information and place orders
6. **Account**: View order history and track order status

### Admin Features

1. **Product Management**: Create, edit, delete products with image uploads
2. **Order Management**: View all orders and update order status
3. **Protected Routes**: Only users with admin role can access admin panel

## User Roles

### Customer (Default)

- Browse products
- Add items to cart
- Place orders
- View order history
- Track order status

### Admin

- All customer features
- Create/edit/delete products
- Manage product images
- View all orders
- Update order status

**To make a user an admin**: Update their `role` field in the `users` table to `'admin'` via the database.

## API Endpoints

All API endpoints are under `/api/trpc/` and use tRPC for type-safe communication.

### Public Procedures

- `categories.list`: Get all product categories
- `products.list`: Get all active products
- `products.getBySlug`: Get product by slug
- `products.getById`: Get product by ID
- `products.getByCategory`: Get products by category

### Protected Procedures (Requires Login)

- `cart.get`: Get user's shopping cart
- `cart.add`: Add item to cart
- `cart.remove`: Remove item from cart
- `cart.updateQuantity`: Update cart item quantity
- `cart.clear`: Clear entire cart
- `orders.create`: Create a new order
- `orders.list`: Get user's orders
- `orders.getById`: Get order details
- `auth.me`: Get current user info
- `auth.logout`: Sign out user

### Admin Procedures (Requires Admin Role)

- `adminProducts.list`: Get all products (including inactive)
- `adminProducts.create`: Create new product
- `adminProducts.update`: Update product
- `adminProducts.delete`: Delete product
- `adminOrders.list`: Get all orders
- `adminOrders.updateStatus`: Update order status

## Product Image Upload

Product images are stored in S3 and accessed via `/manus-storage/` URLs. When uploading images:

1. Images are base64-encoded in the admin form
2. Uploaded to S3 via the backend
3. Stored with a unique key in the database
4. Served via signed URLs for security

## Order Management

### Order Status Flow

1. **pending**: Order just created, awaiting processing
2. **processing**: Order is being prepared
3. **shipped**: Order has been shipped
4. **delivered**: Order has been delivered
5. **cancelled**: Order has been cancelled

Admin can update order status at any time from the admin dashboard.

## Authentication Flow

1. User clicks "Sign In" button
2. Redirected to Manus OAuth portal
3. User authenticates with Manus
4. Redirected back to `/api/oauth/callback`
5. Session cookie is created
6. User is logged in and can access protected features

## Testing

Run all tests with:

```bash
pnpm test
```

Tests include:
- Backend procedure tests (categories, products, cart, orders, admin)
- Authentication tests
- Authorization tests (admin vs customer)

## Performance Considerations

1. **Database Queries**: All queries are optimized with proper indexing
2. **Caching**: tRPC queries are cached on the client side
3. **Image Optimization**: Product images should be optimized before upload
4. **Pagination**: Consider adding pagination for large product lists

## Security

1. **OAuth Authentication**: All user authentication goes through Manus OAuth
2. **Role-Based Access Control**: Admin procedures are protected by role checks
3. **HTTPS Only**: All cookies are secure and HTTP-only
4. **SQL Injection Protection**: Using parameterized queries via Drizzle ORM
5. **CSRF Protection**: Automatic via secure session cookies

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database credentials
- Ensure database is accessible from the deployment environment

### OAuth Issues

- Verify `VITE_APP_ID` matches your Manus OAuth application
- Check `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` are correct
- Ensure redirect URLs are properly configured in Manus OAuth settings

### Image Upload Issues

- Verify S3 credentials and bucket access
- Check file size limits (typically 5MB for images)
- Ensure image format is supported (JPEG, PNG, WebP, etc.)

## Monitoring & Maintenance

1. **Regular Backups**: Set up automated database backups
2. **Log Monitoring**: Monitor server logs for errors
3. **Performance Monitoring**: Track page load times and API response times
4. **Database Maintenance**: Regularly optimize database tables

## Support & Customization

For additional features or customization:

1. Extend the database schema in `drizzle/schema.ts`
2. Add new tRPC procedures in `server/routers.ts`
3. Create new frontend pages in `client/src/pages/`
4. Update styling in `client/src/index.css`

## Deployment

The application is ready to deploy to Manus hosting or any Node.js hosting platform:

1. Build: `pnpm build`
2. Start: `pnpm start`
3. The application will listen on the port specified by the environment

## License

MIT License - See LICENSE file for details
