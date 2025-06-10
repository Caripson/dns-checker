# DNS Resolver Check

This simple page identifies which DNS resolver your browser is using. When you click **Check my resolver** the script performs a DNS-over-HTTPS request to `resolver.dnscrypt.info` and extracts the resolver address from the TXT record returned. The address is then compared against the trusted list in `script.js`.

## Usage

1. Open `index.html` locally or host the files using any static web server (for example GitHub Pages).
2. Click **Check my resolver** and the detected resolver will be displayed.

### Configure trusted resolvers

Edit `trustedResolvers` in `script.js` to list the resolver addresses you consider secure:

```javascript
const trustedResolvers = ['1.1.1.1', '1.0.0.1'];
```
