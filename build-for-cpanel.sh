#!/bin/bash

# Build script for cPanel deployment
echo "🔧 Building for cPanel hosting..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the project
echo "🏗️ Building the project..."
npm run build

# Copy .htaccess to dist folder
echo "📋 Copying .htaccess for Apache routing..."
cp public/.htaccess dist/

# Create deployment zip
echo "📦 Creating deployment package..."
cd dist
zip -r ../cpanel-deployment.zip .
cd ..

echo "✅ Build complete!"
echo ""
echo "📁 Files ready for upload in: ./dist/"
echo "📦 Deployment package: ./cpanel-deployment.zip"
echo ""
echo "📖 Next steps:"
echo "1. Upload contents of 'dist' folder to your cPanel public_html directory"
echo "2. Or extract 'cpanel-deployment.zip' in your public_html directory"
echo "3. Ensure .htaccess file is uploaded for proper routing"
echo ""
echo "🌐 Your site will be ready at your domain!"