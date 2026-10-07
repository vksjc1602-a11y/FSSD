// Manifest V3 Content Script
declare const chrome: any;

import { AmazonAdapter } from './adapters/amazon';
import { FlipkartAdapter } from './adapters/flipkart';
import { GenericCommerceAdapter } from './adapters/generic';
import { ISiteAdapter } from './adapters/adapter';

(function initAegis() {
  const currentUrl = window.location.href;
  const adapters: ISiteAdapter[] = [new AmazonAdapter(), new FlipkartAdapter(), new GenericCommerceAdapter()];
  const activeAdapter = adapters.find((a) => a.matchUrl(currentUrl)) || new GenericCommerceAdapter();

  if (!activeAdapter.detectProductPage()) {
    return;
  }

  // Inject Floating AEGIS Widget into DOM
  const rootDiv = document.createElement('div');
  rootDiv.id = 'aegis-root';
  document.body.appendChild(rootDiv);

  // Initial Badge Button
  const badge = document.createElement('button');
  badge.className = 'aegis-badge';
  badge.innerHTML = `<span class="aegis-dot"></span><span>AEGIS SCAN</span>`;
  rootDiv.appendChild(badge);

  badge.addEventListener('click', async () => {
    badge.innerText = 'AEGIS ANALYZING...';
    const product = await activeAdapter.extractProduct();
    if (!product) {
      alert('AEGIS could not identify structured product listing data on this page.');
      badge.innerText = 'AEGIS SCAN';
      return;
    }

    // Call background worker
    chrome.runtime.sendMessage({ type: 'EXECUTE_ANALYSIS', product }, (response: any) => {
      if (response && response.result) {
        const res = response.result;
        badge.innerHTML = `<span class="aegis-dot"></span><span>RISK: ${res.overallScore}/100</span>`;
      } else {
        badge.innerText = 'AEGIS READY';
      }
    });
  });
})();
