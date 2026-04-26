# Laravel Cloud Deployment Guide

## 🚀 Deploying CCS Profiling System to Laravel Cloud

Laravel Cloud is the perfect choice for this project as it handles:
- ✅ Laravel application hosting
- ✅ MySQL database automatically
- ✅ SSL certificates
- ✅ Environment variables
- ✅ Automatic deployments from GitHub

## 📋 Prerequisites

1. **GitHub Repository** ✅ (Already created)
2. **Laravel Cloud Account** - Sign up at [laravel.cloud](https://laravel.cloud)
3. **Payment Method** - Laravel Cloud requires billing (starts at ~$12/month)

## 🛠️ Deployment Steps

### Step 1: Connect Laravel Cloud to GitHub

1. Go to [laravel.cloud](https://laravel.cloud)
2. Click "New Project"
3. Connect your GitHub account
4. Select the `ITEW6-Project` repository
5. Choose the `backend` folder as project root

### Step 2: Configure Project Settings

Laravel Cloud will automatically detect your `laravel-cloud.yml` file:

```yaml
name: ccs-profiling-system
type: laravel
php: "8.2"
database:
  engine: mysql
  version: "8.0"
```

### Step 3: Set Environment Variables

In Laravel Cloud dashboard, set these variables:

```env
APP_NAME="CCS Profiling System"
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:generated_by_laravel_cloud
APP_URL=https://your-app-name.laravel.cloud

FRONTEND_URL=https://your-vercel-app.vercel.app
```

*Laravel Cloud will automatically set database variables:*
```env
DB_HOST=auto_generated
DB_PORT=3306
DB_DATABASE=auto_generated
DB_USERNAME=auto_generated
DB_PASSWORD=auto_generated
```

### Step 4: Deploy Backend

1. **Commit and push changes** (see below)
2. Laravel Cloud will automatically deploy
3. Database will be created and migrations run
4. Your app will be available at: `https://your-app-name.laravel.cloud`

### Step 5: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Select `frontend` folder as root directory
4. Set environment variable:
   ```
   VITE_API_URL=https://your-app-name.laravel.cloud/api
   ```
5. Deploy

## 🔧 Configuration Files Created

### Backend Configuration
- `backend/.cloudignore` - Files to exclude from deployment
- `backend/laravel-cloud.yml` - Laravel Cloud configuration
- `backend/.env.example` - Updated for Laravel Cloud variables

### Frontend Configuration
- `frontend/vercel.json` - Vercel deployment configuration
- `frontend/.env.example` - Updated with Laravel Cloud URL

## 📤 Commit and Push Changes

```bash
# Add all new configuration files
git add .

# Commit changes
git commit -m "Configure for Laravel Cloud deployment

- Add Laravel Cloud configuration files
- Update environment variables for production
- Configure frontend for Laravel Cloud backend
- Add deployment guides"

# Push to GitHub
git push origin master
```

## 🌐 Final Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │  Laravel Cloud  │
│                 │    │                 │
│  Frontend       │◄──►│   Backend       │
│  (React)        │    │   (Laravel)     │
│                 │    │                 │
│  - UI/UX        │    │  - API          │
│  - State        │    │  - Auth         │
│  - Routing      │    │  - Database     │
└─────────────────┘    └─────────────────┘
       │                       │
       │                       │
       ▼                       ▼
   Users               MySQL Database
                      (Auto-managed)
```

## 🔍 Testing Your Deployment

### 1. Backend Health Check
```bash
curl https://your-app-name.laravel.cloud/api/user
```

### 2. Frontend Access
Visit your Vercel domain and test:
- Login functionality
- Dashboard loading
- CRUD operations

### 3. CORS Verification
- Check browser console for CORS errors
- Ensure `FRONTEND_URL` is set correctly in Laravel Cloud

## 🚀 Quick Commands

### View Deployment Logs
```bash
# In Laravel Cloud dashboard
# Go to your project > Logs
```

### Re-deploy Backend
```bash
git add .
git commit -m "Update backend"
git push origin master
# Laravel Cloud auto-deploys
```

### Re-deploy Frontend
```bash
# Push to GitHub
# Vercel auto-deploys
```

### Database Access
```bash
# Laravel Cloud provides database credentials
# Use in Laravel Cloud dashboard > Database
```

## 🆘 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Solution:** Ensure `FRONTEND_URL` is set correctly in Laravel Cloud environment variables.

#### 2. Database Connection Failed
**Solution:** Laravel Cloud handles database automatically. Check if migrations ran successfully.

#### 3. 500 Server Error
**Solution:** Check Laravel Cloud logs for specific error messages.

#### 4. Frontend Not Loading
**Solution:** Verify `VITE_API_URL` is set correctly in Vercel environment variables.

### Debugging Steps

1. **Check Laravel Cloud Logs**
   - Dashboard > Your Project > Logs

2. **Verify Environment Variables**
   - Dashboard > Your Project > Environment

3. **Test API Directly**
   ```bash
   curl -H "Accept: application/json" https://your-app.laravel.cloud/api/user
   ```

4. **Check Database Status**
   - Dashboard > Your Project > Database

## 📋 Pre-Deployment Checklist

### Backend ✅
- [ ] Laravel Cloud account created
- [ ] Repository connected to Laravel Cloud
- [ ] Environment variables configured
- [ ] `laravel-cloud.yml` configured
- [ ] `.cloudignore` created
- [ ] Database migrations ready
- [ ] CORS configuration updated

### Frontend ✅
- [ ] Vercel account created
- [ ] Repository connected to Vercel
- [ ] Environment variables set
- [ ] `vercel.json` configured
- [ ] API URL updated

### Both ✅
- [ ] GitHub repository up to date
- [ ] Configuration files committed
- [ ] Ready for deployment

## 🎉 Success!

Once deployed, you'll have:
- **Backend:** `https://your-app.laravel.cloud`
- **Frontend:** `https://your-app.vercel.app`
- **Database:** Managed automatically by Laravel Cloud
- **SSL:** Included with both platforms
- **CI/CD:** Automatic deployments on git push

Your CCS Profiling System will be fully functional and production-ready!
