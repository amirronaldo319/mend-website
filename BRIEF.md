# BRIEF.md — Mend landing page → production

> Full working spec. Execute in order, P0 → P1 → P2. Commit after each numbered
> task with a message naming it. Stop and ask before anything in "Do not do."
> Summarise at the end of each priority tier.

## Context
Mend: a tool for parents who lose their temper at their child at bedtime, aimed at
the *twenty minutes after* the blowup — the repair window, not the crisis moment.
Audience: parents of kids 2–12, mostly mothers 28–45, reading at ~9pm, ashamed,
cynical about wellness apps. Voice: plain, specific, a little literary. Never
therapeutic, never chirpy. Design concept "the hallway light": deep dusk blue base,
one warm amber accent; anger rendered as over-exposure (blown-out white at top),
cooling through amber to sage on scroll. Section labels are real clock times.
Acquisition is organic-only (SEO + short-form video) — so the article pages are the
growth channel, not a nice-to-have.

Founder: Amir Keshavarzi, 22, North Vancouver, no children, also runs 604 Kars,
student. No clinical counsellor named yet (intention, not fact). No Formspree
endpoint yet. No domain yet. "Mend" is a working name.

## Hard constraints (do not violate)
1. "therapy/therapist/counselling/treatment/clinical" must NEVER appear as a claim
   about Mend — only in denials. (Illinois WOPR Act, Nevada AB 406.)
2. "What Mend is not" stays at full length, above pricing. Not a footer, not a modal.
3. Crisis resources block stays visible in the footer on EVERY page: 310-1234
   (BC Helpline for Children), 1-800-668-8255 (Parent Support Line BC), 988, 911.
4. No fabricated numbers, testimonials, logos, or credentials.
5. No streaks, badges, points, gamification language.
6. prefers-reduced-motion must disable every animation (CSS and JS).
7. Single-page-per-file, no build step, no framework. Netlify drag-to-deploy. Ask
   before adding any build step.

## P0 — Honesty and trust (do first)
- 3.1 Remove fake "312 parents ahead of you". Replace with true/unfalsifiable copy.
- 3.2 Fix "who's building this" FAQ: first person singular, one person, no counsellor
  yet, counsellor WILL review every word before ship, page will name her then.
- 3.3 Add /about.html: who you are, that you're not a parent, why anyway, who reviews,
  what you'll do if you get it wrong.
- 3.4 Wire f1 & f2 to a real endpoint (Formspree). Single `const FORM_ENDPOINT`. fetch
  POST + Accept: application/json; idle/submitting/success/error states; aria-live
  region; honeypot `_gotcha`; lenient email check (has "@" with something either
  side); on error show real failure + fallback email.
- 3.5 /privacy.html + /terms.html matching design, CLEARLY marked draft pending legal
  review. Collected: email only. No sale, no training on user content, retention,
  deletion, contact address.

## P1 — Correctness & accessibility
- 4.1 FAQ: remove `<button>` inside `<summary>` (invalid). Rebuild valid, keep anim.
- 4.2 Mobile nav: button aria-expanded/aria-controls, focus trap, Esc + outside click
  close, restore focus, animate; degrade to CTA with JS off.
- 4.3 Time axis: restack vertically under ~640px, fill top-to-bottom.
- 4.4 Dial: centre dead zone (~35% radius), visible focus ring, touch hint "drag
  around the ring", optional small-screen stepper fallback.
- 4.5 Grain overlay: measure; if it costs frames, tile PNG / drop <900px / remove.
- 4.6 Skip link first focusable, visible on focus; audit focus order.
- 4.7 color-mix() rgba() fallback before it.

## P2 — Pages that make the business work
- 5.1 /writing/ template + 3 articles (1,200–1,800w): "What to say after you yell at
  your child"; "Why you snap more when you're tired"; "Mom rage is exhaustion, not a
  character flaw". Each: one h1, meta desc, article JSON-LD, internal links, no health
  claims as fact.
- 5.2 SEO/social: favicons, og/twitter tags, OG image 1200×630, canonical, sitemap.xml,
  robots.txt, Organization + WebSite JSON-LD.
- 5.3 Analytics: privacy-respecting (Plausible/PostHog EU/CA), no form contents/email/
  text ever, cookie-free, page views + article scroll depth + form-submit event.
- 5.4 /404.html: same design, one line, links home + crisis resources.

## §6 Animation
Refine: reveal 0.85s→0.55s / 0.06s stagger; counters split number/suffix, textContent
only, tabular-nums; typewriter pause on ,.— ; dial demo cancels permanently on user
input. Add exactly 4: (1) door-light sweep on hero seam 6–8s; (2) text-mask reveal on
the 3 h2s ("wrong minute", "twenty", "Patterns") only; (3) pattern number count-up
synced to bars; (4) cursor-proximity warmth on pricing cards, (hover:hover)+(pointer:
fine) only, rAF-throttled. All dead under reduced-motion (verify JS count-ups too).

## §7 Gates (measure & report)
Perf(mobile)≥92, A11y=100, BP/SEO≥95, CLS<0.02, LCP<2.0s, page<180KB(excl fonts),
3 families ≤6 weights latin subset, W3C 0 errors, keyboard pass, 320/375/768/1440,
VoiceOver on dial+FAQ. Self-host+subset fonts if >200ms LCP; font-display:swap +
preload display face.

## Do not do
No redesign (propose in a comment, leave code). No chatbot/AI demo widget. No stock
photos. No countdown/exit-intent/urgency/chat bubble. No testimonials (not even
placeholder). Don't soften "What Mend is not". No framework/bundler/npm without
asking. Don't generate FINAL legal copy — draft + label + note lawyer review needed.
