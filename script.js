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
      statusDiv.textContent += ` (Resolver: ${dns})`;


      // List of resolvers considered safe - edit to match your own
      //const trustedResolvers = ['1.2.3.4', 'dns.safesurf.se'];
      const trustedResolvers = ['192.178.94.20','192.178.94.24','2a00:1450:4025:3c03::127','2a00:1450:4025:3c03::124','2a00:1450:4025:3c05::12a'];
  

      // Display message based on whether the resolver is trusted
      // Reset any previous status classes
      statusDiv.classList.remove('text-success', 'text-danger', 'text-warning');

      if (trustedResolvers.includes(dns)) {
        statusDiv.textContent = `✅ You are protected (Resolver: ${dns})`;
        statusDiv.classList.add('text-success');
      } else {
        statusDiv.textContent = `⚠️ You are not protected (Resolver: ${dns})`;
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
