# DNS Checker

This project provides a small JavaScript based web service for resolving DNS
records directly in the browser using DNS-over-HTTPS. You can query common
record types for any domain. The JavaScript code is modular, utilizing multiple
helper functions to keep the logic readable and easy to expand.

## Usage

1. Open `index.html` in your web browser (you can do this by double-clicking the file or by serving it from a web server).
2. In the input field, type the domain name you want to check (e.g., `example.com`).
3. Select the desired DNS record type from the dropdown menu (e.g., A, MX, TXT).
4. Click the "Check DNS" button.
5. The results will be displayed below the button.

The page also includes a section titled 'Hur kontrollerar jag vilken DNS-resolver jag använder?' which provides guidance on how you can manually check the DNS resolver settings on your device or use external online services for this purpose.

## Features

- **Query DNS Records:** Supports checking for A, AAAA, MX, TXT, CNAME, NS, SOA, and SRV records.
- **DNS-over-HTTPS:** Uses Cloudflare's DNS-over-HTTPS service (`https://cloudflare-dns.com/dns-query`) to perform lookups.
- **Client-Side Operation:** Runs entirely in the web browser; no server-side components needed.
- **Result Caching:** Caches successful DNS lookups in the browser's local storage to speed up repeated queries for the same domain and record type.
- **Resolver Guidance:** Provides information to help users identify their own DNS resolver, as direct detection by the tool is not possible due to browser security.
- **Simple Interface:** Easy-to-use interface for entering a domain and selecting a record type.

### Cache Management

DNS lookups are cached in the browser's local storage. Call `clearCache()` from
the developer console if you need to remove the cached results.

## Technologies Used

- **HTML:** For the basic structure of the web page.
- **CSS:** For styling the user interface.
- **JavaScript:** For the DNS lookup logic, DOM manipulation, and interaction.
