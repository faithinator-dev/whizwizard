# 🚀 Deployment Guide - WhizWizard (Frontend Only)

Your app is frontend-only and can be deployed to any static hosting service!

## 🌐 Recommended Hosting Options

### 1. **Vercel** (Easiest - Recommended!)

Perfect for frontend apps, automatic deployments from Git.

#### Deploy Steps:
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty
   - **Output Directory**: `.` (root)
6. Click "Deploy"

**Update Firebase Config:**
- After deployment, add your Vercel domain to Firebase authorized domains
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your `*.vercel.app` domain

✅ **Free tier**: Unlimited deployments, automatic HTTPS

---

### 2. **Netlify**

Another great option with drag-and-drop deployment.

#### Deploy Steps:
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `src` folder
3. Or connect to GitHub for automatic deployments

**Configuration:**
- **Publish directory**: `.` (root)
- **Build command**: Leave empty

**Update Firebase Config:**
- Add your Netlify domain to Firebase authorized domains
- Format: `your-app.netlify.app`

✅ **Free tier**: 100GB bandwidth/month, automatic HTTPS

---

### 3. **Firebase Hosting**

Host directly on Firebase (same platform as your database!)

#### Deploy Steps:
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize hosting:
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - **Public directory**: `src`
   - **Single-page app**: Yes
   - **Overwrite index.html**: No

4. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

✅ **Free tier**: 10GB storage, 360MB/day transfer

---

### 4. **GitHub Pages**

Free hosting from GitHub repositories.

#### Deploy Steps:
1. Push code to GitHub
2. Go to repository Settings → Pages
3. Select branch: `main` or `master`
4. Select folder: `/src` or `/root` (may need to reorganize)
5. Click Save

**Note**: May need to move contents of `src/` to root for GitHub Pages.

**Update Firebase Config:**
- Add `username.github.io` to Firebase authorized domains

✅ **Free**: Unlimited sites for public repos

---

### 5. **Azure Static Web Apps**

Microsoft's static hosting solution.

#### Deploy Steps:
1. Go to [Azure Portal](https://portal.azure.com)
2. Create "Static Web App"
3. Connect to GitHub
4. Configure:
   - **App location**: `/`
   - **Build location**: Leave empty

✅ **Free tier**: 100GB bandwidth/month

---

## 🔧 Post-Deployment Checklist

After deploying to any platform:

1. ✅ **Update Firebase Authorized Domains**
   - Go to Firebase Console → Authentication → Settings → Authorized domains
   - Add your production domain (e.g., `myapp.vercel.app`)

2. ✅ **Test Authentication**
   - Try signing up and logging in
   - Test Google Sign-In (if enabled)

3. ✅ **Test Quiz Creation**
   - Create a test quiz
   - Verify data saves to Firestore

4. ✅ **Test Live Quiz**
   - Start a live session
   - Join from another device
   - Verify real-time updates work

5. ✅ **Update Firebase Security Rules** (Production)
   - Go to Firestore → Rules
   - Change from test mode to production rules
   - See `FIREBASE_WEB_CONFIG.md` for recommended rules

---

## 🔒 Security Best Practices

### Firebase Firestore Rules (Production)

Replace test mode rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(userId);
    }
    
    // Quizzes - anyone can read, only owners can modify
    match /quizzes/{quizId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                               resource.data.createdBy == request.auth.uid;
    }
    
    // Results
    match /results/{resultId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Live rooms
    match /liveRooms/{roomId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() &&
                               resource.data.hostId == request.auth.uid;
    }
  }
}
```

---

## 📊 Monitoring

### Firebase Console

Monitor your app:
- **Authentication**: User count, sign-in methods
- **Firestore**: Database usage, document counts
- **Usage & Billing**: Track free tier limits

### Analytics (Optional)

Enable Firebase Analytics:
1. Firebase Console → Analytics
2. Enable Google Analytics
3. Add analytics to your app

---

## 🆘 Troubleshooting

### Issue: "Firebase not configured"
- **Solution**: Make sure `firebase-config.js` has your actual credentials

### Issue: "Access denied" errors
- **Solution**: Update Firestore security rules (see above)

### Issue: Authentication not working
- **Solution**: Add production domain to Firebase authorized domains

### Issue: CORS errors
- **Solution**: This shouldn't happen with static hosting, but check Firebase authorized domains

---

## 💰 Cost Estimate

**Firebase Free Tier** (Spark Plan):
- ✅ 50,000 reads/day
- ✅ 20,000 writes/day
- ✅ 1GB storage
- ✅ 10GB/month transfer

**Perfect for:**
- Personal projects
- Testing and development
- Small to medium user base (100-1000 daily users)

**Need more?** Upgrade to Blaze (pay as you go) plan.

---

## 🎉 Success!

Your WhizWizard quiz platform is now live and accessible to anyone!

**Share your app** and start hosting quizzes! 🚀
