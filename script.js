// DNS Checker JavaScript
// This file defines a lightweight client-side service for resolving DNS records
// using DNS-over-HTTPS. More than 20 small utility functions are included to
// keep the code modular and easy to extend.

const MAX_HISTORY_ITEMS = 20;
const HISTORY_STORAGE_KEY = 'dnsQueryHistory';

const resolvers = [
  { name: 'Cloudflare', url: 'https://cloudflare-dns.com/dns-query' },
  { name: 'Google', url: 'https://dns.google/resolve' },
  { name: 'Quad9', url: 'https://dns.quad9.net/dns-query' }
];

// Initialize the page after DOM is ready
function init() {
  getEl('dnsBtn').addEventListener('click', checkDNS);

  const resolverSelect = getEl('resolverSelect');
  resolvers.forEach(resolver => {
    const option = document.createElement('option');
    option.value = resolver.url;
    option.textContent = resolver.name;
    resolverSelect.appendChild(option);
  });
  // Set Cloudflare as default
  resolverSelect.value = 'https://cloudflare-dns.com/dns-query';

  getEl('blacklistBtn').addEventListener('click', handleBlacklistCheck);
  getEl('exportBtn').addEventListener('click', handleExportResults);
  getEl('clearHistoryBtn').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear the query history?")) {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      renderHistory();
    }
  });

  loadHistory(); // Load and display history on page load
}

document.addEventListener('DOMContentLoaded', init);

// Helper: fetch DOM element by id
function getEl(id) {
  return document.getElementById(id);
}

// Helper: set element text
function setText(el, text) {
  el.textContent = text;
}

// Build URL for the DNS-over-HTTPS request
function buildDnsQueryUrl(domain, type) {
  const resolverSelect = getEl('resolverSelect');
  const resolverUrl = resolverSelect.value;
  return `${resolverUrl}?name=${encodeURIComponent(domain)}&type=${type}`;
}

// Fetch DNS records for a domain/type
function fetchDNS(domain, type) {
  const url = buildDnsQueryUrl(domain, type);
  return fetch(url, { headers: { 'Accept': 'application/dns-json' } })
    .then(res => res.json());
}

// Parse the answer section into a simple array of strings
function parseDnsAnswer(data) {
  if (!data.Answer) return [];
  return data.Answer.map(a => ({
    data: a.data.replace(/"/g, ''),
    ad: typeof a.AD === 'boolean' ? a.AD : null // Store AD flag, null if not present
  }));
}

// Display list of DNS records in the results element
function displayDnsResult(records, duration, recordType) {
  const list = getEl('results');
  list.innerHTML = '';
  if (duration !== undefined) {
    list.appendChild(createListItem(`Query time: ${typeof duration === 'number' ? duration + ' ms' : duration}`));
  }
  if (records.length === 0) {
    list.appendChild(createListItem('No records found'));
  } else {
    records.forEach(record => {
      let baseDisplayText = record.data;
      if (record.ad === true) {
        baseDisplayText += ' (AD ✓)';
      } else if (record.ad === false) {
        baseDisplayText += ' (AD ✗)';
      }
      // If record.ad is null, no AD status is appended for now

      const listItem = createListItem(baseDisplayText);
      list.appendChild(listItem);

      if ((recordType === 'A' || recordType === 'AAAA') && (isIPv4(record.data) || isIPv6(record.data))) {
        const originalText = listItem.textContent; // Save text before adding loading message
        listItem.textContent += ' (loading GeoIP...)'; // Append loading indicator (plain text)

        fetchGeoIpInfo(record.data)
          .then(geoData => {
            if (geoData.status === 'success') {
              listItem.textContent = `${originalText} - ${geoData.country}, ${geoData.city}, ${geoData.isp}`;
            } else {
              listItem.textContent = `${originalText} - GeoIP N/A (${geoData.message || 'Unknown error'})`;
            }
          })
          .catch(error => {
            listItem.textContent = `${originalText} - GeoIP Fetch Error`;
            console.error('GeoIP Fetch Error:', error);
          });
      }
    });
  }
}

// Render query history from localStorage
function renderHistory() {
  const historyListEl = getEl('historyList');
  historyListEl.innerHTML = ''; // Clear current list
  const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');

  if (history.length === 0) {
    historyListEl.appendChild(createListItem("No history yet."));
    return;
  }

  history.forEach((item) => { // Removed 'index' as it's not used
    const listItem = createListItem(
      `${new Date(item.timestamp).toLocaleString()}: ${item.domain} (${item.type}) via ${item.resolverName}`
    );
    listItem.style.marginBottom = '5px';

    const rerunBtn = document.createElement('button');
    rerunBtn.textContent = 'Re-run';
    rerunBtn.style.marginLeft = '10px';
    rerunBtn.className = 'btn'; // Using 'btn' class, can add 'btn-small' if defined in CSS
    rerunBtn.onclick = () => {
      getEl('domainInput').value = item.domain;
      getEl('typeSelect').value = item.type;
      const resolverSelectEl = getEl('resolverSelect');
      for (let i = 0; i < resolverSelectEl.options.length; i++) {
        if (resolverSelectEl.options[i].text === item.resolverName) {
          resolverSelectEl.value = resolverSelectEl.options[i].value;
          break;
        }
      }
      checkDNS();
    };
    listItem.appendChild(rerunBtn);
    historyListEl.appendChild(listItem);
  });
}

// Load and render history (called on page load)
function loadHistory() {
  renderHistory();
}

// Save a query item to history
function saveHistory(queryItem) {
  let history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || '[]');
  // Optional: Prevent duplicate consecutive entries
  // if (history.length > 0 && history[0].domain === queryItem.domain && history[0].type === queryItem.type && history[0].resolverName === queryItem.resolverName) {
  //   return;
  // }
  history.unshift(queryItem);
  if (history.length > MAX_HISTORY_ITEMS) {
    history = history.slice(0, MAX_HISTORY_ITEMS);
  }
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  renderHistory();
}

