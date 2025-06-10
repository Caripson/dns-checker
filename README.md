# DNS Resolver Check

This project contains a small HTML and JavaScript application for verifying which DNS resolver your browser is using. If the resolver matches one of your trusted addresses the page will say that you are protected.

## How it works

- When the user clicks **Check my resolver** the script performs a DNS-over-HTTPS query to `resolver.dnscrypt.info` via Cloudflare.
- The DNS resolver address is extracted from the TXT record returned.
- The resolver is compared against a list of trusted resolvers defined in `script.js`.
- If it matches, `You are protected` is shown; otherwise `You are not protected`.

## Getting started

1. Upload the files in this repository to your own GitHub repository.
2. Enable **GitHub Pages** in the repository settings.
3. Navigate to `https://caripson.github.io/dns-checker/` (or the URL of your fork) to load the page.

## Configuring your trusted resolvers

Open `script.js` and modify the `trustedResolvers` array. Add every resolver IP address or hostname that you want to treat as safe.

```javascript
const trustedResolvers = ['1.1.1.1', '1.0.0.1']; // Add your resolvers here
```

## Running the optional local test server

For the GitHub Pages version the browser queries `resolver.dnscrypt.info` via
Cloudflare to reveal the resolver IP. If you want to perform the more extensive
`bash.ws` leak test locally you can run the included Node.js proxy:

```bash
npm install
node server.js
```

Open `http://localhost:3000` and click **Check my resolver**. The page will show
the DNS servers detected by `bash.ws`.

## Design changes

The layout is defined in `index.html` and styled in `style.css`. The CSS file includes comments explaining each block so that you can easily adjust fonts, colors or spacing. For example, you could change the background color by editing the `body` rule:

```css
body {
  background: #e0e0e0; /* your color here */
}
```

The code has been documented with inline comments to help you customize the application further.

## Advanced CSS styling

`style.css` now includes a handful of helper classes for easily styling your own
components:

- `btn` – Base button style with hover effect.
- `btn-outline` – Transparent button with an outline.
- `btn-secondary` – Alternate button using a secondary theme color.
- `card` – Panel styling used for wrappers.
- `text-success`, `text-danger`, `text-warning`, `text-muted`, `text-light` – Text colors for different states.
- `text-large` – Slightly larger text size for emphasis.
- `text-left`, `text-center`, `text-right` – Alignment helpers.
- `bg-light`, `bg-primary` – Background utilities.
- `mt-1`, `mt-2` – Margin helpers for vertical spacing.

An example usage can be found in `index.html`:

```html
<div class="container card">
  <h1 class="title">DNS Resolver Check</h1>
  <button id="checkBtn" class="btn">Check my resolver</button>
  <div id="status" class="text-large">Status: Not checked yet.</div>
</div>

<div class="container card bg-light text-center mt-2">
  <h2 class="title">Example Styling</h2>
  <p class="text-muted">Use helper classes to quickly style text and backgrounds.</p>
  <button class="btn-secondary">Secondary Action</button>
</div>

<div class="container card bg-primary text-right mt-2">
  <h2 class="title text-light">Spacing &amp; Outline</h2>
  <p class="text-light">Buttons can be transparent with an outline.</p>
  <button class="btn-outline">Outlined Action</button>
</div>
```

These utility classes make it easier to apply consistent styling across your
page without editing each rule individually.
