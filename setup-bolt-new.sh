#!/bin/bash
# Temporary Frontend Setup for Bolt.new
# Run this in the frontend directory

echo "🎨 Setting up temporary frontend for bolt.new..."

# Initialize git repository
git init

# Add all files
git add .

# Initial commit
git commit -m "Temporary frontend for bolt.new UI/UX improvements"

echo "✅ Frontend repository initialized!"
echo ""
echo "📝 Next steps:"
echo "1. Create a new repository on GitHub (e.g., 'webulae-frontend-temp')"
echo "2. Run: git remote add origin https://github.com/yourusername/webulae-frontend-temp.git"
echo "3. Run: git push -u origin main"
echo "4. Go to bolt.new and connect your GitHub account"
echo "5. Select this repository and deploy"
echo ""
echo "🔧 Remember to set environment variables in bolt.new:"
echo "   NEXT_PUBLIC_API_URL=http://localhost:8000"
echo "   (plus all your other existing env vars)"
echo ""
echo "🖥️  Keep your backend running locally:"
echo "   cd python_service && python main.py"
