# DNS Resolver Check

Detta är en enkel HTML/JS-applikation som låter en användare kontrollera vilken DNS-resolver som används. Om resolvern matchar en "säker lista", visas ett meddelande om att användaren är skyddad.

## Så fungerar det

- När användaren klickar på knappen görs ett anrop till Cloudflares API (`1.1.1.1/cdn-cgi/trace`)
- DNS-resolvern extraheras från svaret
- Om IP-adressen matchar en av de betrodda resolvrarna visas `Du är skyddad`, annars visas `Du är inte skyddad`.

## Användning

1. Ladda upp filerna till ett GitHub repo
2. Aktivera GitHub Pages under repo-inställningarna
3. Öppna din sida: `https://<ditt-användarnamn>.github.io/dns-checker/`

