# 🚀 Deployment Checklist

Use this checklist to deploy your Books Management System to Railway.app (FREE).

## ✅ Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] Repository is public or you have Railway GitHub access
- [ ] All Docker builds work locally (`docker-compose up`)

## ✅ Railway.app Deployment

### Step 1: Create Account
- [ ] Go to [railway.app](https://railway.app)
- [ ] Click "Login With GitHub"
- [ ] Authorize Railway to access your repositories

### Step 2: Create Project
- [ ] In Railway dashboard, click **"New Project"**
- [ ] Select **"Deploy from GitHub repo"**
- [ ] Find repository: `bahagh/Books-Project-Restructured-`

### Step 3: Add Database
- [ ] Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
- [ ] Database auto-provisions (no configuration needed)

### Step 4: Deploy Services

#### UserService
- [ ] Click **"+ New"** → **"GitHub Repo"** → Select your repo
- [ ] Name: `userservice`
- [ ] Settings → Root Directory: `microservices-books-app/services/UserService`
- [ ] Settings → Dockerfile Path: `UserService/Dockerfile`
- [ ] Add environment variables:
  ```
  ASPNETCORE_ENVIRONMENT=Production
  ASPNETCORE_URLS=http://0.0.0.0:$PORT
  ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}
  JWT__Key=YourSuperSecretJWTKeyMustBeAtLeast32CharactersLongForSecurity123!
  JWT__Issuer=BooksApp
  JWT__Audience=BooksApp
  JWT__ExpirationMinutes=60
  ```
- [ ] Click **"Deploy"**
- [ ] Settings → Networking → **"Generate Domain"**
- [ ] Save your UserService URL

#### BooksService
- [ ] Click **"+ New"** → **"GitHub Repo"** → Select your repo
- [ ] Name: `booksservice`
- [ ] Settings → Root Directory: `microservices-books-app/services/BooksService`
- [ ] Settings → Dockerfile Path: `BooksService/Dockerfile`
- [ ] Add environment variables:
  ```
  ASPNETCORE_ENVIRONMENT=Production
  ASPNETCORE_URLS=http://0.0.0.0:$PORT
  ConnectionStrings__DefaultConnection=${{Postgres.DATABASE_URL}}
  UserServiceUrl=https://${{userservice.RAILWAY_PUBLIC_DOMAIN}}
  ```
- [ ] Click **"Deploy"**
- [ ] Settings → Networking → **"Generate Domain"**
- [ ] Save your BooksService URL

#### API Gateway
- [ ] Click **"+ New"** → **"GitHub Repo"** → Select your repo
- [ ] Name: `apigateway`
- [ ] Settings → Root Directory: `microservices-books-app/api-gateway`
- [ ] Settings → Dockerfile Path: `ApiGateway/Dockerfile`
- [ ] Add environment variables:
  ```
  ASPNETCORE_ENVIRONMENT=Production
  ASPNETCORE_URLS=http://0.0.0.0:$PORT
  ```
- [ ] Click **"Deploy"**
- [ ] Settings → Networking → **"Generate Domain"**
- [ ] Save your API Gateway URL

#### Frontend
- [ ] Click **"+ New"** → **"GitHub Repo"** → Select your repo
- [ ] Name: `frontend`
- [ ] Settings → Root Directory: `microservices-books-app/frontend`
- [ ] Settings → Dockerfile Path: `Dockerfile`
- [ ] Add environment variables:
  ```
  REACT_APP_API_URL=https://${{apigateway.RAILWAY_PUBLIC_DOMAIN}}
  ```
- [ ] Click **"Deploy"**
- [ ] Settings → Networking → **"Generate Domain"**
- [ ] **Save your Frontend URL** - this is what you'll share!

### Step 5: Update Code with Railway URLs

#### Update Ocelot Configuration
- [ ] Copy your UserService and BooksService URLs from Railway
- [ ] Edit `microservices-books-app/api-gateway/ApiGateway/ocelot.json`
- [ ] Replace localhost with your Railway URLs (see DEPLOYMENT.md for example)
- [ ] Commit and push changes

#### Update CORS Settings
- [ ] Copy your Frontend URL from Railway
- [ ] Edit `services/UserService/UserService/Program.cs`
- [ ] Add your Railway frontend URL to CORS allowed origins
- [ ] Do the same for `services/BooksService/BooksService/Program.cs`
- [ ] Commit and push changes

### Step 6: Wait for Redeployment
- [ ] Railway auto-detects your push
- [ ] All services redeploy automatically (~5 minutes)
- [ ] Check deployment logs for errors

### Step 7: Test Your Live App
- [ ] Open your Frontend URL in browser
- [ ] Register a new user
- [ ] Login successfully
- [ ] Add a book
- [ ] Rate a book
- [ ] Add a comment
- [ ] Check notifications work

### Step 8: Share Your App! 🎉
- [ ] Copy your Frontend URL
- [ ] Share with friends, recruiters, or on social media
- [ ] Add to your portfolio/resume
- [ ] Anyone can access it via the URL

## 📊 Monitor Your Deployment

### Check Deployment Status
- [ ] Railway Dashboard → View each service status
- [ ] All services should show green "Active" status
- [ ] Click service → "Deployments" to see logs

### Monitor Usage
- [ ] Railway Dashboard → "Usage" tab
- [ ] Should stay well under $5/month
- [ ] PostgreSQL: ~$1.50/month
- [ ] Each service: ~$0.50-0.75/month

### Test Endpoints
- [ ] `https://your-frontend-url.up.railway.app` - Should show React app
- [ ] `https://your-apigateway-url.up.railway.app/health` - Should return 200 OK
- [ ] `https://your-userservice-url.up.railway.app/api/auth/health` - Should return healthy

## 🐛 Troubleshooting

If something doesn't work:
- [ ] Check Railway logs: Service → Deployments → Click deployment → View Logs
- [ ] Verify environment variables are set correctly
- [ ] Ensure Docker builds locally: `docker build -f path/to/Dockerfile .`
- [ ] Check CORS settings include your Railway URLs
- [ ] Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting

## 💰 Cost Tracking

- [ ] Current usage: $____/month (check Railway "Usage" tab)
- [ ] Projected monthly cost: Should be ~$4.00
- [ ] Within free $5 credit: ✅ Yes / ❌ No

## ✨ Post-Deployment

- [ ] App is live and accessible
- [ ] URL added to README.md
- [ ] URL added to GitHub repo description
- [ ] URL shared on LinkedIn/Twitter/Portfolio
- [ ] Monitoring set up (Railway dashboard bookmarked)

## 🔄 Continuous Deployment

Your app now auto-deploys:
- [ ] Make code changes locally
- [ ] Commit and push to GitHub
- [ ] Railway detects push
- [ ] All services automatically redeploy
- [ ] Check Railway dashboard for deployment status

## 📝 Your Live URLs

Fill these in after deployment:

- **Frontend** (share this!): `https://______________________.up.railway.app`
- **API Gateway**: `https://______________________.up.railway.app`
- **UserService**: `https://______________________.up.railway.app`
- **BooksService**: `https://______________________.up.railway.app`
- **PostgreSQL**: Internal only (no public URL)

---

**Total Setup Time**: ~15-20 minutes  
**Monthly Cost**: $0 (within free tier)  
**Status**: ✅ App is LIVE!  

🎉 **Congratulations! Your app is now on the internet!**

## ✅ Pre-Deployment Checklist

- [ ] Repository is on GitHub
- [ ] All code is committed and pushed
- [ ] CI/CD pipeline is passing (check Actions tab)
- [ ] Docker images build successfully locally

## ✅ Render.com Deployment (FREE)

### Step 1: Account Setup
- [ ] Go to [render.com](https://render.com)
- [ ] Click "Get Started for Free"
- [ ] Sign up with GitHub
- [ ] Authorize Render to access repositories

### Step 2: Deploy Blueprint
- [ ] In Render dashboard, click "New" → "Blueprint"
- [ ] Select repository: `bahagh/Books-Project-Restructured-`
- [ ] Render detects `render.yaml`
- [ ] Review 5 services to be created
- [ ] Click "Apply"

### Step 3: Monitor Deployment
- [ ] Wait 10-15 minutes for initial deployment
- [ ] Watch services turn green in dashboard
- [ ] Check logs if any service fails

### Step 4: Get Your URLs
After deployment, you'll have:
- [ ] Frontend URL: `https://books-frontend.onrender.com`
- [ ] API Gateway URL: `https://books-apigateway.onrender.com`
- [ ] UserService URL: `https://books-userservice.onrender.com`
- [ ] BooksService URL: `https://books-booksservice.onrender.com`
- [ ] Database: Internal PostgreSQL

### Step 5: Test Your App
- [ ] Open frontend URL in browser
- [ ] Register a new user account
- [ ] Login successfully
- [ ] Add a book
- [ ] Rate a book
- [ ] Add a comment
- [ ] Check notifications work
- [ ] Test search functionality

### Step 6: Share Your App! 🎉
- [ ] Copy your frontend URL
- [ ] Share with friends, family, or recruiters
- [ ] Anyone can access it via Google/web browser
- [ ] Add URL to your resume/portfolio

## ⚙️ Optional Configuration

### Add Google OAuth (Optional)
- [ ] Get Google Client ID from [Google Console](https://console.cloud.google.com)
- [ ] In Render: UserService → Environment → Add `GOOGLE_CLIENT_ID`
- [ ] Redeploy UserService

### Add Custom Domain (Optional)
- [ ] Own a domain name
- [ ] In Render: Frontend Service → Settings → Custom Domain
- [ ] Add your domain (e.g., `books.yourdomain.com`)
- [ ] Update DNS records as instructed
- [ ] SSL auto-provisions

### Keep Services Awake (Optional)
- [ ] Sign up at [UptimeRobot](https://uptimerobot.com)
- [ ] Add monitor for your frontend URL
- [ ] Set interval to 10 minutes
- [ ] Prevents cold starts

## 🐛 Troubleshooting

If deployment fails:
- [ ] Check Render logs for each service
- [ ] Verify environment variables are set
- [ ] Ensure all services are in same region
- [ ] Check database connection string
- [ ] Review [DEPLOYMENT.md](DEPLOYMENT.md) for detailed help

## 📊 Monitoring

After deployment:
- [ ] Bookmark Render dashboard
- [ ] Check metrics tab for usage
- [ ] Monitor database size (1GB limit on free tier)
- [ ] Review logs for errors
- [ ] Set up GitHub Actions notifications

## 🔄 Continuous Deployment

Your app auto-deploys on every push to master:
- [ ] Make code changes
- [ ] Commit and push to GitHub
- [ ] GitHub Actions builds & tests
- [ ] Docker images pushed to registry
- [ ] Render auto-detects and redeploys
- [ ] Check dashboard for deployment status

## 💰 Cost

**Free Tier (Current):**
- ✅ 5 services (perfect for this app)
- ✅ PostgreSQL 1GB
- ✅ 750 hours/month per service
- ✅ SSL certificates
- ✅ Automatic deployments
- ⚠️ Services sleep after 15min inactivity

**Paid Upgrade (Optional):**
- $7/month per service for always-on
- Total: ~$35/month for production use

## 📝 Notes

- First request after sleep takes 30-60 seconds (cold start)
- Free tier is perfect for portfolio/demo projects
- Great for showing to recruiters
- Can handle light-to-medium traffic
- Upgrade to paid only if needed for production

## ✨ Success!

Once deployed:
- ✅ App is live on the internet
- ✅ Accessible by anyone with the URL
- ✅ No credit card required
- ✅ Auto-deploys on git push
- ✅ SSL/HTTPS enabled
- ✅ Ready to share!

**Add your live URL to README and celebrate! 🎉**
