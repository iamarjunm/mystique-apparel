# Firebase/Sanity Initialization Fixes

## ✅ Changes Made

### 1. **firebase.js** - Enhanced env var validation and error handling
   - Added `isFirebaseConfigValid()` function to check if all required config exists
   - Added default fallback values to prevent undefined errors
   - Added try-catch wrapping around Firebase initialization
   - Added console logging to show which config values are missing
   - Gracefully handles missing API keys without crashing

### 2. **AuthContext.jsx** - Better error handling and Firebase availability checks
   - Added check for Firebase auth availability before using it
   - Added try-catch wrapper around auth listener setup
   - Added fallback for Sanity profile creation failures
   - Better error messages to guide debugging

### 3. **Debug Page** - New diagnostic tool
   - Created `/src/app/debug-env.jsx` to check env vars at runtime
   - Navigate to `/debug-env` in your deployed app to see:
     - Which environment variables are loaded
     - Which ones are missing
     - Tips for fixing

## 🔍 What to Do Next

### 1. **Deploy to Vercel and Check Logs**
```bash
git add .
git commit -m "Fix Firebase/Sanity initialization with better error handling"
git push
# Vercel will auto-deploy
```

### 2. **After Deployment, Check Your App**

#### Check Environment Variables:
- Go to your Vercel app → Settings → Environment Variables
- Verify ALL these variables are set (case-sensitive):
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  NEXT_PUBLIC_FIREBASE_PROJECT_ID
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  NEXT_PUBLIC_FIREBASE_APP_ID
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  NEXT_PUBLIC_SANITY_PROJECT_ID
  NEXT_PUBLIC_SANITY_DATASET
  NEXT_PUBLIC_SANITY_TOKEN (optional but recommended)
  ```

#### Debug the App:
- Visit: `https://your-app.vercel.app/debug-env`
- Check the browser console (F12)
- All Firebase config values should show "✓ SET"
- If any show "✗ MISSING", add them to Vercel and redeploy

### 3. **If Issues Persist**

Check browser console for logs like:
```
🔧 [SANITY] Initializing Sanity client...
✅ [SANITY] Client initialized successfully
```

If you see warnings about missing Firebase config, the error is one of:
1. **Env var not in Vercel** → Add it to Vercel settings and redeploy
2. **Typo in env var name** → Check exact spelling (case-sensitive)
3. **Invalid API key** → Generate new Firebase credentials
4. **Env var syntax error** → Make sure value is valid (no extra quotes, etc.)

### 4. **Firebase API Key Validation**

Your Firebase API key might be invalid. To fix:
1. Go to Firebase Console → Project Settings
2. Copy the exact Web API Key value
3. Paste it EXACTLY into Vercel (no extra quotes or spaces)
4. Redeploy

### 5. **Check Deployment Logs**

In Vercel dashboard:
1. Go to Deployments
2. Click the latest deployment
3. View Build Logs for any errors during build
4. View Runtime Logs for any errors during page load

## 📋 Key Improvements

✅ Firebase no longer crashes if env vars are missing
✅ Sanity client gracefully handles missing config
✅ Better error messages for debugging
✅ Detailed logging in browser console
✅ Diagnostic page to verify env vars at runtime
✅ Fallback behavior if either service fails

## 🚀 Once Env Vars are Set

The app will:
1. Load Firebase config from NEXT_PUBLIC_FIREBASE_* variables
2. Validate all required fields exist
3. Initialize only on client-side (not during build)
4. Show detailed logs in console
5. Fall back gracefully if Firebase is unavailable

## Next Step: After Pushing Changes

**Tell me when you've:**
1. Pushed the code to GitHub
2. Deployed to Vercel
3. Checked `/debug-env` page
4. Shared what env vars are showing as SET vs MISSING

Then I can help with the next steps based on what's actually missing!
