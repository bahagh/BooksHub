# Deployment Guide

This guide explains how to deploy the Books Management System to the web **completely free** using Railway.app.

## Why Railway.app?

✅ **$5 free credit per month** (renews monthly)  
✅ **No credit card required** for signup  
✅ **Services don't spin down** (always responsive)  
✅ **PostgreSQL doesn't expire** (unlike Render's 90-day limit)  
✅ **Faster cold starts** than other free platforms  
✅ **Automatic HTTPS** with custom domains  
✅ **Easy GitHub integration**  

**Cost**: $0/month if usage stays under $5 (which it will for this app)

---

## Quick Deploy (10 Minutes)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Login"** in the top right
3. Click **"Login With GitHub"**
4. Authorize Railway to access your repositories

### Step 2: Create New Project from GitHub
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: `bahagh/Books-Project-Restructured-`
4. Railway will start analyzing your repository

### Step 3: Add PostgreSQL Database
1. In your new project, click **"+ New"** 
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Railway automatically provisions the database
5. Note: Database connection details are auto-configured

### Step 4: Deploy Each Service

Railway should auto-detect Docker services, but if not, add them manually:

#### A. Deploy UserService
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository again
3. **Service Name**: `userservice`
4. Click **"Add variables"** and add:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://0.0.0.0:$PORT
   ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}
   JWT__Key=YourSuperSecretJWTKeyMustBeAtLeast32CharactersLongForSecurity123!
   JWT__Issuer=BooksApp
   JWT__Audience=BooksApp
   JWT__ExpirationMinutes=60
   ```
5. Click **"Settings"** → **"Service"**
6. Set **Root Directory**: `microservices-books-app/services/UserService`
7. Set **Dockerfile Path**: `UserService/Dockerfile`
8. Click **"Deploy"**

#### B. Deploy BooksService
1. Click **"+ New"** → **"GitHub Repo"**
2. Select your repository
3. **Service Name**: `booksservice`
4. **Add variables**:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://0.0.0.0:$PORT
   ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}
   UserServiceUrl=https://${{userservice.RAILWAY_PUBLIC_DOMAIN}}
   ```
5. **Settings** → Set **Root Directory**: `microservices-books-app/services/BooksService`
6. **Dockerfile Path**: `BooksService/Dockerfile`
7. Click **"Deploy"**

#### C. Deploy API Gateway
1. Click **"+ New"** → **"GitHub Repo"**
2. **Service Name**: `apigateway`
3. **Add variables**:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://0.0.0.0:$PORT
   ```
4. **Settings** → Set **Root Directory**: `microservices-books-app/api-gateway`
5. **Dockerfile Path**: `ApiGateway/Dockerfile`
6. Click **"Deploy"**

#### D. Deploy Frontend
1. Click **"+ New"** → **"GitHub Repo"**
2. **Service Name**: `frontend`
3. **Add variables**:
   ```
   REACT_APP_API_URL=https://${{apigateway.RAILWAY_PUBLIC_DOMAIN}}
   ```
4. **Settings** → Set **Root Directory**: `microservices-books-app/frontend`
5. **Dockerfile Path**: `Dockerfile`
6. Click **"Deploy"**

### Step 5: Generate Public Domains
For each service (except PostgreSQL):
1. Click on the service card
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"**
5. Save the generated URL

Your services will be available at:
- Frontend: `https://frontend-production-xxxx.up.railway.app`
- API Gateway: `https://apigateway-production-xxxx.up.railway.app`
- UserService: `https://userservice-production-xxxx.up.railway.app`
- BooksService: `https://booksservice-production-xxxx.up.railway.app`

### Step 6: Update API Gateway Configuration

You need to update the Ocelot configuration to use Railway URLs:

1. Open `microservices-books-app/api-gateway/ApiGateway/ocelot.json`
2. Replace localhost URLs with your Railway URLs
3. Commit and push to GitHub - Railway will auto-redeploy

Example update (use your actual Railway URLs):
```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        {
          "Host": "userservice-production-xxxx.up.railway.app",
          "Port": 443
        }
      ],
      "UpstreamPathTemplate": "/api/auth/{everything}",
      "UpstreamHttpMethod": [ "Get", "Post", "Put", "Delete" ]
    }
  ]
}
```

### Step 7: Update CORS Settings

Update backend services to allow your Railway frontend URL:

**In `services/UserService/UserService/Program.cs`**:
```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "https://frontend-production-xxxx.up.railway.app"  // Add your Railway URL
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});
```

Do the same for BooksService, then commit and push.

---

## Your Live Application

After deployment completes, share your **frontend URL** with anyone:

**Example**: `https://frontend-production-xxxx.up.railway.app`

Anyone can:
- ✅ Access the app via browser
- ✅ Register and create an account
- ✅ Add books and interact with the platform
- ✅ No installation needed

---

## Monitoring & Management

### View Deployment Logs
```
Railway Dashboard → Select Service → "Deployments" tab → Click latest deployment → View logs
```

### Check Resource Usage
```
Railway Dashboard → "Usage" tab
```
Monitor how much of your $5 credit is used.

### Manage Database
```
Railway Dashboard → Click PostgreSQL service → "Data" tab
```
Run SQL queries directly in browser.

### Trigger Redeployment
```
Railway Dashboard → Service → Click "⋮" menu → "Redeploy"
```

---

## Cost Breakdown (Free Tier)

Railway gives **$5 credit per month**:

| Resource | Monthly Cost | Notes |
|----------|-------------|-------|
| PostgreSQL (1GB) | ~$1.50 | Always-on database |
| UserService | ~$0.75 | Always-on .NET service |
| BooksService | ~$0.75 | Always-on .NET service |
| API Gateway | ~$0.50 | Always-on gateway |
| Frontend | ~$0.50 | Always-on React app |
| **Total** | **~$4.00** | **Stays within $5 free tier** ✅ |

---

## Troubleshooting

### Build Fails
**Solution**: 
1. Check deployment logs in Railway
2. Verify Dockerfile paths are correct
3. Test Docker build locally first:
   ```bash
   docker build -f microservices-books-app/services/UserService/UserService/Dockerfile microservices-books-app/services/UserService
   ```

### Database Connection Error
**Solution**:
1. Use Railway's variable: `${{Postgres.DATABASE_URL}}`
2. Don't hardcode connection strings
3. Check logs for exact error message

### CORS Errors
**Solution**:
1. Update `Program.cs` in backend services
2. Add your Railway frontend URL to allowed origins
3. Commit and push to trigger redeployment

### Service Not Starting
**Solution**:
1. Check environment variables are set correctly
2. Verify `ASPNETCORE_URLS=http://0.0.0.0:$PORT`
3. Look for error messages in logs

---

## Alternative Free Platforms

