# Alvina Artworks - Admin Dashboard Guide

## Quick Start: Accessing the Admin Dashboard

### Step 1: Log In to Your Account
1. Go to your Alvina Artworks website
2. Click the **"Sign In"** button in the top-right corner
3. You'll be redirected to the Manus OAuth login page
4. Sign in with your credentials (Google, or your Manus account)
5. You'll be redirected back to the website, now logged in

### Step 2: Access the Admin Dashboard
**Important:** You must have admin privileges to access this page. Contact support if you don't have admin access.

1. Once logged in, navigate to: `https://your-site.manus.space/admin`
2. Or click the admin link if available in your navigation menu
3. You should see the **Admin Dashboard** with two tabs: **Products** and **Orders**

If you see "Access Denied," you don't have admin privileges yet. Contact support to enable admin access for your account.

---

## Managing Products

### Adding a New Product

1. Click the **"Add Product"** button (green button with + icon)
2. A form will appear with the following fields:

#### Required Fields (marked with *)
- **Product Name**: The name of your product (e.g., "Rose Garden Candle")
- **Slug**: A URL-friendly version of the name (e.g., "rose-garden-candle")
  - Use lowercase letters, numbers, and hyphens only
  - No spaces or special characters
- **Price**: The selling price (e.g., "29.99")
- **Category**: Select from:
  - Candles
  - Wedding Decorations
  - Catholic Church Decorations

#### Optional Fields
- **SKU**: Stock Keeping Unit (internal product code)
- **Stock**: Number of items in stock (default: 0)
- **Product Status**: Choose the status:
  - **Available**: Product is in stock and ready to purchase
  - **Out of Stock**: Product is temporarily unavailable
  - **Limited Time Deal**: Special promotion with limited availability
  - **Coming Soon**: Product will be available soon
- **Description**: Detailed product description (what makes it special, materials, dimensions, etc.)
- **Product Image**: Upload a product photo (JPEG, PNG, WebP)

3. Fill in all required fields
4. Click **"Create Product"** button
5. You'll see a success message, and the product appears on your catalog

### Editing an Existing Product

1. Find the product you want to edit in the Products list
2. Click the **Edit** button (pencil icon)
3. The form will populate with the current product details
4. Make your changes to any field
5. Click **"Update Product"** button
6. Changes appear immediately on your store

### Deleting a Product

1. Find the product in the Products list
2. Click the **Delete** button (trash icon)
3. Confirm the deletion
4. Product is removed from your catalog

**Note:** Deleted products cannot be recovered, so be careful!

---

## Product Status Badges

When you set a product status, it displays as a colored badge on product cards:

| Status | Badge Color | Icon | Display |
|--------|-------------|------|---------|
| Available | Green | ✓ | "In Stock" |
| Out of Stock | Gray | ✕ | "Out of Stock" |
| Limited Time Deal | Orange | ⏰ | "Limited Time Deal" |
| Coming Soon | Blue | ★ | "Coming Soon" |

**Example Use Cases:**
- **Available**: New candle collection just arrived
- **Out of Stock**: Popular item temporarily sold out
- **Limited Time Deal**: Flash sale on wedding decorations (50% off)
- **Coming Soon**: New Catholic church candle collection launching next month

---

## Managing Orders

### Viewing All Orders

1. Click the **"Orders"** tab in the Admin Dashboard
2. You'll see a list of all customer orders with:
   - Order number
   - Customer name
   - Order date
   - Total amount
   - Current status

### Updating Order Status

1. Find the order you want to update
2. Click the status dropdown
3. Select the new status:
   - **Pending**: Order just received, awaiting processing
   - **Processing**: Order is being prepared for shipment
   - **Shipped**: Order has been sent to the customer
   - **Delivered**: Order has reached the customer
   - **Cancelled**: Order has been cancelled

4. The status updates immediately
5. Customers can see the updated status in their account

**Status Flow Example:**
```
Customer Places Order
        ↓
   Pending (you receive notification)
        ↓
   Processing (you prepare the package)
        ↓
   Shipped (you send tracking info)
        ↓
   Delivered (customer receives order)
```

---

