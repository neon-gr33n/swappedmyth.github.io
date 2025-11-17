// Main site JS: manage soul icon for active nav links and watch for dynamic changes
(function(){
  'use strict';

  const soulSrc = '/assets/img/smallheart_bigdreams.png';

  function ensureSoulForLink(a){
    if(!a) return;
    if(!a.querySelector('.soul-icon')){
      const img = document.createElement('img');
      img.src = soulSrc;
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

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ scanActiveLinks(); observeNav(); });
  } else {
    scanActiveLinks(); observeNav();
  }

})();
