# Quick Start Guide — Run Lohono Concierge Locally (No Docker)

## Step 1: Install System Dependencies (5 minutes)

### Windows:
```bash
# 1. Download & install Node.js (>= 20)
# https://nodejs.org/

# 2. Download & install PostgreSQL (>= 16)
# https://www.postgresql.org/download/
# During installation, remember the password you set for the 'postgres' user

# 3. Install pnpm globally
npm install -g pnpm

# 4. Verify installations
node --version    # Should be >= 20
pnpm --version    # Should be 9.12.0
psql --version    # Should show PostgreSQL version
```

### macOS/Linux:
```bash
# Using Homebrew (macOS)
brew install node@20 postgresql pnpm

# Or using your package manager (Linux)
# Ubuntu: sudo apt-get install nodejs postgresql postgresql-contrib

# Verify installations
node --version
pnpm --version
psql --version
```

---

## Step 2: Set Up PostgreSQL (2 minutes)

### On Windows:
PostgreSQL starts automatically as a Windows service after installation.

### On macOS/Linux:
```bash
# Start PostgreSQL service
brew services start postgresql
# or
sudo systemctl start postgresql
```

### Verify PostgreSQL is running:
```bash
psql -U postgres -c "SELECT 1;"
# If it connects, you're good!
```

---

## Step 3: Configure Environment Variables (2 minutes)

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your values:
```

**Windows (PowerShell):**
```powershell
notepad .env
```

**macOS/Linux:**
```bash
nano .env
```

**Set these values in `.env`:**
```
DATABASE_URL=postgres://postgres:your_postgres_password@localhost:5432/lohono
API_PORT=4000
WEB_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:4000
CORS_ORIGIN=http://localhost:3000

# Pick one provider: anthropic or gemini
LLM_PROVIDER=anthropic

# Your Anthropic API key (get from https://console.anthropic.com/account/keys)
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
ANTHROPIC_MODEL=claude-sonnet-5

# Or if using Gemini (optional)
# GEMINI_API_KEY=your-gemini-key
# GEMINI_MODEL=gemini-3.5-flash-lite

TOKEN_SECRET=your-random-secret-min-8-chars
NODE_ENV=development
```

---

## Step 4: Install Dependencies (3 minutes)

```bash
# From project root
pnpm install
```

---

## Step 5: Set Up Database (2 minutes)

```bash
# Create database schema
pnpm db:push

# Seed with sample Goa data (40 POIs, villa, destination)
pnpm db:seed

# Build distance matrix (haversine between all POIs)
pnpm db:distances
```

---

## Step 6: Start the Project (1 minute)

```bash
# Starts both API (port 4000) and Web (port 3000) in parallel
pnpm dev
```

**You'll see:**
```
  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
  - API server:   http://localhost:4000
```

---

## Step 7: Access the Application

- **Admin Panel:** http://localhost:3000/admin/catalog
- **Guest Questionnaire:** http://localhost:3000/questionnaire/[token]
  - (You'll get a token from the booking flow)
- **API Health:** http://localhost:4000/health

---

## Common Issues & Fixes

### "DATABASE_URL is not set"
```bash
# Make sure .env file exists and has DATABASE_URL
cat .env | grep DATABASE_URL
```

### "Cannot connect to PostgreSQL"
```bash
# Check PostgreSQL is running
# Windows: Services → PostgreSQL
# macOS: brew services list
# Linux: sudo systemctl status postgresql

# Try connecting directly
psql -U postgres -c "SELECT 1;"
```

### "pnpm: command not found"
```bash
# Reinstall pnpm
npm install -g pnpm
pnpm --version
```

### "Port 3000/4000 already in use"
```bash
# Kill the process using the port (Windows PowerShell)
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Or macOS/Linux
lsof -i :3000
kill -9 <pid>
```

### "API_KEY missing" error
- Check `ANTHROPIC_API_KEY` in `.env`
- Get one: https://console.anthropic.com/account/keys

---

## That's It! 🎉

Your Lohono Concierge app is now running locally. No Docker needed.

**Next Steps:**
- Explore `/admin/catalog` to see the POI catalog
- Review the map at `/admin/maps/goa`
- Trigger generation via `/questionnaire/[token]`
- Check insights at `/admin/insights`