## Best Practices

### Product Management
1. **Use clear, descriptive names**: "Rose Garden Scented Candle" instead of "Candle 1"
2. **Write detailed descriptions**: Include materials, size, scent notes, burning time
3. **Upload high-quality images**: Clear, well-lit product photos help customers decide
4. **Keep stock updated**: Regularly update stock numbers to avoid overselling
5. **Use status strategically**: 
   - Mark items "Limited Time Deal" during promotions
   - Set "Coming Soon" for pre-orders
   - Use "Out of Stock" instead of deleting popular items

### Order Management
1. **Update status promptly**: Keep customers informed of their order progress
2. **Process orders within 24 hours**: Aim to move orders from "Pending" to "Processing" quickly
3. **Provide tracking**: When shipping, include tracking information if possible
4. **Respond to inquiries**: Check customer messages regularly

### Image Upload Tips
- **File size**: Keep images under 5MB for faster loading
- **Format**: Use JPEG or PNG for best quality
- **Dimensions**: Use square images (e.g., 1000x1000px) for best appearance
- **Optimization**: Compress images before uploading to improve page speed

---

## Troubleshooting

### I can't access the admin dashboard
**Solution**: 
- Make sure you're logged in (check the top-right corner)
- Verify your account has admin privileges
- Try logging out and back in
- Contact support if the problem persists

### Product changes aren't showing up
**Solution**:
- Refresh the page (Ctrl+R or Cmd+R)
- Clear your browser cache
- Wait 30 seconds for the changes to propagate
- Check if you're looking at the correct category filter

### I accidentally deleted a product
**Solution**:
- Unfortunately, deleted products cannot be recovered
- You'll need to recreate the product with the same details
- In the future, use "Out of Stock" status instead of deleting

### Image upload failed
**Solution**:
- Check that the file is an image (JPEG, PNG, WebP)
- Verify the file size is under 5MB
- Try a different image file
- Contact support if the problem continues

### Order status won't update
**Solution**:
- Refresh the page
- Try selecting the status again
- Make sure you have admin privileges
- Contact support if the issue persists

---

## Tips for Success

### Growing Your Business
1. **Regular inventory updates**: Keep stock numbers accurate
2. **Seasonal promotions**: Use "Limited Time Deal" status for holidays
3. **New product launches**: Use "Coming Soon" to build anticipation
4. **Customer communication**: Update order statuses promptly for better reviews
5. **High-quality images**: Invest in good product photography

### Customer Satisfaction
- Respond to inquiries quickly
- Keep products accurately described
- Update stock to prevent overselling
- Provide tracking information when shipping
- Handle returns professionally

### Marketing Ideas
- Highlight "Limited Time Deal" products on social media
- Use "Coming Soon" to tease new collections
- Share customer photos of products (with permission)
- Offer bundle deals combining different categories

---

## Contact & Support

For technical issues or questions about the admin dashboard:
1. Check this guide first
2. Review the SETUP.md file for technical details
3. Contact Manus support at https://help.manus.im

For business questions about managing your Alvina Artworks store:
- Refer to the Best Practices section above
- Consult with your business mentor or advisor

---

## Quick Reference

| Action | Steps |
|--------|-------|
| **Add Product** | Dashboard → Add Product → Fill Form → Create |
| **Edit Product** | Dashboard → Find Product → Edit → Update |
| **Delete Product** | Dashboard → Find Product → Delete → Confirm |
| **Update Order Status** | Orders Tab → Find Order → Select Status → Save |
| **View All Products** | Dashboard → Products Tab (default view) |
| **Filter by Category** | Catalog Page → Select Category in Sidebar |
| **View Product Details** | Click on any product card |

---

## Keyboard Shortcuts (Coming Soon)

These shortcuts will be available in future updates:
- `Ctrl+N` (Cmd+N on Mac): New Product
- `Ctrl+S` (Cmd+S on Mac): Save/Update
- `Ctrl+D` (Cmd+D on Mac): Delete
- `Ctrl+/` (Cmd+/ on Mac): Help

For now, use the buttons in the interface.

---

Last Updated: April 2026
Version: 1.0
