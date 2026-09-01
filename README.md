# BASE APOCALYPSE

Official campaign site. GTD and WL application. Cap: 3,000 wallets.

Applicants submit a Base / EVM wallet on this site. There is no Google Form
and no wallet connect.

## Operator

Edit `src/config.ts`:

```
APPLICATION_OPEN   true while the list is open
MAX_SUBMISSIONS    3000
X_URL / X_HANDLE   the account to grow
TASK_URL           paste the signal post later; leave blank until it exists
CODE               public-post code
SUPPLY / WINDOW    overview facts
```

When the list hits 3,000, set `APPLICATION_OPEN` to false. Apply hides.

## Database

Wallets persist in Postgres. Set `DATABASE_URL` on the host (Neon on the
Grok deploy; add the same on Vercel if you deploy there yourself). Without
it, submissions will not survive.
