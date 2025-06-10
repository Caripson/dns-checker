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
      const trustedResolvers = ['1.2.3.4', 'dns.safesurf.se'];

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
