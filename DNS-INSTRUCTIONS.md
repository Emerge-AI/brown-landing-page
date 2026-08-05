# DNS setup — for the GoDaddy account owner

Forward this to whoever owns the GoDaddy account. It adds two records so
`marshallbrowndds.com` points at the new site. **Nothing is transferred and the
domain stays in your GoDaddy account.**

## Before you start

Get the Netlify site name from whoever deployed the site. It looks like
`something-something-123456.netlify.app`. You need it for step 4.

## Steps

1. Sign in to GoDaddy and open **My Products → Domains**.
2. Click **marshallbrowndds.com**, then open the **DNS** tab
   (may be labeled "Manage DNS").
3. Find the **existing `A` record with Name `@`** — GoDaddy creates a parked one
   by default. Click **Edit** on it and change its Value to:

   ```
   Type: A     Name: @     Value: 75.2.60.5     TTL: 1 hour
   ```

   Edit the existing record. Do **not** add a second `@` A record — GoDaddy will
   reject it or the two will conflict.

4. Add a new record for the www version:

   ```
   Type: CNAME  Name: www  Value: <the-netlify-site-name>.netlify.app  TTL: 1 hour
   ```

   If a `www` CNAME already exists (often pointing to `@`), edit that one instead
   of adding a duplicate.

5. Save.

## Important — do not skip

- **Leave every `MX` record exactly as it is.** Those route the practice's email
  at `info@marshallhbrown.com`. Deleting or changing them stops email delivery.
- **Turn off Domain Forwarding** if it's enabled, under Domain Settings →
  Forwarding. Forwarding silently overrides the records above.
- **Leave any `TXT` records alone**, especially ones starting with `v=spf1` or
  named `_dmarc` — they also affect email deliverability.

## What happens next

DNS changes usually take 15–60 minutes, occasionally up to 24 hours. Once it
resolves, the HTTPS certificate is issued automatically — no need to buy an SSL
certificate from GoDaddy.

## Optional — the second domain

To point `marshallhbrown.com` at the site as well (it will redirect visitors to
`marshallbrowndds.com`), repeat steps 1–5 on that domain using the same values.
Again, leave its MX and TXT records untouched.