// Display an error message in the results list
function displayError(msg, duration) {
  const list = getEl('results');
  list.innerHTML = '';
  if (duration !== undefined) {
    list.appendChild(createListItem(`Query time: ${typeof duration === 'number' ? duration + ' ms' : duration}`));
  }
  list.appendChild(createListItem(msg));
}

// Retrieve DNS results from cache if available
function getCachedResult(key) {
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : null;
}

// Store DNS results in cache
function cacheResult(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Clear the entire cache
function clearCache() {
  localStorage.clear();
}

// Validate a domain name using a simple regex
function validateDomain(domain) {
  return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain);
}

// Return selected DNS record type from dropdown
function getRecordType() {
  return getEl('typeSelect').value;
}

// Create an li element with text
function createListItem(text) {
  const li = document.createElement('li');
  li.textContent = text;
  return li;
}

// Toggle a loading state on a button or element
function toggleLoading(show, el) {
  const target = el || getEl('dnsBtn');
  if (show) target.classList.add('loading');
  else target.classList.remove('loading');
}

// Check DNS for the given input
function checkDNS() {
  const domain = getEl('domainInput').value.trim();
  const type = getRecordType();
  let lookupDomain = domain;

  // Validate input based on type
  if (type === 'PTR') {
    if (!isIPv4(domain) && !isIPv6(domain)) {
      displayError('Invalid IP address for PTR lookup');
      // toggleLoading(false); // Not started yet
      return;
    }
    const ptrDomain = formatIpForPtr(domain);
    if (!ptrDomain) {
      displayError('Failed to format IP for PTR lookup');
      // toggleLoading(false); // Not started yet
      return;
    }
    lookupDomain = ptrDomain;
  } else {
    // Existing domain validation for non-PTR types
    if (!validateDomain(domain)) {
      displayError('Invalid domain');
      // toggleLoading(false); // Not started yet
      return;
    }
  }

  // Save history item after validation passes
  const resolverEl = getEl('resolverSelect'); // Ensure resolverEl is defined before use
  const currentResolverName = resolverEl.options[resolverEl.selectedIndex].text;
  const historyItem = {
    domain: domain, // User's original input
    type: type,
    resolverName: currentResolverName,
    timestamp: new Date().toISOString()
  };
  saveHistory(historyItem);

  toggleLoading(true); // Start loading indicator
  // const resolverEl = getEl('resolverSelect'); // Already defined above
  const selectedResolverName = currentResolverName; // Use already fetched name
  const cacheKey = `${selectedResolverName}_${domain}_${type}`;
  const cached = getCachedResult(cacheKey);

  if (cached) {
    displayDnsResult(cached, "N/A (cached)", type);
    toggleLoading(false);
    return;
  }

  const startTime = performance.now();
  fetchDNS(lookupDomain, type)
    .then(parseDnsAnswer)
    .then(records => {
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      cacheResult(cacheKey, records);
      displayDnsResult(records, duration, type);
      toggleLoading(false);
    })
    .catch(() => {
      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);
      displayError('Error fetching DNS', duration);
      toggleLoading(false);
    });
}

