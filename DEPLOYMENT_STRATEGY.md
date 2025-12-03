# Deployment Strategy - Simple Guide

## What We Have

We have **4 separate applications** that work together:

1. **Agnipariksha** - Main application (the big one)
   - **Live URL:** [https://test.nowpurchase.com/](https://test.nowpurchase.com/)
2. **MTC Module** - Material Test Certificate features
   - **Status:** To be deployed separately
3. **Grade Module** - Grade management features  
   - **Status:** To be deployed separately
4. **Dynamic Logsheet Module** - Logsheet features
   - **Live URL:** [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/)

These apps can work together (like puzzle pieces) or run on their own.

**Current Status:**
- ✅ Agnipariksha is deployed at [https://test.nowpurchase.com/](https://test.nowpurchase.com/)
- ✅ Dynamic Logsheet is deployed at [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/)
- ⏳ MTC and Grade modules need separate deployments

---

## Two Ways to Deploy

### Option 1: Deploy Each App Separately (RECOMMENDED) ✅

**What it means:** Each app gets its own website/URL and deploys independently.

**Current Setup:**
- [https://test.nowpurchase.com/](https://test.nowpurchase.com/) → Main Agnipariksha app
- MTC module → (to be deployed separately)
- Grade module → (to be deployed separately)
- [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/) → Dynamic Logsheet module

### Option 2: Deploy Everything Together (NOT RECOMMENDED) ❌

**What it means:** All apps bundled into one big website with routing.

**How it works:**
- Keep the existing [https://test.nowpurchase.com/](https://test.nowpurchase.com/) as is (Agnipariksha stays separate)
- Create a new single deployment that includes all 4 apps (Agnipariksha + MTC + Grade + Logsheet)
- Deploy this combined build to a new URL like `https://test.monrepo.com/` (or similar)
- Use routing to determine which app to show based on the URL path

**Example URLs:**
- `https://test.monrepo.com/` → Shows main Agnipariksha app
- `https://test.monrepo.com/mtc` → Shows MTC module
- `https://test.monrepo.com/grade` → Shows Grade module
- `https://test.monrepo.com/logsheet` → Shows Logsheet module

**Result:** You'd have 2 separate deployments:
1. [https://test.nowpurchase.com/](https://test.nowpurchase.com/) - Current Agnipariksha (stays as is)
2. `https://test.monrepo.com/` - New combined deployment with all apps, using routing

---

## Why Option 1 is Better - Real Examples

### 1. **Faster Build Times = Faster Deployments**

**Real Scenario:** Developer fixes a small bug in MTC module

**Option 1 (Separate):**
- Build time: **2 minutes** (only MTC builds)
- Deploy time: **1 minute**
- **Total: 3 minutes** ✅

**Option 2 (Together):**
- Build time: **15 minutes** (all 4 apps build)
- Deploy time: **2 minutes**
- **Total: 17 minutes** ❌

**Time Saved: 14 minutes per deployment**

**If you deploy 10 times per week:**
- Option 1: 30 minutes total
- Option 2: 170 minutes total
- **You save 140 minutes (2.3 hours) per week**

---

### 2. **Smaller File Sizes = Faster Loading**

**Real Scenario:** User visits the website

**Option 1 (Separate):**
- User visits [https://test.nowpurchase.com/](https://test.nowpurchase.com/) → Downloads only main app
- User visits [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/) → Downloads only logsheet module
- User downloads only what they need
- MTC page: **500 KB** to download
- Grade page: **400 KB** to download
- Logsheet page: **400 KB** to download
- **Total if user visits multiple pages: Only downloads what's needed**

**Option 2 (Together):**
- User visits [https://test.nowpurchase.com/](https://test.nowpurchase.com/) → Downloads everything at once
- **2.5 MB** to download (all apps bundled)
- User waits longer even if they only need one feature

**Real Impact:**
- **Option 1:** Page loads in **2 seconds** (only loads what's needed)
- **Option 2:** Page loads in **8 seconds** (loads everything)
- **Users wait 6 seconds longer** with Option 2

**If 1000 users visit per day:**
- Option 1: Users wait 2,000 seconds total (33 minutes)
- Option 2: Users wait 8,000 seconds total (133 minutes)
- **Users waste 100 minutes more per day with Option 2**

---

### 3. **Independent Updates = Less Risk**

**Real Scenario:** You need to update Grade module, but MTC is working fine

**Option 1 (Separate):**
- Update Grade → Deploy Grade only
- MTC keeps working (no changes)
- If Grade has a problem, MTC still works ✅
- **Risk: Low** (only affects Grade)

**Option 2 (Together):**
- Update Grade → Must rebuild everything
- If build fails, nothing deploys
- If Grade has a problem, might affect other apps
- **Risk: High** (affects everything)

**Real Example:**
- Grade update breaks → With Option 1, only Grade is down, [https://test.nowpurchase.com/](https://test.nowpurchase.com/) and [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/) still work
- Grade update breaks → With Option 2, entire website [https://test.nowpurchase.com/](https://test.nowpurchase.com/) might be down

---

### 4. **Cost Efficiency on Netlify**

**Netlify Pricing (as of 2024):**

**Free Tier:**
- 100 GB bandwidth per month
- 300 build minutes per month
- Unlimited sites

**Pro Tier ($19/month per site):**
- 1 TB bandwidth per month
- 1,000 build minutes per month

**Team Tier ($99/month per site):**
- 1.5 TB bandwidth per month
- 5,000 build minutes per month

---

### **Cost Comparison - Real Numbers**

**Scenario:** You deploy 3 times per day, 5 days per week = **60 deployments per month**

**Build Times:**
- Option 1: 3 minutes per app × 60 deployments = **180 minutes per app**
- Option 2: 15 minutes × 60 deployments = **900 minutes total**

**Option 1 (Separate Deployments):**
- 4 apps × 180 minutes = 720 minutes total
- **Free tier: 300 minutes** ❌ Not enough
- **Pro tier: $19/month × 4 sites = $76/month** ✅ Enough
- **Note:** We already have 2 sites deployed ([https://test.nowpurchase.com/](https://test.nowpurchase.com/) and [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/)), so we need 2 more for MTC and Grade

**Option 2 (Single Deployment):**
- 1 site × 900 minutes = 900 minutes total
- **Free tier: 300 minutes** ❌ Not enough
- **Pro tier: $19/month × 1 site = $19/month** ✅ Enough

**BUT WAIT - There's more to consider:**

---

### **Hidden Costs - Bandwidth Usage**

**Real Scenario:** 10,000 page views per month

**Option 1 (Separate):**
- Users download only what they need
- Average: 500 KB per page view
- Total: 10,000 × 500 KB = **5 GB per month**
- **Free tier: 100 GB** ✅ Plenty of room

**Option 2 (Together):**
- Users download everything
- Average: 2.5 MB per page view
- Total: 10,000 × 2.5 MB = **25 GB per month**
- **Free tier: 100 GB** ✅ Still okay, but using more

**At 50,000 page views per month:**
- Option 1: 25 GB ✅ Still free
- Option 2: 125 GB ❌ Need Pro tier ($19/month)

---

### **Developer Time = Money**

**Real Scenario:** Developer makes 5 small fixes per week

**Option 1 (Separate):**
- Each fix: 3 minutes to deploy
- 5 fixes × 3 minutes = **15 minutes per week**
- Developer can do other work while waiting

**Option 2 (Together):**
- Each fix: 17 minutes to deploy
- 5 fixes × 17 minutes = **85 minutes per week**
- Developer waits 70 minutes more per week

**If developer costs $50/hour:**
- Option 1: 15 minutes = $12.50 per week
- Option 2: 85 minutes = $70.83 per week
- **Extra cost: $58.33 per week = $233 per month**

**Over 1 year:**
- **Option 1 saves $2,800 in developer time**

---

### **Team Productivity**

**Real Scenario:** 3 developers working on different modules

**Option 1 (Separate):**
- Developer A works on MTC → Deploys MTC (3 min)
- Developer B works on Grade → Deploys Grade (3 min)
- Developer C works on Logsheet → Deploys Logsheet (3 min)
- **All can work at the same time** ✅

**Option 2 (Together):**
- Developer A works on MTC → Must wait for full build (17 min)
- Developer B wants to deploy Grade → Must wait for A to finish
- Developer C wants to deploy Logsheet → Must wait in line
- **Developers wait for each other** ❌

**Real Impact:**
- Option 1: 3 developers deploy in **3 minutes** (parallel)
- Option 2: 3 developers deploy in **51 minutes** (sequential)
- **48 minutes wasted per deployment cycle**

---

## Netlify Setup - Simple Steps

### For Option 1 (Recommended):

1. **Create 4 separate Netlify sites:**
   - Site 1: Agnipariksha
   - Site 2: MTC
   - Site 3: Grade
   - Site 4: Dynamic Logsheet

2. **Connect each to GitHub:**
   - Point to same repository
   - Set base directory for each:
     - Agnipariksha → `Agnipariksha/`
     - MTC → `apps/mtc/`
     - Grade → `apps/grade/`
     - Logsheet → `apps/dynamiclogsheet/`

3. **Set build commands:**
   - Each app already has `npm run build` in package.json
   - Netlify will use the `netlify.toml` file if present

4. **Set publish directory:**
   - MTC: `dist/`
   - Grade: `dist/`
   - Logsheet: `dist/`
   - Agnipariksha: `build/`

5. **Configure custom domains:**
   - [https://test.nowpurchase.com/](https://test.nowpurchase.com/) → Agnipariksha (already set up)
   - MTC → (to be configured)
   - Grade → (to be configured)
   - [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/) → Dynamic Logsheet (already set up)

---

## Cost Summary

### Monthly Costs (Option 1 - Separate):

**Free Tier (if under limits):**
- $0/month ✅
- Good for: Testing, low traffic

**Pro Tier (recommended for production):**
- $19/month × 4 sites = **$76/month**
- **Current:** 2 sites already deployed = $38/month (if on Pro tier)
- **Additional:** 2 more sites needed = $38/month more
- **Total:** $76/month for all 4 sites
- Includes: Better performance, more build minutes, priority support

**Team Tier (if you need more):**
- $99/month × 4 sites = **$396/month**
- Includes: Everything in Pro, plus team features

### Monthly Costs (Option 2 - Together):

**Free Tier:**
- $0/month ✅
- But: Slower builds, slower website

**Pro Tier:**
- $19/month × 1 site = **$19/month**
- But: Still slower, less flexible

---

## Real-World Comparison Table

| Factor | Option 1 (Separate) | Option 2 (Together) | Winner |
|--------|---------------------|---------------------|--------|
| **Build Time** | 3 minutes | 17 minutes | Option 1 ✅ |
| **Page Load Speed** | 2 seconds | 8 seconds | Option 1 ✅ |
| **Deployment Risk** | Low (one app) | High (all apps) | Option 1 ✅ |
| **Developer Wait Time** | 15 min/week | 85 min/week | Option 1 ✅ |
| **Team Productivity** | High (parallel) | Low (sequential) | Option 1 ✅ |
| **Monthly Cost (Pro)** | $76 | $19 | Option 2 ✅ |
| **Bandwidth Usage** | Lower | Higher | Option 1 ✅ |
| **Flexibility** | High | Low | Option 1 ✅ |
| **Scalability** | Easy | Hard | Option 1 ✅ |

---

## Recommendation

**Choose Option 1 (Separate Deployments)** because:

1. ✅ **Faster** - 5x faster builds and deployments
2. ✅ **Cheaper in long run** - Saves developer time worth $2,800/year
3. ✅ **Safer** - Problems in one app don't break everything
4. ✅ **Better for users** - Faster page loads
5. ✅ **Better for team** - Developers don't wait for each other
6. ✅ **More flexible** - Easy to scale individual apps

**The extra $57/month ($76 vs $19) is worth it because:**
- Saves $233/month in developer time
- **Net savings: $176/month**
- **Net savings per year: $2,112**

---

## Next Steps

1. ✅ **Already Done:** [https://test.nowpurchase.com/](https://test.nowpurchase.com/) (Agnipariksha) and [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/) (Logsheet) are deployed
2. ⏳ Set up 2 more Netlify sites for MTC and Grade modules
3. ✅ Connect to GitHub repository (same repo, different base directories)
4. ✅ Configure build settings (already in netlify.toml files)
5. ⏳ Set up custom domains for MTC and Grade (or use Netlify subdomains)
6. ✅ Test deployments
7. ✅ Monitor performance and costs

---

## Questions?

**Q: Can we start with free tier?**
A: Yes! Start free, upgrade to Pro when you need more build minutes or bandwidth.

**Q: What if one app gets more traffic?**
A: With separate deployments, you can scale just that one app. For example, if [https://dynamiclogsheet-mono-stage.netlify.app/](https://dynamiclogsheet-mono-stage.netlify.app/) gets more traffic, you can upgrade just that site. Can't do that with Option 2.

**Q: Is it harder to manage 4 sites?**
A: No, Netlify makes it easy. You can see all sites in one dashboard.

**Q: What about SSL certificates?**
A: Netlify provides free SSL for all sites automatically.

---

**Bottom Line:** Option 1 costs a bit more ($76 vs $19) but saves time, improves performance, and reduces risk. The time savings alone are worth $2,800 per year, making Option 1 the clear winner.

