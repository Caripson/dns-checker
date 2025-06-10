// Listen for clicks on the "Check my resolver" button
document.getElementById("checkBtn").addEventListener("click", () => {
  // Element where status messages are shown
  const statusDiv = document.getElementById("status");
  statusDiv.className = "text-large";
  statusDiv.textContent = "Checking..."; // initial status

  // Query a special TXT record that returns the resolver IP
  fetch('https://cloudflare-dns.com/dns-query?name=resolver.dnscrypt.info&type=TXT', {
    headers: { 'Accept': 'application/dns-json' }
  })
    .then(response => response.json())
    .then(data => {
      let dns = "Unknown";
      if (data.Answer && data.Answer.length > 0) {
        const txt = data.Answer[0].data.replace(/"/g, "");
        const match = txt.match(/Resolver IP:\s*([^\s]+)/i);
        if (match) {
          dns = match[1];
        }
      }
      // List of resolvers considered safe - edit to match your own
      const trustedResolvers = [
        '192.178.94.20',
        '192.178.94.24',
        '2a00:1450:4025:3c03::127',
        '2a00:1450:4025:3c03::124',
        '2a00:1450:4025:3c05::12a',
        '104.23.222.24',
        '162.158.180.203'
      ];

      // Reset any previous status classes
      statusDiv.classList.remove('text-success', 'text-danger', 'text-warning');

      // Display the resolver and whether it is trusted
      if (trustedResolvers.includes(dns)) {
        statusDiv.textContent = `Resolver: ${dns} - \u2705 Trusted`;
        statusDiv.classList.add('text-success');
      } else {
        statusDiv.textContent = `Resolver: ${dns} - \u274C Untrusted`;
        statusDiv.classList.add('text-danger');
      }
    })
    .catch(err => {
      // Handle network or parsing errors
      statusDiv.textContent = "An error occurred while checking.";
      statusDiv.classList.remove('text-success', 'text-danger', 'text-warning');
      statusDiv.classList.add('text-warning');
    });
});
