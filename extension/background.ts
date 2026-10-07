// Manifest V3 Background Service Worker
declare const chrome: any;

chrome.runtime.onInstalled.addListener(() => {
  console.log('[AEGIS] Extension initialized successfully.');
  chrome.storage.local.set({
    autoScan: true,
    permissions: { 'amazon.in': true, 'flipkart.com': true }
  });
});

chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: (res: any) => void) => {
  if (request.type === 'CHECK_PERMISSION') {
    const domain = request.domain;
    chrome.storage.local.get(['permissions'], (result: any) => {
      const allowed = result.permissions && result.permissions[domain];
      sendResponse({ allowed: !!allowed });
    });
    return true;
  }

  if (request.type === 'EXECUTE_ANALYSIS') {
    // Send to backend REST API or fallback to local risk engine calculation
    fetch('http://localhost:3000/api/v1/analyze/product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.product),
    })
      .then((res) => res.json())
      .then((data) => sendResponse({ success: true, result: data }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true; // async callback
  }
});