### 1. **Fly.io** (Great Alternative)
- 3 free VMs (256MB RAM each)
- Free PostgreSQL (3GB)
- Better for global deployments
- [fly.io](https://fly.io)

### 2. **Render.com** (Backup Option)
- Free tier available
- **Downside**: Services spin down after 15 min
- **Downside**: PostgreSQL expires after 90 days
- Use only if Railway doesn't work

### 3. **Koyeb** (New Platform)
- $5.50 free credit monthly
- Similar to Railway
- Good European servers
- [koyeb.com](https://koyeb.com)

---

## Custom Domain (Optional)

1. Go to Railway → Frontend service → **"Settings"**
2. Scroll to **"Domains"** section
3. Click **"Custom Domain"**
4. Enter your domain: `books.yourdomain.com`
5. Add CNAME record to your DNS provider:
   ```
   Type: CNAME
   Name: books
   Value: frontend-production-xxxx.up.railway.app
   ```
6. SSL auto-provisions in ~2 minutes

---

## Continuous Deployment

Railway automatically redeploys when you:
1. Push to your GitHub repository
2. Merge a pull request
3. Create a new release

**No manual steps needed!**

---

## Production Checklist

Before sharing publicly:

- [ ] All services deployed and running
- [ ] Frontend URL is accessible
- [ ] Test user registration
- [ ] Test book creation
- [ ] Test comments and ratings
- [ ] CORS configured for Railway URLs
- [ ] JWT secret is secure (32+ characters)
- [ ] Database backups enabled (automatic on Railway)
- [ ] Monitor usage doesn't exceed $5/month

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app
- **GitHub Issues**: https://github.com/bahagh/Books-Project-Restructured-/issues

---

## Summary

✅ **Hosting Cost**: $0/month (within $5 free credit)  
✅ **Setup Time**: 10-15 minutes  
✅ **Always Online**: No cold starts  
✅ **Public Access**: Share URL with anyone  
✅ **Auto Deploy**: Push to GitHub = instant deployment  
✅ **Free SSL**: Automatic HTTPS  

**Your app is now live on the internet!** 🚀

## Prerequisites

1. GitHub account with this repository
2. Free account on [Render.com](https://render.com)

## Option 1: One-Click Deploy with Render Blueprint (Recommended)

### Step 1: Sign Up for Render
1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with GitHub
4. Authorize Render to access your repositories

### Step 2: Deploy Using Blueprint
1. In Render dashboard, click "New" → "Blueprint"
2. Connect your GitHub repository: `bahagh/Books-Project-Restructured-`
3. Render will automatically detect `render.yaml`
4. Review the services that will be created:
   - PostgreSQL Database (Free tier, 1GB)
   - UserService (Web Service, Free tier)
   - BooksService (Web Service, Free tier)
   - API Gateway (Web Service, Free tier)
   - Frontend (Web Service, Free tier)
5. Click "Apply"

### Step 3: Configure Environment Variables (if needed)
Render will auto-generate most variables, but you may want to customize:
- `JWT__Key`: Auto-generated secure key (keep default)
- `GOOGLE_CLIENT_ID`: Add if you want Google OAuth (optional)

### Step 4: Wait for Deployment
- Initial deployment takes 10-15 minutes
- All services will build and deploy automatically
- You can monitor progress in the Render dashboard

### Step 5: Access Your Application
Once deployed, you'll get URLs like:
- **Frontend**: `https://books-frontend.onrender.com`
- **API Gateway**: `https://books-apigateway.onrender.com`
- **UserService**: `https://books-userservice.onrender.com`
- **BooksService**: `https://books-booksservice.onrender.com`

**Share the frontend URL with anyone to access your app!**

## Option 2: Manual Deploy (Alternative)

If blueprint doesn't work, deploy each service manually:

### 1. Deploy PostgreSQL Database
1. Click "New" → "PostgreSQL"
2. Name: `books-postgres`
3. Database: `books`
4. Region: Oregon (or closest to you)
5. Plan: Free
6. Click "Create Database"
7. **Copy the Internal Database URL** (you'll need this)

### 2. Deploy UserService
1. Click "New" → "Web Service"
2. Connect repository: `bahagh/Books-Project-Restructured-`
3. Name: `books-userservice`
4. Region: Oregon
5. Branch: `master`
6. Runtime: Docker
7. Dockerfile Path: `./microservices-books-app/services/UserService/UserService/Dockerfile`
8. Docker Context: `./microservices-books-app/services/UserService`
9. Plan: Free
10. Add environment variables:
    ```
    ASPNETCORE_ENVIRONMENT=Production
    ASPNETCORE_URLS=http://+:5555
    ConnectionStrings__DefaultConnection=[Paste Internal Database URL]
    JWT__Key=[Generate a random 32+ character string]
    JWT__Issuer=UserService
    JWT__Audience=BooksApp
    ```
11. Click "Create Web Service"

### 3. Deploy BooksService
1. Click "New" → "Web Service"
2. Connect repository
3. Name: `books-booksservice`
4. Dockerfile Path: `./microservices-books-app/services/BooksService/BooksService/Dockerfile`
5. Docker Context: `./microservices-books-app/services/BooksService`
6. Add environment variables:
    ```
    ASPNETCORE_ENVIRONMENT=Production
    ASPNETCORE_URLS=http://+:5556
    ConnectionStrings__DefaultConnection=[Paste Internal Database URL]
    UserServiceUrl=https://books-userservice.onrender.com
    ```
7. Click "Create Web Service"

### 4. Deploy API Gateway
1. Click "New" → "Web Service"
2. Name: `books-apigateway`
3. Dockerfile Path: `./microservices-books-app/api-gateway/ApiGateway/Dockerfile`
4. Docker Context: `./microservices-books-app/api-gateway`
5. Add environment variables:
    ```
    ASPNETCORE_ENVIRONMENT=Production
    ASPNETCORE_URLS=http://+:5000
    ```
6. Update `ocelot.json` to use Render URLs (see below)
7. Click "Create Web Service"

### 5. Deploy Frontend
1. Click "New" → "Web Service"
2. Name: `books-frontend`
3. Dockerfile Path: `./microservices-books-app/frontend/Dockerfile`
4. Docker Context: `./microservices-books-app/frontend`
5. Add environment variables:
    ```
    REACT_APP_API_URL=https://books-apigateway.onrender.com
    ```
6. Click "Create Web Service"

### 6. Update Ocelot Configuration
After deployment, update `api-gateway/ApiGateway/ocelot.json` to use production URLs:

```json
{
  "Routes": [
    {
      "DownstreamPathTemplate": "/api/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        {
          "Host": "books-userservice.onrender.com",
          "Port": 443
        }
      ],
      "UpstreamPathTemplate": "/api/auth/{everything}",
      "UpstreamHttpMethod": [ "Get", "Post", "Put", "Delete" ]
    },
    {
      "DownstreamPathTemplate": "/api/{everything}",
      "DownstreamScheme": "https",
      "DownstreamHostAndPorts": [
        {
          "Host": "books-booksservice.onrender.com",
          "Port": 443
        }
      ],
      "UpstreamPathTemplate": "/api/{everything}",
      "UpstreamHttpMethod": [ "Get", "Post", "Put", "Delete" ]
    }
  ]
}
```

Commit and push changes to trigger redeployment.

## Important Notes

### Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- Database limited to 1GB
- Good for demos and testing, not production traffic

### Keeping Services Active
To prevent spin-down, you can:
1. Use a free uptime monitor like [UptimeRobot](https://uptimerobot.com)
2. Ping your frontend URL every 10 minutes
3. Upgrade to paid plan ($7/month per service) for always-on

### Custom Domain (Optional)
1. In Render dashboard, go to your frontend service
2. Click "Settings" → "Custom Domain"
3. Add your domain (e.g., `books.yourdomain.com`)
4. Update DNS records as instructed
5. SSL certificate is automatically provisioned

## Monitoring Deployment

### Check Service Status
1. Go to Render dashboard
2. Each service shows: Building → Deploying → Live
3. Click on a service to see logs

### View Logs
```
Render Dashboard → Select Service → Logs tab
```

### Health Checks
- UserService: `https://books-userservice.onrender.com/api/auth/health`
- BooksService: `https://books-booksservice.onrender.com/api/books/health`
- API Gateway: `https://books-apigateway.onrender.com/health`

## Troubleshooting

### Service Won't Start
1. Check logs in Render dashboard
2. Verify environment variables are set correctly
3. Ensure database connection string is correct
4. Check Dockerfile builds locally first

### Database Connection Errors
1. Use the **Internal Database URL** from Render (not External)
2. Format: `postgresql://user:password@hostname/database`
3. Ensure all services are in the same region

### CORS Errors
1. Update UserService and BooksService CORS settings
2. Add your Render frontend URL to allowed origins
3. Redeploy services

### Cold Start is Too Slow
- Upgrade to paid plan for always-on services
- Or use uptime monitoring to keep services warm

## Alternative Free Hosting Options

If Render doesn't work, try:

1. **Railway.app** - Similar to Render, $5 free credit monthly
2. **Fly.io** - Free tier with 3 small VMs
3. **Heroku** - No longer free, but has student program
4. **Azure for Students** - $100 free credit

## Cost Estimation

**Render Free Tier:**
- ✅ 5 services (perfect for this app)
- ✅ 750 hours/month per service
- ✅ PostgreSQL with 1GB storage
- ✅ Free SSL certificates
- ✅ Automatic deployments from GitHub
- ❌ Services spin down after 15 min inactivity

**Render Paid (if needed):**
- $7/month per service for always-on
- Total: ~$35/month for all 5 services
- Recommended only for production use

## Post-Deployment Steps

1. **Test the Application**
   - Register a new user
   - Add some books
   - Test all features

2. **Share Your App**
   - Frontend URL is publicly accessible
   - Anyone can visit and use it
   - No login required to browse (unless you add that restriction)

3. **Monitor Usage**
   - Check Render dashboard for metrics
   - Monitor database size
   - Review logs for errors

4. **Update Environment Variables**
   - Add `GOOGLE_CLIENT_ID` for OAuth
   - Update `JWT__Key` for better security
   - Configure email settings if needed

## Continuous Deployment

The CI/CD pipeline is configured to:
1. Run tests on every push
2. Build Docker images
3. Push to GitHub Container Registry
4. Notify when ready to deploy

Render automatically redeploys when you push to `master` branch.

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- Project Issues: https://github.com/bahagh/Books-Project-Restructured-/issues