// Format IPv4/IPv6 address (placeholder for future logic)
function formatAddress(addr) {
  return addr;
}

// Check if a string is IPv4
function isIPv4(addr) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(addr);
}

// Check if a string is IPv6
function isIPv6(addr) {
  return /:/.test(addr);
}

// Fetch GeoIP information for an IP address
async function fetchGeoIpInfo(ipAddress) {
  const url = `https://ip-api.com/json/${ipAddress}?fields=status,message,country,city,isp`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // For ip-api, even with errors, it often returns 200 OK with status="fail" in JSON.
      // This handles network errors or truly non-OK HTTP statuses.
      return { status: 'fail', message: `Network error: ${response.statusText}` };
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch GeoIP Error:', error);
    return { status: 'fail', message: 'Request failed' };
  }
}

// Format IP address for PTR lookup
function formatIpForPtr(ip) {
  if (isIPv4(ip)) {
    return ip.split('.').reverse().join('.') + '.in-addr.arpa';
  } else if (isIPv6(ip)) {
    let normalizedIp = ip;
    // Attempt to expand '::'
    if (ip.includes('::')) {
      const parts = ip.split('::');
      let hextetsBefore = parts[0] ? parts[0].split(':').filter(h => h !== '') : [];
      let hextetsAfter = parts[1] ? parts[1].split(':').filter(h => h !== '') : [];

      // Handle edge cases like "::" or "1::" or "::1"
      if (parts[0] === "" && parts.length > 1 && parts[1] === "") { // "::"
          hextetsBefore = []; // explicitly empty
          hextetsAfter = []; // explicitly empty
      } else if (parts.length > 1 && parts[0] === "") { // "::..."
          hextetsBefore = [];
      } else if (parts.length > 1 && parts[1] === "") { // "...::"
          hextetsAfter = [];
      }

      const numMissingHextets = 8 - (hextetsBefore.length + hextetsAfter.length);
      const zeros = Array(numMissingHextets > 0 ? numMissingHextets : 0).fill('0000');

      let combinedHextets = [];
      if (parts.length === 1) { // No "::"
        combinedHextets = ip.split(':');
      } else {
        combinedHextets = [...hextetsBefore, ...zeros, ...hextetsAfter];
      }
      normalizedIp = combinedHextets.join(':');
    }

    const allNibbles = normalizedIp.split(':').map(hextet => {
      let paddedHextet = hextet;
      while (paddedHextet.length < 4 && paddedHextet.length > 0) { // ensure not to overpad empty strings from bad split
        paddedHextet = '0' + paddedHextet;
      }
      if (paddedHextet.length === 0 && normalizedIp.split(':').length < 8) { // Handle cases where split might leave empty strings for valid 0 hextets
          paddedHextet = '0000';
      }
      return paddedHextet;
    }).join('');

    if (allNibbles.length !== 32) {
      // console.error("IPv6 normalization failed to produce 32 hex characters:", allNibbles, "from IP:", ip, "normalized to:", normalizedIp);
      return null; // Failed to normalize correctly
    }

    return allNibbles.split('').reverse().join('.') + '.ip6.arpa';
  }
  return null; // Not a valid IP for PTR
}

// Reverse IP for DNSBL lookup (currently only IPv4)
function reverseIpForDnsbl(ip) {
  if (isIPv4(ip)) {
    return ip.split('.').reverse().join('.');
  }
  return null;
}

