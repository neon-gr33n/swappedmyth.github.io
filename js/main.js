// Main site JS: manage soul icon for active nav links and watch for dynamic changes
(function(){
  'use strict';

  // Resolve a usable path for the soul icon image. Try several candidates so
  // the script works both from root and subfolders and when opened via file://.
  let soulSrc = null;
  const _soulCandidates = [
    'assets/img/smallheart_bigdreams.png',
    './assets/img/smallheart_bigdreams.png',
    '../assets/img/smallheart_bigdreams.png',
    '/assets/img/smallheart_bigdreams.png'
  ];

  function resolveSoulSrc(cb){
    if(soulSrc){ if(cb) cb(soulSrc); return; }
    let idx = 0;
    function tryNext(){
      if(idx >= _soulCandidates.length){
        // fallback to first candidate even if not loaded (so something shows)
        soulSrc = _soulCandidates[0];
        if(cb) cb(soulSrc);
        return;
      }
      const candidate = _soulCandidates[idx++];
      const img = new Image();
      img.onload = function(){ soulSrc = candidate; if(cb) cb(soulSrc); };
      img.onerror = function(){ tryNext(); };
      img.src = candidate;
    }
    tryNext();
  }

  function ensureSoulForLink(a){
    if(!a) return;
    if(!a.querySelector('.soul-icon')){
      const img = document.createElement('img');
      img.src = soulSrc || _soulCandidates[0];
      img.alt = '';
      img.className = 'soul-icon';
      a.prepend(img);
    }
  }

  function scanActiveLinks(){
    try{
      const activeLinks = document.querySelectorAll('.navbar-nav .nav-link.active');
      activeLinks.forEach(ensureSoulForLink);
    }catch(e){ console.warn('scanActiveLinks', e); }
  }

  // Add .active to the matching nav link based on current pathname (so soul appears)
  function setActiveLinkFromPath(){
    try{
      const cur = window.location.pathname || '/';
      function norm(p){
        if(!p) return '/';
        // treat index.html as root
        if(p.endsWith('/index.html')) return '/';
        // remove trailing slash except for root
        if(p.length>1 && p.endsWith('/')) return p.slice(0,-1);
        return p;
      }
      const curNorm = norm(cur);
      const links = document.querySelectorAll('.navbar-nav .nav-link');
      links.forEach(a => {
        try{
          const href = a.getAttribute('href') || a.href || '';
          // resolve relative hrefs against location
          const url = new URL(href, window.location.origin);
          const hrefNorm = norm(url.pathname);
          if(hrefNorm === curNorm){
            a.classList.add('active');
            ensureSoulForLink(a);
          }
        }catch(e){ /* ignore malformed URLs */ }
      });
    }catch(e){ console.warn('setActiveLinkFromPath', e); }
  }

  // Observe nav for dynamic additions of 'active' class
  function observeNav(){
    try{
      const nav = document.querySelector('.navbar-nav');
      if(!nav) return;
      const mo = new MutationObserver(muts => {
        muts.forEach(m => {
          if(m.type === 'attributes' && m.attributeName === 'class'){
            const target = m.target;
            if(target.classList && target.classList.contains('nav-link') && target.classList.contains('active')){
              ensureSoulForLink(target);
            }
          } else if(m.type === 'childList'){
            // new nodes added: check them
            m.addedNodes.forEach(node => {
              if(node.querySelectorAll){
                node.querySelectorAll('.nav-link.active').forEach(ensureSoulForLink);
              }
            });
          }
        });
      });
      mo.observe(nav, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }catch(e){ console.warn('observeNav', e); }
  }

  function initAll(){
    setActiveLinkFromPath();
    scanActiveLinks();
    observeNav();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ resolveSoulSrc(initAll); });
  } else {
    resolveSoulSrc(initAll);
  }

})();
