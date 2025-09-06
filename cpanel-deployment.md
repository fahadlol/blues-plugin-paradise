# cPanel Deployment Guide

This project has been optimized for cPanel hosting. Follow these steps to deploy:

## Prerequisites
- cPanel hosting account with Node.js support (if available) or static file hosting
- FTP/File Manager access
- Domain/subdomain configured

## Deployment Steps

### 1. Build the Project
Before uploading, you need to build the project:

```bash
npm run build
```

This creates a `dist` folder with all static files optimized for production.

### 2. Upload Files
Upload the contents of the `dist` folder to your domain's public folder:
- For main domain: `public_html/`
- For subdomain: `public_html/subdomain_name/`

### 3. File Structure After Upload
```
public_html/
├── index.html
├── assets/
│   ├── css files
│   ├── js files
│   └── images
├── .htaccess (handles routing)
└── other static assets
```

### 4. Supabase Configuration
The app connects to Supabase for backend functionality:
- Database: Already configured and hosted on Supabase
- Authentication: Handled by Supabase
- Edge Functions: Hosted on Supabase (no server needed)
- File Storage: Managed by Supabase

### 5. Environment Variables
No environment variables needed in production - all Supabase configurations are hardcoded for security.

## Features That Work on cPanel

✅ **Frontend Application**: Full React app with routing
✅ **User Authentication**: Supabase Auth
✅ **Database Operations**: All CRUD operations via Supabase
✅ **File Uploads**: Handled by Supabase Storage
✅ **Payment Processing**: Stripe & PayPal (client-side)
✅ **Download Management**: Secure downloads via Supabase
✅ **Admin Dashboard**: Full admin functionality
✅ **Responsive Design**: Works on all devices

## Important Notes

1. **No Server Required**: This is a static site that communicates with Supabase
2. **Routing**: The `.htaccess` file handles React Router navigation
3. **API Calls**: All backend calls go to Supabase (external service)
4. **File Downloads**: Managed through Supabase Edge Functions
5. **Payments**: Processed client-side with Stripe/PayPal APIs

## Performance Optimizations

- Code splitting for faster loading
- Compressed assets
- Browser caching enabled
- Minified JavaScript and CSS
- Optimized images

## Security Features

- XSS protection headers
- Content type validation
- Frame options for clickjacking protection
- Secure file access restrictions

## Testing the Deployment

After uploading:
1. Visit your domain
2. Test navigation between pages
3. Test user registration/login
4. Test plugin browsing and purchase flow
5. Test admin dashboard (if you have admin access)

## Troubleshooting

**Page Not Found on Refresh**: 
- Ensure `.htaccess` is uploaded and mod_rewrite is enabled

**Assets Not Loading**:
- Check file paths are correct
- Verify all files from `dist` folder are uploaded

**API Errors**:
- Supabase should work from any domain
- Check browser console for specific errors

## Support

If you encounter issues:
1. Check cPanel error logs
2. Verify all files are uploaded correctly
3. Test Supabase connection in browser console
4. Contact your hosting provider about mod_rewrite support