# Aurava — Marketing Strategy

Aurava (https://www.auravaw.tech) is an image-first wallpaper marketplace: free + premium
4K/HD wallpapers, **live (looping) wallpapers**, KES pricing via **PesaPal**, **guest checkout**
(no account needed), a blog, and seasonal/holiday tagging. This document is the **growth plan** —
how to get traffic, convert it, and bring it back. It complements `SEO.md` (technical/on-page
search), which it does not repeat.

> **Positioning in one line:** *Premium, locally-priced wallpapers for African phones & desktops —
> pay with M-Pesa, no account required.* That combination (curation + live wallpapers + M-Pesa +
> guest checkout) is your wedge against the global free giants (Unsplash, Wallhaven, Zedge).

---

## 1. Strategic foundation

### Who you're actually competing with — and why you win
| Competitor | Their model | Where Aurava wins |
|---|---|---|
| Unsplash / Pexels | Free, generic, no curation | Curation + live wallpapers + a real "ready for *your* device" promise |
| Zedge | Free + ad-heavy, app-first | Cleaner UX, web-first, higher-quality premium tier |
| Wallhaven / DeviantArt | Enthusiast, cluttered | Premium polish, instant M-Pesa purchase |
| Global premium stores | USD pricing, card-only | **KES pricing + M-Pesa via PesaPal** — frictionless for the local market |

**Your three durable moats:** (1) **Live wallpapers** — a premium, shareable, video-native format
the free sites barely do; (2) **Local payments** — M-Pesa/PesaPal removes the #1 checkout blocker
in your home market; (3) **Guest checkout** — buy in under 60 seconds, no signup wall.

### Two audiences, two motions
- **B2C — wallpaper seekers** (volume). Win them with SEO + social discovery + free tier as a hook.
- **The "aesthetic" crowd** (phone-customization, anime, cars, minimal/OLED-dark) — these are the
  segments that *share*, and sharing is free distribution. Build for them deliberately.

### North-star + the funnel you're optimizing
**North star:** *paid downloads per month.* Sub-metrics map to the funnel:

```
Discovery → Visit → Browse → (Free download | Add to cart) → Checkout → Repeat / Refer
   SEO/social   CTR    engaged   email capture / cart    conversion   retention/UGC
```

Pick **one funnel stage to fix each month**. Don't run every channel at once — you'll spread too
thin. Suggested order: **Discovery → Conversion → Retention.**

---

## 2. Channel strategy (ranked by ROI for a wallpaper site)

### Tier 1 — Pinterest (your single highest-leverage channel)
Pinterest *is* a wallpaper search engine. Each pin is an evergreen, image-first link back to a
buyable page — it compounds for months, unlike a feed post that dies in hours.
- Create boards per category × device: "iPhone Dark Wallpapers", "4K Desktop Nature", "Live Phone
  Wallpapers", "Anime Wallpapers 4K", seasonal boards ("Christmas Wallpapers").
- Pin **every** wallpaper with a keyword-rich title + description + link to its product page. This
  can be **automated** from your catalog (see §6 — you already have the data and OG images).
- Use **Rich Pins** (pulls your existing OG/structured metadata automatically).
- Target: 15–25 fresh pins/week. This is the cheapest scalable traffic you have.

### Tier 1 — TikTok / Instagram Reels / YouTube Shorts (built for live wallpapers)
Your **live wallpapers are native short-form content** — a looping wallpaper *is* a Reel.
- Format that works: "POV: your phone looks like this" → screen-recording of the live wallpaper on
  a phone → end card "auravaw.tech". 7–15s, trending audio, on-screen text.
- "Top 5 [anime/car/minimal] wallpapers this week" compilations → link in bio to that collection.
- Post 4–7×/week per platform; recycle the same export across all three. One good loop can do what
  a month of SEO does.
- CTA is always the same memorable phrase: *"auravaw.tech — wallpapers, no app needed."*

### Tier 2 — Reddit (high-intent, free, but rules-strict)
- r/wallpapers, r/iWallpaper, r/Amoledbackgrounds, r/AnimeWallpaper, r/MobileWallpaper.
- **Give first.** Post genuinely great wallpapers as free contributions (most subs ban naked
  self-promo). Put the link in your profile + a soft "made more at…" comment. Build karma/trust
  before any direct promotion.
- One quality post that hits a sub's front page = thousands of targeted visitors.

### Tier 2 — Email (you already capture buyer emails — use them)
Every order has an email (guest or not). This is owned audience you're currently not monetizing.
- **Welcome/receipt** already goes out (Resend). Extend it with a "complete your set" cross-sell.
- **Weekly/biweekly "New this week"** drop — 6 new wallpapers, one seasonal pick, one CTA.
- **Seasonal campaigns** tied to your holiday tags (see §4).
- **Win-back**: "We added live wallpapers in [category] you browsed."
- Keep it light, image-led, one CTA. (See §6 for the capture mechanics you still need.)

### Tier 3 — Partnerships & community (Kenya/Africa edge)
- **Phone & accessory sellers / repair shops** (Nairobi, etc.): bundle a "free premium wallpaper
  pack" voucher with a phone sale — co-branded, drives QR scans to the site.
- **Local tech / lifestyle micro-influencers** (5k–50k followers): cheap, high-trust, M-Pesa-native
  audience. Give a discount code + free premium pack; track via code.
- **University/campus ambassadors**: students are heavy phone-customizers and price-sensitive — your
  free tier + KES pricing is perfect.

### Tier 3 — Paid ads (only after organic + conversion are dialed in)
Don't pay for traffic until the site *converts* free traffic. When ready:
- **Pinterest Ads** first (cheapest CPMs for this vertical, intent-rich).
- **Meta/IG retargeting** of cart-abandoners and site visitors (needs the Pixel — see §6).
- Start at a tiny budget (KES 500–1,000/day), kill anything that doesn't beat organic CAC.

---

## 3. Conversion strategy (turn the free traffic you already have into money)

Traffic is wasted if the site doesn't convert. Highest-impact levers, in order:

1. **Free tier as the hook, premium as the upsell.** On every free download, surface a
   "You might also like" strip of *premium* wallpapers in the same category. Free download is the
   trust-builder; the related-premium nudge is the conversion.
2. **Bundles / packs.** "Pick any 5, save 20%." Wallpapers are low-commitment impulse buys — basket
   size grows fast with a small multi-buy discount. (Pricing logic lives server-side in
   `lib/orders.ts` — re-priced from the catalog, so add bundle logic there, never client-side.)
3. **Cart abandonment.** You have guest emails at checkout start. If an order goes `pending` and
   never completes, send a one-shot "still want these? finish in 1 tap" email after ~1–24h.
4. **Scarcity / freshness, honestly.** "New this week" and "Trending" rails create return-visit
   reasons without fake urgency. Seasonal packs are time-bound *for real* — lean on those.
5. **First-purchase incentive.** A `WELCOME10` code in the welcome email converts the
   browsed-but-didn't-buy segment. (Needs a promo-code field at checkout — see §6 gaps.)
6. **Trust signals at the point of sale.** "Pay with M-Pesa", "Instant download", "No account
   needed", refund/license links near the checkout button. You already have the legal pages — make
   them visible where money changes hands.

---

## 4. Content & seasonal calendar

Content is what makes SEO and social *compound*. You already have a blog (`/blog`, BlogPosting
schema) and holiday tags — use both.

### Evergreen content (SEO-driven, links to buyable pages)
- "Best [4K / OLED-dark / minimal / anime / live] wallpapers for [iPhone / Android / desktop] 2026"
  — one post per high-intent long-tail query (the list in `SEO.md §3`), each internally linking to
  the matching category/device collection.
- "How to set a live wallpaper on iPhone / Android" — captures how-to search traffic, ends on your
  live-wallpaper collection.
- "Wallpaper sizes & resolutions explained" — captures the "what size wallpaper for X" queries.

### Seasonal campaigns (you already have holiday tagging — `lib/holidays.ts`)
Build a **curated landing collection + email + social push** for each, ~2 weeks ahead:
- **Q1:** New Year ("fresh start" minimal/aesthetic), Valentine's.
- **Q2:** Easter, Ramadan/Eid, Africa Day (May 25 — lean into the local brand).
- **Q3:** Back-to-school (campus push), Independence/Mashujaa season.
- **Q4 (your biggest):** Halloween → "spooky/dark" packs; **Christmas + New Year** — your peak,
  plan a flagship "Holiday Pack" bundle + biggest email + ad push.

### Social content pillars (rotate)
Showcase (the wallpaper on a device) · Live-wallpaper loops · "Pack of the week" · Behind-the-scenes
/ how it's made · UGC reposts (see §5) · Seasonal.

---

## 5. Retention, referral & UGC

Acquiring a buyer once is expensive; getting them back is nearly free.
- **Accounts as a perk, not a wall.** Guest checkout stays (it's a moat). But pitch account creation
  *after* purchase ("save your downloads, get them on any device") — you already do this on the
  confirmation page; reinforce it in email.
- **Referral loop.** "Give a friend 15%, get 15%." Wallpapers are inherently shareable — make
  sharing rewarded.
- **UGC engine.** Ask buyers to post their setup with a branded hashtag (e.g. **#MyAurava**); repost
  the best. Free, authentic, social-proof content. Add a one-line "tag us #MyAurava" to the receipt
  email and confirmation page.
- **Loyalty.** "Every 5th wallpaper free" or points — cheap to run, strong repeat-purchase pull for
  an impulse category.

---

## 6. Marketing infrastructure — gaps to close (engineering-adjacent)

These are the build items that *enable* the strategy above. Roughly prioritized.

| Priority | Item | Why it matters | Where |
|---|---|---|---|
| **P0** | **Analytics** — GA4 or Plausible/Umami + **Meta Pixel** + **Pinterest Tag** | You cannot optimize what you don't measure; pixels are prerequisites for retargeting | `app/layout.tsx` |
| **P0** | **Email list capture** beyond buyers — newsletter signup (footer + exit-intent + "notify me on new in this category") | Owned audience is the cheapest repeat-traffic source | `components/footer.tsx`, new component; Resend audiences |
| **P1** | **Promo / discount codes** at checkout | Unlocks welcome offers, referrals, influencer codes, seasonal sales | `lib/orders.ts` (re-price server-side), `checkout` |
| **P1** | **Cart-abandonment email** for `pending` orders | Recovers already-interested, already-emailed buyers | `lib/orders.ts`, scheduled job / cron (you have `CRON_SECRET`) |
| **P1** | **Bundle pricing** ("any 5, -20%") | Raises average order value | `lib/orders.ts` |
| **P2** | **Pinterest auto-pin feed** from catalog | Scales your #1 organic channel without manual work | new route emitting an RSS/feed Pinterest can ingest, or scheduled API push |
| **P2** | **Social share buttons** with pre-filled captions on wallpaper pages | Turns visitors into distributors | `wallpapers/[slug]` (a `share-button` component already exists) |
| **P2** | **`sameAs` social profiles** in Organization JSON-LD | Brand entity / knowledge-panel signal (also in `SEO.md`) | `lib/seo.ts` |
| **P3** | **Referral tracking** (codes + attribution) | Powers the referral loop in §5 | `lib/orders.ts`, account |
| **P3** | **UTM discipline** — tag every campaign link | Know which channel actually drives sales | manual / link-builder |

---

## 7. 90-day rollout (focus beats breadth)

### Month 1 — Foundation & Discovery
- Ship **P0 infra**: analytics + Meta Pixel + Pinterest Tag; newsletter capture in footer.
- Set up **Pinterest** business account, create category boards, start pinning (15–20/week).
- Start **TikTok/Reels**: 3 posts/week of live-wallpaper loops.
- Verify Search Console/Bing + submit sitemap (per `SEO.md`).
- *Goal:* measurement live, two organic channels seeding.

### Month 2 — Conversion
- Ship **promo codes** + a `WELCOME10` first-purchase offer in the welcome email.
- Ship **cart-abandonment email** + a related-premium strip on free downloads.
- Launch **bundles** ("any 5, -20%").
- Publish 4 evergreen SEO posts targeting long-tail queries; internally link them.
- Scale social to 5–7 posts/week; start light **Reddit** giving.
- *Goal:* lift conversion rate on existing traffic; grow the email list.

### Month 3 — Scale & Retention
- Launch **referral** ("give 15 / get 15") + **#MyAurava** UGC ask.
- Run the first **seasonal campaign** end-to-end (landing collection + email + social + small ads).
- Turn on **paid retargeting** (Pinterest Ads + Meta retargeting) at a small budget — only the
  campaigns that beat organic CAC survive.
- Begin **local partnerships** (1–2 phone shops or micro-influencers).
- *Goal:* repeat-purchase + first profitable paid channel.

---

## 8. Metrics to watch

| Funnel stage | Metric | Tool |
|---|---|---|
| Discovery | Sessions by channel, Pinterest impressions/saves, social reach | GA4/Plausible, native dashboards |
| Engagement | Pages/session, free-download rate, add-to-cart rate | GA4 + your admin dash |
| Conversion | Visit→purchase %, cart-abandon %, AOV, code redemptions | GA4 + `admin-dash/orders` |
| Retention | Repeat-purchase rate, email open/click, referral redemptions | Resend + GA4 |
| Efficiency | CAC by channel, ROAS (paid), revenue/email-subscriber | spreadsheet from above |

**Review monthly. Double down on the 1–2 channels with the best cost-per-paid-download; cut the
rest.** A wallpaper business is won by finding the one or two channels that compound (almost always
Pinterest + short-form video) and pouring everything into them.

---

### TL;DR
Your edges are **live wallpapers, M-Pesa pricing, and frictionless guest checkout**. Lead with
**Pinterest + short-form video** for free, compounding discovery; close the **analytics, email
capture, promo-code, and cart-abandonment** gaps so traffic converts; then retain with **email,
seasonal packs, referrals, and UGC**. Fix one funnel stage a month — Discovery, then Conversion,
then Retention.
