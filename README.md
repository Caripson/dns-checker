# DNS Checker

This project provides a small JavaScript based web service for resolving DNS
records directly in the browser using DNS-over-HTTPS. In addition to checking
which resolver your browser uses, you can query common record types for any
domain. The code is modular and contains more than twenty helper functions to
keep the logic readable and easy to expand.

## Usage

1. Open `index.html` locally or host the files with any static web server
   (for example GitHub Pages).
2. Enter a domain, choose the desired record type and click **Check DNS**.
3. Optionally click **Check my resolver** to verify which DNS resolver is in
   use. Trusted resolvers are highlighted in green.

### Configure trusted resolvers

Edit the `getTrustedResolvers` function in `script.js` to list resolver
addresses you consider secure:

```javascript
function getTrustedResolvers() {
  return ['1.1.1.1', '1.0.0.1'];
}
```

### Clearing the cache

DNS lookups are cached in the browser's local storage. Call `clearCache()` from
the developer console if you need to remove the cached results.
