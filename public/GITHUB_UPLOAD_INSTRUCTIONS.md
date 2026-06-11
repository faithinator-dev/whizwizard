# GitHub Upload Instructions

## Quick Setup Commands

After creating your GitHub repository, run these commands:

```powershell
# Navigate to project directory
cd "c:\Users\HomePC\Desktop\DKT TOOL\code\quiz app"

# Add your GitHub repository as remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/whizwizard.git

# Verify the remote was added
git remote -v

# Push to GitHub (first time)
git push -u origin master

# Or if you prefer to use 'main' as the default branch:
git branch -M main
git push -u origin main
```

## If You Get Authentication Errors

GitHub no longer accepts passwords for git operations. You need to use a **Personal Access Token (PAT)**:

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name like "WhizWizard Upload"
4. Select scopes: `repo` (full control of private repositories)
5. Generate and **copy the token**
6. Use this token as your password when pushing

## Alternative: Use GitHub Desktop

If you prefer a GUI:
1. Download [GitHub Desktop](https://desktop.github.com/)
2. File → Add Local Repository → Select this folder
3. Click "Publish repository" button
4. Choose name and visibility (public/private)
5. Done!

## What's Already Done

✅ Git repository initialized  
✅ All files committed  
✅ `.gitignore` configured (protects sensitive files like `firebase-service-account.json`)  
✅ Ready to push to GitHub  

## Repository Contents

- Complete WhizWizard quiz application
- Firebase/Firestore backend integration
- Frontend HTML/CSS/JavaScript files
- Comprehensive documentation
- Project analysis report
