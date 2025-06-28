# Merge Back Guide (When Done with Bolt.new)

## Option 1: Simple Copy (Recommended)

1. Download your improved frontend from bolt.new
2. In your main project directory, run:
   ```bash
   # Backup current frontend files
   mkdir frontend-backup
   cp -r app components hooks lib public types utils schemas frontend-backup/
   
   # Replace with improved files from bolt.new
   rm -rf app components hooks lib public types utils schemas
   cp -r downloaded-bolt-new-files/* .
   
   # Restore backend dependencies in package.json
   # (Add back: airtable, stripe, openai, etc.)
   ```

3. Test everything works: `npm run dev`
4. Delete the temporary repository

## Option 2: Git Merge

1. Add bolt.new repo as remote:
   ```bash
   git remote add bolt-temp https://github.com/yourusername/webulae-frontend-temp.git
   git fetch bolt-temp
   git merge bolt-temp/main --allow-unrelated-histories
   ```

2. Resolve conflicts in package.json and environment files
3. Test and commit

## What to Keep from Bolt.new

✅ UI/UX improvements
✅ Component optimizations
✅ Styling changes
✅ Performance improvements
✅ Accessibility enhancements

## What to Restore

❌ Backend dependencies (airtable, stripe, openai)
❌ API route handlers (keep in backend)
❌ Environment variables (restore original structure)
❌ Database migrations (keep in backend)

## Testing After Merge

1. Start backend: `cd python_service && python main.py`
2. Start frontend: `npm run dev`
3. Test all features work correctly
4. Deploy normally when satisfied
