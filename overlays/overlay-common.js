/* overlay-common.js
 * Small helper for overlays to lazy-load scripts and detect WebGL support.
 */
(function(global){
  // Simple request dedupe map
  var _loadPromises = Object.create(null);

  function loadScript(url){
    if (_loadPromises[url]) return _loadPromises[url];
    var p = new Promise(function(resolve, reject){
      var s = document.createElement('script'); s.src = url; s.async = true;
      s.onload = function(){ resolve(); };
      s.onerror = function(e){ reject(e); };
      document.head.appendChild(s);
    });
    _loadPromises[url] = p;
    return p;
  }

  function supportsWebGL(){
    try{
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    }catch(e){ return false; }
  }

  // Prefer a local vendor three file if present, otherwise fall back to CDN
  function loadThree(){
    if (window.THREE) return Promise.resolve();
    var local = 'overlays/vendor/three.min.js';
    // Try loading local file first
    return loadScript(local).catch(function(){
      // Fallback to CDN
      var cdn = 'https://unpkg.com/three@0.158.0/build/three.min.js';
      return loadScript(cdn);
    });
  }

  global.OverlayCommon = global.OverlayCommon || { loadScript: loadScript, supportsWebGL: supportsWebGL, loadThree: loadThree };
})(window);
