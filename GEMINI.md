# LiveWindow Developer Documentation

## Overlay System Architecture

Overlays in LiveWindow are independent HTML/CSS/JS components served from the `/overlays` directory and rendered within `iframes` over the main display content.

### 1. Implementation
Each overlay is a self-contained `.html` file.
- **Location:** `/overlays/`
- **Standard Stack:** Vanilla HTML/CSS, Three.js (for WebGL effects), and `overlay-common.js`.
- **Visuals:** Should have a transparent background and `pointer-events: none` on the body/canvas to prevent interference with the main UI.

### 2. The Background Texture Interface
Many overlays (especially distortions like `distortion-sway.html` or `distortion-water-ripples.html`) need to manipulate the underlying background image.
- **Passing Data:** The `MainController.js` automatically appends the current background path as a query parameter: `?bg=images/example.png`.
- **Loading Data:** Overlays should use `OverlayCommon.loadBackgroundTexture()` from `overlay-common.js`. This helper:
    1. Parses the `bg` query parameter.
    2. Loads the image as a `THREE.Texture`.
    3. Handles path resolution relative to the overlay file.

### 3. Overlay Registration
To make a new overlay available in the Control Panel, it must be registered in:
- **File:** `js/services/displayService.js`
- **Location:** The `overlays` array inside the service definition.
- **Schema:**
  ```javascript
  { 
    name: 'Display Name', 
    path: 'overlays/filename.html', 
    emoji: '⛵', 
    description: 'Brief explanation of the effect' 
  }
  ```

### 4. Layering and Z-Index
- **Main Content (Image/Animation):** Base layer.
- **Overlay Layer:** `z-index: 10`.
- **Window Pane Layer:** `z-index: 15` (defined in `overlays/window-pane.html`).

### 5. Standard Three.js Setup
Most dynamic overlays use an `OrthographicCamera` with a `PlaneGeometry(2, 2)` to cover the full viewport. For effects involving movement or rotation (like `distortion-sway.html`), the geometry is often scaled slightly (e.g., `2.2, 2.2`) to avoid showing empty edges during the animation.

## Performance Optimization

### Thumbnails
To improve loading times in the Edit Mode, the system uses thumbnails for theme previews.
- **Location:** `images/thumbnails/`
- **Automation:** Thumbnails are automatically generated during the build process via `npm run build` or can be run manually via `npm run thumbnails`.
- **Script:** The logic resides in `./scripts/generate-thumbnails.sh`, which checks for missing thumbnails and generates them using `sips` (macOS) or `ImageMagick` (Linux).
- **Usage:** `DisplayService.js` automatically derives thumbnail paths by replacing `images/` with `images/thumbnails/`. The `edit.html` view uses `theme.leftThumb` and `theme.rightThumb` for previews while still using the full-resolution `theme.leftPath` and `theme.rightPath` for the actual display.
