// Listen for clicks on the "Check my resolver" button
document.getElementById("checkBtn").addEventListener("click", () => {
  // Element where status messages are shown
  const statusDiv = document.getElementById("status");
  statusDiv.className = "text-large";
  statusDiv.textContent = "Checking..."; // initial status

  // Query Cloudflare's trace endpoint to identify the resolver
  fetch('https://1.1.1.1/cdn-cgi/trace')
    .then(response => response.text())
    .then(data => {
      // Convert the response into a key/value object
      const parsed = Object.fromEntries(
        data.trim().split('\n').map(line => line.split('='))
      );

      const dns = parsed.dns || "Unknown";

      // List of resolvers considered safe - edit to match your own
      //const trustedResolvers = ['1.2.3.4', 'dns.safesurf.se'];
      const trustedResolvers = [
    '192.178.94.20',
    '192.178.94.24',
    '2a00:1450:4025:3c03::127',
    '2a00:1450:4025:3c03::124',
    '2a00:1450:4025:3c05::12a'
  ];
  

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
