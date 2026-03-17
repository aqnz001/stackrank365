# StackRank365 — Deployment Guide (v8)

## Before you go live — 3 things to do

### 1. Set up EmailJS (direct email to your mailbox — free)
1. Go to https://emailjs.com → create free account (200 emails/mo, no credit card)
2. **Email Services** → Add Service → connect Gmail / Outlook / any SMTP
   → Copy the **Service ID** (e.g. `service_abc123`)
3. **Email Templates** → Create Template → set it up like this:
   ```
   Subject:  🚀 New Waitlist Signup — {{from_email}}
   Body:     New signup on the StackRank365 waitlist!
             Email: {{from_email}}
             Source: {{source}}
             Time: {{timestamp}}
   ```
   → Copy the **Template ID** (e.g. `template_xyz789`)
4. **Account → API Keys** → copy your **Public Key** (e.g. `aBcDeFgHiJkLmNoPq`)
5. Open `src/pages/Landing2.jsx` and fill in the 3 values at the top:
   ```js
   const EMAILJS_SERVICE_ID  = 'service_abc123';
   const EMAILJS_TEMPLATE_ID = 'template_xyz789';
   const EMAILJS_PUBLIC_KEY  = 'aBcDeFgHiJkLmNoPq';
   ```

### 2. Update your domain in index.html
Your domain is `stackran365.com`. Open `index.html` and update these 5 lines:
- `og:url`         → `https://stackran365.com/`
- `og:image`       → `https://stackran365.com/og-image.png`
- `twitter:url`    → `https://stackran365.com/`
- `twitter:image`  → `https://stackran365.com/og-image.png`
- `canonical`      → `https://stackran365.com/`

### 3. Choose your logo
Three SVG logo options are in `/public/logos/`:
- `logo-a.svg` — Triple Hex Cluster (D365 blue + Power Platform purple + Copilot cyan)
- `logo-b.svg` — Podium Bars + Gold Crown (leaderboard/ranking theme)
- `logo-c.svg` — Gradient Hex Shield + Verified Star ← **currently active in the site**

To switch: open `src/components/Nav.jsx` and swap the `<LogoMark>` SVG paths.

---

## Deploy to Vercel (step by step)

### Step 1 — Push to GitHub
```bash
cd ~/stackrank365
git init
git add .
git commit -m "StackRank365 launch"
git remote add origin https://github.com/YOUR_USERNAME/stackrank365.git
git push -u origin main
```

### Step 2 — Create Vercel account & deploy
1. Go to **vercel.com** → Sign Up with GitHub (free)
2. Click **Add New Project** → select the `stackrank365` repo
3. Framework auto-detects as **Vite** — no changes needed
4. Click **Deploy** — takes ~60 seconds

### Step 3 — Add your custom domain
1. In Vercel dashboard → your project → **Settings → Domains**
2. Add `stackran365.com` and `www.stackran365.com`
3. Vercel shows you DNS records — add these at your domain registrar:
   - `A` record:     `stackran365.com`  → `76.76.21.21`
   - `CNAME` record: `www`              → `cname.vercel-dns.com`
4. SSL certificate provisions automatically in 2–5 minutes

### Step 4 — Future updates
Any `git push` to `main` triggers an automatic redeploy. Takes ~30 seconds.

---

## What's in /public
| File | Purpose |
|------|---------|
| `favicon.ico` | Multi-size favicon (16–256px) — matches Logo C |
| `favicon.svg` | SVG favicon for modern browsers |
| `apple-touch-icon.png` | iOS/Android home screen icon (512px) |
| `og-image.png` | 1200×630 social share image (LinkedIn, Slack, etc.) |
| `_redirects` | Netlify SPA routing (not needed for Vercel) |
| `logos/logo-a.svg` | Logo option A |
| `logos/logo-b.svg` | Logo option B |
| `logos/logo-c.svg` | Logo option C (active) |

## Light theme (preserved for later)
The light theme (Landing3, Landing4 and sr4 inner pages) is fully preserved in:
- `src/pages/Landing3.jsx`
- `src/pages/Landing4.jsx`
To re-enable: uncomment the imports and routes in `src/App.jsx` and restore
the theme toggle in `src/components/Nav.jsx`.
