/* overlay-common.js
 * Small helper for overlays to lazy-load scripts and detect WebGL support.
 */
(function (global) {
  // Simple request dedupe map
  var _loadPromises = Object.create(null);

  function loadScript(url) {
    if (_loadPromises[url]) return _loadPromises[url];
    var p = new Promise(function (resolve, reject) {
      var s = document.createElement('script'); s.src = url; s.async = true;
      s.onload = function () { resolve(); };
      s.onerror = function (e) { reject(e); };
      document.head.appendChild(s);
    });
    _loadPromises[url] = p;
    return p;
  }

  function supportsWebGL() {
    try {
      var c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) { return false; }
  }

  // Prefer a local vendor three file if present, otherwise fall back to CDN
  function loadThree() {
    if (window.THREE) return Promise.resolve();
    var local = 'vendor/three.min.js';
    // Try loading local file first
    return loadScript(local).catch(function () {
      // Fallback to CDN
      var cdn = 'https://unpkg.com/three@0.158.0/build/three.min.js';
      return loadScript(cdn);
    });
  }

  function getQueryParams() {
    var params = {};
    var search = window.location.search.substring(1);
    if (!search) return params;
    var pairs = search.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return params;
  }

  function loadBackgroundTexture() {
    var params = getQueryParams();
    if (!params.bg) return Promise.resolve(null);

    // Ensure THREE is loaded
    return loadThree().then(function () {
      return new Promise(function (resolve) {
        // Resolve bg path relative to the overlays directory (one level up)
        var bgPath = params.bg;
        if (bgPath && !bgPath.startsWith('/') && !bgPath.startsWith('http')) {
          bgPath = '../' + bgPath;
        }

        new THREE.TextureLoader().load(bgPath, function (tex) {
          resolve(tex);
        }, undefined, function () {
          resolve(null);
        });
      });
    });
  }

  global.OverlayCommon = global.OverlayCommon || {
    loadScript: loadScript,
    supportsWebGL: supportsWebGL,
    loadThree: loadThree,
    getQueryParams: getQueryParams,
    loadBackgroundTexture: loadBackgroundTexture
  };
})(window);
