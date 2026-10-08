# BaZi reader

A working Four Pillars app on the [AstroWay API](https://api.astroway.info): birth data in, a full BaZi chart and its luck cycle out. Clone it, put a key in `.env`, run it.

**Live demo: [api.astroway.info/demo/bazi/](https://api.astroway.info/demo/bazi/)**

Two calls do all of it. `POST /v1/bazi/chart` returns the four pillars with their hidden stems, na yin and twelve-stage phase, the day master, the element balance three ways, the strength verdict with its reasoning, the symbolic stars from both reference pillars and every combination, clash or punishment between the branches. `POST /v1/bazi/luck-pillars` returns Da Yun: the direction, the solar term it was counted to, the starting age and ten pillars of ten years each. There is no local calendar library and no ephemeris in this repo.

## Run it

```bash
git clone https://github.com/astroway/starter-bazi
cd starter-bazi
npm install
cp .env.example .env     # put your key in it
npm run dev              # http://localhost:5173
```

Get a key at [api.astroway.info/dashboard/sign-up](https://api.astroway.info/dashboard/sign-up). The free tier is 10,000 credits a month and needs no card. Use an `aw_test_*` sandbox key while you build: it spends nothing.

For production:

```bash
npm run build
npm start                # http://localhost:5179, serves the built app and the API route
```

## Deploy it

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/astroway/starter-bazi)

The button reads `render.yaml`: one Node web service on the free plan, built with `npm run build` and started with `npm start`. Render asks for `ASTROWAY_API_KEY` when you create it; the key stays on the server. Any host that runs Node 22 works the same way: build once, start, set the key.

## What costs what

One reading is **30 credits**: 20 for `/bazi/chart` (Tier 2) and 10 for `/bazi/luck-pillars` (Tier 1). The two calls are independent, so they go out together. On the free tier that is 333 readings a month.

The server logs `X-Credits-Used` on every reading, because the cost of a feature should be visible before the bill is.

## The one thing that will catch you

**The browser cannot call `https://api.astroway.info/v1/*` directly.** Those responses carry no `access-control-allow-origin` header, so a `fetch` from your page fails on CORS before it fails on auth. That is deliberate: a key in client code is a key anyone can read.

So every AstroWay app needs a server route. `server/index.mjs` is the smallest honest one: 200 lines, no framework, no dependencies. It holds the key, makes the two calls, passes the API's own error message through unchanged, and rate limits by address so a public instance cannot be drained.

## Three things worth copying

**Send a time zone name, not an offset.** `"timezone": "Asia/Shanghai"`, never `"timezoneOffset": 8`. China has run a single zone since 1949 but kept summer time from 1986 to 1991, so the API resolves that name on 1990-05-15 to **UTC+9**, not the +8 the country keeps today. You can see it: the response echoes `input.timezoneOffset`.

What it moves here is the distance to the solar term Da Yun counts from: 9.4546 days at the resolved offset against 9.4962 at a hand-written +8. That is small enough to leave the starting age alone in this chart and large enough to move it in another, which is the whole argument for not computing offsets yourself. The hour pillar is read off the local clock, so it does not move with the offset; the month pillar and the luck cycle do, because both are cut by solar terms.

**Gender is not decoration.** Da Yun runs forward or backward depending on the year stem's polarity and the person's gender, so there is no neutral value to default to. The server refuses the call rather than guessing.

**Ask for a language.** The API's default is Ukrainian, so a page that sends nothing gets "Ян Метал" under an English heading. Stems and branches stay romanised either way; the element, animal, na yin and twelve-stage names are the ones that change. `language: 'en'` is sent on both calls here.

**Pass the API's error through.** When the upstream refuses, this app shows the API's own message and code. It knows why it refused and your wrapper does not; rewriting the reason is how somebody ends up debugging your guess instead of their input.

## What the page shows

The four pillars are drawn right to left, hour to year, the way a classical chart is written, with the stem above the branch and the hidden stems under it. The day pillar is marked, because its stem is the day master and the rest of the chart is read against it. Colours are the five phases, so Earth is yellow rather than the brown an English reader expects.

Element balance uses the weighted figures, where each branch contributes one character split among its hidden stems by weight, and marks which elements the strength analysis called useful.

The reading carries its own caveats and this app prints them rather than hiding them: the strength framework is one of several, and several symbolic stars have a `schoolNote` where the classical sources disagree.

## Layout

Audited at 320, 375, 393, 430, 768, 1024 and 1440 px with a mechanical check for overflow, overlap, clipped text, contrast and tap targets. Zero findings at all seven.

The pillar grid stays four columns at every width, because a BaZi chart that reflows into one column is no longer a chart. Year sits on the right, the way 年 月 日 時 is written. The label row reserves the height of the day master tag in every column, so the four rows line up whether or not a column carries it. Below 56rem the balance panel moves under the grid rather than beside it.

## Licence

MIT. Take it, change it, ship it.