// Check IP on a given DNSBL
async function checkIpOnDnsbl(ipAddress, dnsblHost) {
  const reversedIp = reverseIpForDnsbl(ipAddress);
  if (!reversedIp) {
    return { status: 'error', message: 'Invalid or unsupported IP for DNSBL (must be IPv4)' };
  }
  const queryDomain = `${reversedIp}.${dnsblHost}`;
  // buildDnsQueryUrl uses the currently selected resolver by reading it from the dropdown
  const url = buildDnsQueryUrl(queryDomain, 'A');

  try {
    const response = await fetch(url, { headers: { 'Accept': 'application/dns-json' } });
    if (!response.ok) {
      return { status: 'error', message: `DNSBL DoH query failed for ${queryDomain} - HTTP ${response.status}` };
    }
    const data = await response.json();
    const records = parseDnsAnswer(data); // Use existing parseDnsAnswer

    if (records.length > 0) {
      // For SORBS, specific 127.0.0.X IPs indicate type of listing.
      return { status: 'listed', ip: ipAddress, dnsbl: dnsblHost, details: records.map(r => r.data).join(', ') };
    } else {
      // This covers NXDOMAIN (empty Answer section) or other cases where no relevant records are found
      return { status: 'notlisted', ip: ipAddress, dnsbl: dnsblHost };
    }
  } catch (error) { // Network errors or JSON parsing errors
    // console.error(`DNSBL check error for ${queryDomain}:`, error);
    return { status: 'error', message: `Network or parsing error checking ${dnsblHost}: ${error.message}` };
  }
}

// Handle the blacklist check button click
async function handleBlacklistCheck() {
  const domainInputEl = getEl('domainInput');
  const ipToCheck = domainInputEl.value.trim();
  const blacklistResultsEl = getEl('blacklistResults');
  blacklistResultsEl.innerHTML = ''; // Clear previous results

  if (!isIPv4(ipToCheck)) {
    blacklistResultsEl.appendChild(createListItem('Please enter a valid IPv4 address to check.'));
    return;
  }

  const blacklistButton = getEl('blacklistBtn');
  toggleLoading(true, blacklistButton);

  const dnsblToTest = 'dnsbl.sorbs.net';
  const result = await checkIpOnDnsbl(ipToCheck, dnsblToTest);

  let message = `${ipToCheck} on ${dnsblToTest}: `;
  if (result.status === 'listed') {
    message += `LISTED (Details: ${result.details})`;
  } else if (result.status === 'notlisted') {
    message += 'Not Listed';
  } else { // error
    message += `Error - ${result.message}`;
  }
  blacklistResultsEl.appendChild(createListItem(message));

  toggleLoading(false, blacklistButton);
}

// Format current DNS results for export
function formatResultsForExport() {
  const domain = getEl('domainInput').value.trim();
  const recordTypeEl = getEl('typeSelect');
  const recordType = recordTypeEl.value; // Get value, not the element itself
  const resolverEl = getEl('resolverSelect');
  const resolverName = resolverEl.options[resolverEl.selectedIndex].text;
  const resultsList = getEl('results');
  const items = resultsList.getElementsByTagName('li');

  // Check if there's anything to export (e.g. results are present, or at least a domain was typed)
  // If items.length is 0 but domain is filled, we might still want to export the query parameters.
  // The condition `(items.length === 0 && !domain)` means "nothing to export if no results AND no domain"
  // Let's change to: if no domain and no items, then nothing. Otherwise, export what we have.
  if (!domain && items.length === 0) {
    return null; // Nothing to export
  }

  let outputText = `DNS Query Export:
`;
  outputText += `------------------------------------
`;
  outputText += `Domain/IP: ${domain || 'N/A'}
`;
  outputText += `Record Type: ${recordType || 'N/A'}
`;
  outputText += `Resolver: ${resolverName || 'N/A'}
`;
  outputText += `------------------------------------

`;

  if (items.length === 0) {
    outputText += "No results found for this query.
";
  } else {
    for (let i = 0; i < items.length; i++) {
      outputText += items[i].textContent + '\n';
    }
  }
  return outputText;
}

// Trigger a file download
function triggerDownload(textData, filename) {
  if (!textData) return;

  const blob = new Blob([textData], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Handle the export results button click
function handleExportResults() {
  const textData = formatResultsForExport();
  if (textData) {
    // Sanitize domain for filename: replace non-alphanumeric (plus ._ -) with underscore
    const domain = getEl('domainInput').value.trim().replace(/[^a-z0-9_.-]/gi, '_') || 'export';
    const recordType = getEl('typeSelect').value || 'data';
    const filename = `dns_results_${domain}_${recordType}.txt`;
    triggerDownload(textData, filename);
  } else {
    // console.log("No data to export."); // Optional: feedback to user
  }
}
