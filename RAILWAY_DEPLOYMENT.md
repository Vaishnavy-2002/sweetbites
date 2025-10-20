# 🚂 Railway Deployment Guide for SweetBite

This guide will help you deploy your SweetBite Bakery Management System to Railway.

## 📋 Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Railway CLI**: Install the Railway CLI
   ```bash
   npm install -g @railway/cli
   ```
3. **GitHub Repository**: Your code should be in a Git repository

## 🚀 Quick Deployment Steps

### 1. **Login to Railway**
```bash
railway login
```

### 2. **Create New Project**
```bash
railway new
```
Choose "Deploy from GitHub repo" and select your SweetBite repository.

### 3. **Add PostgreSQL Database**
In Railway dashboard:
- Click "New" → "Database" → "Add PostgreSQL"
- Railway will automatically create `DATABASE_URL` environment variable

### 4. **Add Redis (Optional but Recommended)**
For Celery task queue:
- Click "New" → "Database" → "Add Redis"
- Railway will automatically create `REDIS_URL` environment variable

### 5. **Configure Environment Variables**
In Railway dashboard, go to your service → Variables tab and add:

```env
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=False
DJANGO_SETTINGS_MODULE=sweetbite_backend.settings.production
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@sweetbite.com
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token_here
```

### 6. **Deploy**
```bash
railway up
```

## 🔧 Configuration Files Included

Your project now includes these Railway-specific files:

- **`railway.toml`** - Railway configuration
- **`Procfile`** - Process definitions
- **`nixpacks.toml`** - Build configuration
- **`railway.env.example`** - Environment variables template

## 📁 Settings Structure

New Django settings structure:
```
backend/sweetbite_backend/settings/
├── __init__.py
├── base.py          # Base settings
├── production.py    # Production settings for Railway
└── staging.py       # Staging settings
```

## 🗃️ Database Migration

After deployment, run migrations:
```bash
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

## 📊 Monitoring and Logs

### View Logs
```bash
railway logs
```

### Monitor Services
```bash
railway status
```

## 🔄 CI/CD with GitHub

Railway automatically deploys when you push to your main branch. To customize:

1. Go to Railway dashboard
2. Select your service
3. Settings → Triggers
4. Configure branch and deployment settings

## 🌐 Custom Domain

### Add Custom Domain
1. Railway dashboard → Your service
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Add domain to `CUSTOM_DOMAIN` environment variable

## 📱 Frontend Deployment Options

### Option 1: Separate Frontend Service
1. Create new Railway service for frontend
2. Connect to same GitHub repo
3. Set root directory to `/` 
4. Railway will auto-detect React app

### Option 2: Serve Frontend from Django
1. Build React app: `npm run build`
2. Configure Django to serve static files
3. Use single Railway service

## 🔐 Production Security Checklist

- [ ] Changed `SECRET_KEY` from default
- [ ] Set `DEBUG=False`
- [ ] Updated `ALLOWED_HOSTS`
- [ ] Configured HTTPS settings
- [ ] Set up proper CORS origins
- [ ] Configured secure cookie settings
- [ ] Added environment variables for all secrets

## 🐛 Troubleshooting

### Common Issues

**1. Build Fails**
```bash
# Check build logs
railway logs --build
```

**2. Database Connection Error**
- Ensure `DATABASE_URL` is set correctly
- Check PostgreSQL service is running

**3. Static Files Not Loading**
```bash
# Collect static files
railway run python manage.py collectstatic
```

**4. CORS Errors**
- Update `CORS_ALLOWED_ORIGINS` in production settings
- Add your Railway domain to allowed origins

### Debug Commands
```bash
# Connect to Railway shell
railway shell

# Run Django commands
railway run python manage.py <command>

# Check environment variables
railway variables
```

## 📞 Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **SweetBite Issues**: [GitHub Issues](https://github.com/your-repo/issues)

## 🔄 Updates and Maintenance

### Update Dependencies
```bash
# Update requirements.txt and push to trigger redeploy
git add requirements.txt
git commit -m "Update dependencies"
git push
```

### Database Backup
```bash
# Create database backup
railway run pg_dump $DATABASE_URL > backup.sql
```

### Health Checks
Railway will automatically health check your service at `/admin/` endpoint.

---

**🎉 Congratulations!** Your SweetBite Bakery Management System is now deployed on Railway! 

**Deployment URL**: Your app will be available at `https://your-service-name.up.railway.app`

