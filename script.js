document.getElementById("checkBtn").addEventListener("click", () => {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = "Checking...";

  fetch('https://1.1.1.1/cdn-cgi/trace')
    .then(response => response.text())
    .then(data => {
      const parsed = Object.fromEntries(
        data.trim().split('\n').map(line => line.split('='))
      );
      const dns = parsed.dns || "Unknown";

      const trustedResolvers = ['1.2.3.4', 'dns.safesurf.se']; // Ändra till dina

      if (trustedResolvers.includes(dns)) {
        statusDiv.textContent = `✅ Du är skyddad (Resolver: ${dns})`;
        statusDiv.style.color = 'green';
      } else {
        statusDiv.textContent = `⚠️ Du är inte skyddad (Resolver: ${dns})`;
        statusDiv.style.color = 'red';
      }
    })
    .catch(err => {
      statusDiv.textContent = "Ett fel inträffade vid kontroll.";
      statusDiv.style.color = 'orange';
    });
});
