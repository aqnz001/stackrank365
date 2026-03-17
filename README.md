# StackRank365 🏆
### The Verified Ranking Platform for Microsoft Power Ecosystem Professionals

---

## What's Built

A complete, production-ready single-page application with:

| Page | Route | Auth Required |
|------|-------|---------------|
| Landing / Waitlist | `/` | No |
| How It Works | `/how-it-works` | No |
| Scoring System | `/scoring` | No |
| About | `/about` | No |
| For Recruiters | `/recruiter` | No |
| Sign Up (3-step) | `/signup` | No |
| Sign In | `/signin` | No |
| Dashboard | `/dashboard` | ✅ |
| Profile Editor | `/profile` | ✅ |
| Certifications | `/certifications` | ✅ |
| Projects | `/projects` | ✅ |
| Leaderboard | `/leaderboard` | ✅ |
| Invite Colleagues | `/invite` | ✅ |
| Public Profile | `/u/:id` | No |

---

## Tech Stack

- **Frontend**: React 18 (CDN), no build step required
- **Routing**: Hash-based (`#/path`) — works on any static host
- **Database**: Supabase (Postgres + Auth + RLS)
- **Hosting**: Netlify, Vercel, or any static host
- **Fonts**: Google Fonts (Rajdhani, Outfit, JetBrains Mono)

---

## Go-Live in 15 Minutes

### Step 1 — Create a Supabase project (free)

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **SQL Editor** and paste the entire contents of `supabase-schema.sql`
3. Click **Run** — this creates all tables, views, RLS policies and triggers
4. Go to **Settings → API** and copy:
   - `Project URL` (e.g. `https://xyzxyz.supabase.co`)
   - `anon` public key

### Step 2 — Add your Supabase credentials

Open `src/app.jsx` and replace lines 10-11:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';   // ← replace
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';                 // ← replace
```

Also replace line 14:
```javascript
// FROM:
const supabase = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// TO:
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Step 3 — Enable Email Auth in Supabase

1. In Supabase: **Authentication → Providers → Email** → Enable
2. Optional: disable email confirmation for faster testing (**Auth Settings → Confirm email = OFF**)

### Step 4 — Deploy

**Option A: Netlify (recommended, free)**
```bash
# Drag the entire stackrank365/ folder to netlify.com/drop
# OR use Netlify CLI:
npm install -g netlify-cli
netlify deploy --dir . --prod
```

**Option B: Vercel (free)**
```bash
npm install -g vercel
vercel --prod
```

**Option C: GitHub Pages**
1. Push to GitHub
2. Settings → Pages → Source: Deploy from branch → main
3. Note: replace `supabase.createClient` before pushing (credentials safe for client-side with RLS)

**Option D: Any static host**
Just upload the `stackrank365/` folder as-is. No build step required.

---

## Connect Real Supabase Auth

Replace the demo `signIn` / `signUp` functions in `AuthProvider` (around line 40):

```javascript
// SIGN IN
const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if(data?.user) {
    setUser(data.user);
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
    setProfile(prof);
  }
  return { error };
};

// SIGN UP
const signUp = async (email, password, meta) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: meta }
  });
  if(data?.user) {
    setUser(data.user);
    // Profile created automatically by DB trigger
    setProfile({ ...meta, id: data.user.id, stack_points: 500 });
  }
  return { error };
};

// SIGN OUT
const signOut = async () => {
  await supabase.auth.signOut();
  setUser(null); setProfile(null);
};

// LOAD SESSION ON MOUNT
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if(session?.user) {
      setUser(session.user);
      supabase.from('profiles').select('*,certifications(*),projects(*)').eq('id', session.user.id).single()
        .then(({ data }) => setProfile(data));
    }
    setLoading(false);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user || null);
  });
}, []);
```

---

## Connect Waitlist to Supabase

In `PageLanding`, replace the `handleWaitlist` function:

```javascript
const handleWaitlist = async (e) => {
  e.preventDefault();
  if(!email) return;
  const { error } = await supabase.from('waitlist').insert({ email });
  if(!error) { setSubmitted(true); setWlCount(n=>n+1); }
};
```

---

## Connect Microsoft Learn API (certifications)

When ready to verify real certifications, add this to your `PageCertifications`:

```javascript
const verifyWithMicrosoftLearn = async () => {
  // 1. Redirect user to Microsoft OAuth
  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?
    client_id=YOUR_AZURE_APP_ID
    &response_type=code
    &redirect_uri=${encodeURIComponent(window.location.origin + '/auth/microsoft')}
    &scope=user.read%20offline_access`;
  window.location.href = authUrl;
};

// 2. After OAuth callback, call Microsoft Learn API:
const fetchCertifications = async (accessToken) => {
  const res = await fetch('https://learn.microsoft.com/api/credentials/transcripts', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  const data = await res.json();
  // data.certifications = array of earned certifications
  return data;
};
```

Register an Azure App at [portal.azure.com](https://portal.azure.com) → Azure Active Directory → App Registrations.

---

## Folder Structure

```
stackrank365/
├── index.html              ← Entry point, loads CDN dependencies
├── src/
│   └── app.jsx             ← Entire application (all pages + components)
├── supabase-schema.sql     ← Complete database schema
├── netlify.toml            ← Netlify routing config
├── vercel.json             ← Vercel routing config
└── README.md               ← This file
```

---

## Customisation

**Change brand colours** — edit the `C` object at the top of `app.jsx`:
```javascript
const C = {
  blue: '#00b4ff',   // Primary accent
  gold: '#f0c040',   // Ranking / points highlight
  green: '#00dfa0',  // Verified / success
  purple: '#9b72f5', // Specialty / prestige
  // ...
};
```

**Add new pages** — add a new `if(path === '/new-page')` in the `renderPage()` function in `App`.

**Add certifications to the catalog** — edit the `CERT_CATALOG` array.

---

## Next Steps (Post-Launch)

1. **Real auth** — replace demo signIn/signUp with Supabase calls (see above)
2. **Waitlist emails** — connect Resend or Mailchimp via Supabase Edge Functions
3. **Microsoft Learn OAuth** — register Azure app for cert verification
4. **Credly API** — add as secondary cert verification source
5. **Email notifications** — use Supabase Edge Functions + Resend for invitation emails
6. **Custom domain** — add in Netlify/Vercel dashboard
7. **Analytics** — add Plausible or Fathom (privacy-first, 1 script tag)

---

## Support

Built for StackRank365. All rights reserved © 2025.
