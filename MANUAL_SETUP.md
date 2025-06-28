# Manual Setup for Bolt.new (Git Config Issue Workaround)

Since there's a Git configuration issue, here's how to manually set up your frontend for bolt.new:

## Option 1: Manual File Upload to GitHub

### 1. Create a New Repository on GitHub
- Go to GitHub and create a new repository (e.g., `webulae-frontend-temp`)
- **Don't** initialize with README, .gitignore, or license

### 2. Upload Files Manually
- In your GitHub repository, click "uploading an existing file"
- Select all files from your `frontend/` directory:
  - `app/` folder
  - `components/` folder
  - `hooks/` folder
  - `lib/` folder
  - `public/` folder
  - `package.json`
  - `package-lock.json`
  - `next.config.js`
  - `tailwind.config.js`
  - `tsconfig.json`
  - `.env.example`
  - `README.md`
  - All other configuration files

### 3. Commit the Files
- Add a commit message like "Initial frontend for bolt.new"
- Commit the files

## Option 2: Use GitHub Desktop (Recommended)

### 1. Install GitHub Desktop
- Download from: https://desktop.github.com/

### 2. Clone Your Repository
- Open GitHub Desktop
- Clone your remote repository to a new folder

### 3. Copy Frontend Files
- Copy all files from `frontend/` directory to the cloned repository
- Commit and push through GitHub Desktop

## Option 3: Fix Git Config (Advanced)

If you want to fix the Git config issue:

1. **Check your Git config location**:
   ```bash
   git config --global --list --show-origin
   ```

2. **Reset Git config**:
   ```bash
   git config --global --unset-all user.name
   git config --global --unset-all user.email
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Or create a new config file**:
   ```bash
   mkdir -p ~/.config/git
   echo "[user]" > ~/.config/git/config
   echo "    name = Your Name" >> ~/.config/git/config
   echo "    email = your.email@example.com" >> ~/.config/git/config
   ```

## After Repository is Ready

### 1. Deploy to Bolt.new
- Go to [bolt.new](https://bolt.new)
- Connect your GitHub account
- Select your frontend repository
- Deploy

### 2. Set Environment Variables in Bolt.new
Copy these from `bolt-new-env-template.txt`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_PRICE_ID=your_stripe_pro_price_id
STRIPE_PRO_PLUS_PRICE_ID=your_stripe_pro_plus_price_id
STRIPE_SUCCESS_URL=http://localhost:3000/premium
STRIPE_CANCEL_URL=http://localhost:3000/pricing
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start Your Backend Locally
```bash
# In your main project directory
cd python_service
python main.py
```

## Test the Setup

1. **Test backend**: `curl http://localhost:8000/health`
2. **Test frontend**: Visit your bolt.new URL
3. **Test connection**: Try logging in or using features that call the backend

## Troubleshooting

- **CORS issues**: Add your bolt.new domain to backend CORS settings
- **API connection**: Ensure `NEXT_PUBLIC_API_URL=http://localhost:8000`
- **Environment variables**: Double-check all variables are set in bolt.new

## Next Steps

Once deployed and working:
1. Focus on UI/UX improvements in bolt.new
2. Keep backend running locally
3. Test frequently to ensure compatibility
4. When done, follow the merge guide to bring improvements back 