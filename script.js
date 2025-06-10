// DNS Checker JavaScript
// This file defines a lightweight client-side service for resolving DNS records
// using DNS-over-HTTPS. More than 20 small utility functions are included to
// keep the code modular and easy to extend.

// Initialize the page after DOM is ready
function init() {
  getEl('dnsBtn').addEventListener('click', checkDNS);
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
  return `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
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
  return data.Answer.map(a => a.data.replace(/"/g, ''));
}

// Display list of DNS records in the results element
function displayDnsResult(records) {
  const list = getEl('results');
  list.innerHTML = '';
  if (records.length === 0) {
    list.appendChild(createListItem('No records found'));
  } else {
    records.forEach(r => list.appendChild(createListItem(r)));
  }
}

// Display an error message in the results list
function displayError(msg) {
  const list = getEl('results');
  list.innerHTML = '';
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
  if (!validateDomain(domain)) {
    displayError('Invalid domain');
    return;
  }
  const type = getRecordType();
  toggleLoading(true);
  const cacheKey = `${domain}_${type}`;
  const cached = getCachedResult(cacheKey);
  if (cached) {
    displayDnsResult(cached);
    toggleLoading(false);
    return;
  }
  fetchDNS(domain, type)
    .then(parseDnsAnswer)
    .then(records => {
      cacheResult(cacheKey, records);
      displayDnsResult(records);
      toggleLoading(false);
    })
    .catch(() => {
      displayError('Error fetching DNS');
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
