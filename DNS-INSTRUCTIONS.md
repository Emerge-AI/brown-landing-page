# DNS setup for marshallbrowndds.com — for the GoDaddy account owner

Forward this to whoever owns the GoDaddy account. It points
`marshallbrowndds.com` at the new website. **The domain is not transferred
anywhere — it stays in your GoDaddy account.**

Verified safe: this domain currently has **no email (no MX records) and no SPF
records**, so nothing about the practice's email can be affected by these
changes. It presently shows only a GoDaddy parking page.

## Step 1 — Turn OFF domain forwarding (required first)

The domain is currently set to forward to a GoDaddy parking page. Forwarding
**overrides** DNS records, so the site will not appear until this is removed.

1. Sign in to GoDaddy → **My Products → Domains → marshallbrowndds.com**.
2. Open **Domain Settings** and find **Forwarding**.
3. **Delete / turn off** any forwarding rule listed (both Domain and Subdomain).

## Step 2 — Set the two DNS records

Go to the **DNS** tab for marshallbrowndds.com (sometimes "Manage DNS").

**Record 1 — edit the existing `A` record on `@`:**

```
Type: A     Name: @     Value: 75.2.60.5     TTL: 1 hour
```

There is already an `@` A record (currently pointing at GoDaddy's parking
service). **Edit that record** — do not add a second one, or they will
conflict. If more than one `@` A record exists, delete the extras so only
`75.2.60.5` remains.

**Record 2 — the `www` CNAME:**

```
Type: CNAME     Name: www     Value: endearing-pavlova-69c554.netlify.app     TTL: 1 hour
```

A `www` record already exists — edit it rather than adding a duplicate.

## Step 3 — Save

That's everything. DNS changes usually take 15–60 minutes, occasionally up to
24 hours.

Once it resolves, the HTTPS certificate is issued **automatically and free** —
there is no need to buy an SSL certificate from GoDaddy.

## What NOT to touch

Nothing on this domain carries email today, but as a general rule leave any
`MX` records and any `TXT` records beginning with `v=spf1` or named `_dmarc`
alone. They control email delivery.

---

## Note on the other domain (marshallhbrown.com)

`marshallhbrown.com` is **not** managed at GoDaddy — its nameservers point to
Cloudflare, and it currently serves the practice's existing website (hosted by
PBHS) plus live email through EmailArray. **No changes should be made to it as
part of this setup.** Migrating that domain is a separate decision; doing it
carelessly would take the current site and the practice's email offline.
