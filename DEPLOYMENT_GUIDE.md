# CCS Profiling System - Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Frontend) + PHP Hosting (Backend)
**Recommended for production deployment**

#### Frontend Deployment (Vercel)
1. **Push to GitHub** ✅ (Already done)
2. **Connect Vercel to GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `frontend` folder as root directory
3. **Configure Environment Variables**
   ```
   VITE_API_URL=https://your-backend-domain.com/api
   ```
4. **Deploy** - Vercel will automatically deploy on push

#### Backend Deployment (PHP Hosting)
**Recommended Hosting Providers:**
- **DigitalOcean** (Droplets - $4-8/month)
- **Heroku** (Free tier available)
- **Railway** (Modern, easy setup)
- **AWS EC2** (More control, higher cost)

**Deployment Steps:**
1. **Choose hosting provider** and set up server
2. **Install requirements:**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install php php-cli php-fpm php-mysql php-xml php-mbstring php-curl composer nginx mysql-server
   
   # Install Node.js for frontend build
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install nodejs
   ```
3. **Configure Database:**
   ```sql
   CREATE DATABASE ccs_profiling;
   CREATE USER 'ccs_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON ccs_profiling.* TO 'ccs_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
4. **Deploy Laravel:**
   ```bash
   # Clone repository
   git clone https://github.com/KenVictoria/ITEW6-Project.git
   cd ITEW6-Project/backend
   
   # Install dependencies
   composer install --optimize-autoloader --no-dev
   
   # Set up environment
   cp .env.example .env
   php artisan key:generate
   
   # Update .env with your database credentials
   # Update FRONTEND_URL with your Vercel domain
   
   # Run migrations
   php artisan migrate --force
   
   # Seed database (optional)
   php artisan db:seed --force
   
   # Optimize for production
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan storage:link
   ```
5. **Configure Web Server (Nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/ITEW6-Project/backend/public;
       index index.php;
       
       location / {
           try_files $uri $uri/ /index.php?$query_string;
       }
       
       location ~ \.php$ {
           fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
           fastcgi_index index.php;
           include fastcgi_params;
           fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
       }
   }
   ```

### Option 2: Full-Stack Platforms
**Platforms that support both frontend and backend:**

#### Heroku (Recommended for beginners)
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add MySQL addon
heroku addons:create cleardb:ignite

# Set environment variables
heroku config:set APP_ENV=production
heroku config:set APP_DEBUG=false
heroku config:set DB_CONNECTION=mysql
# Heroku automatically sets DATABASE_URL

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku master

# Run migrations
heroku run php artisan migrate
```

#### Railway (Modern alternative)
1. Connect GitHub repository to Railway
2. Select `backend` folder
3. Configure environment variables
4. Railway automatically detects Laravel and deploys

#### DigitalOcean (Droplet)
1. Create Droplet (Ubuntu 22.04)
2. Follow Option 1 backend deployment steps
3. Deploy frontend to Netlify/Vercel or same server

## 🔧 Environment Configuration

### Backend (.env)
```env
APP_NAME="CCS Profiling System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-backend-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ccs_profiling
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### Frontend (Vercel Environment Variables)
```
VITE_API_URL=https://your-backend-domain.com/api
```

## 🌐 CORS Configuration

Update `backend/config/cors.php` for production:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => [
    'https://your-vercel-domain.vercel.app',
    'http://localhost:5173', // for development
],
'allowed_headers' => ['*'],
```

## 📋 Pre-Deployment Checklist

### Backend
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] Migrations run successfully
- [ ] Storage linked (`php artisan storage:link`)
- [ ] Cache optimized (`php artisan config:cache`)
- [ ] SSL certificate installed
- [ ] CORS configured for frontend domain

### Frontend
- [ ] Environment variables set in Vercel
- [ ] API URL pointing to production backend
- [ ] Build process successful
- [ ] Routes working correctly

## 🚀 Quick Deploy (Heroku Example)

```bash
# 1. Install Heroku CLI
# 2. Login
heroku login

# 3. Create app
heroku create ccs-profiling

# 4. Add database
heroku addons:create cleardb:ignite

# 5. Deploy backend
cd backend
git add .
git commit -m "Deploy backend"
heroku git:remote -a ccs-profiling
git push heroku master

# 6. Run migrations
heroku run php artisan migrate --force

# 7. Deploy frontend to Vercel
# Connect Vercel to GitHub
# Set VITE_API_URL=https://ccs-profiling.herokuapp.com/api
```

## 🔍 Testing Deployment

1. **Backend Health Check:**
   ```bash
   curl https://your-backend-domain.com/api/user
   ```

2. **Frontend Access:**
   - Visit your Vercel domain
   - Test login functionality
   - Verify all features work

3. **Cross-Origin Testing:**
   - Check browser console for CORS errors
   - Verify API calls succeed

## 🆘 Common Issues

### CORS Errors
- Update `config/cors.php` with correct frontend URL
- Ensure environment variables are set

### Database Connection
- Verify database credentials in `.env`
- Check if database server is running
- Ensure user has proper permissions

### Asset Loading Issues
- Run `php artisan storage:link`
- Check file permissions on storage directory

### Authentication Issues
- Clear application cache: `php artisan cache:clear`
- Verify Sanctum tokens are working
- Check session configuration

## 📞 Support

For deployment issues:
1. Check logs: `heroku logs --tail` (for Heroku)
2. Verify environment variables
3. Test database connection
4. Check CORS configuration
