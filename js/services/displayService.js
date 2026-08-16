angular.module('liveWindowApp')
    .service('DisplayService', ['$rootScope', '$injector', '$http', 'CharacterDataService', function ($rootScope, $injector, $http, CharacterDataService) {
        var leftDisplay = {
            type: null,
            content: null,
            overlay: null,
            windowPane: false
        };

        var rightDisplay = {
            type: null,
            content: null,
            overlay: null,
            windowPane: false
        };

        var initiativeTracker = {
            visible: false,
            combatants: []
        };

        var playerCharacterIds = ["142137149", "143192353", "142330441", "168665310", "142145157"];

        var isRemoteControlled = false;
        var images = []; // Will be loaded dynamically
        var isLoading = false;
        var syncInterval = null;

        // Auto-sync every 60 seconds
        function startAutoSync() {
            if (syncInterval) return;
            syncInterval = setInterval(function () {
                // Only sync if there are combatants with DB IDs and the tracker is visible
                if (initiativeTracker.visible && initiativeTracker.combatants.some(c => c.dbId)) {
                    console.log('Auto-syncing character data...');
                    // We can't use 'this' here as it's a private function
                    // The service methods are defined in the return object below
                    var service = $injector.get('DisplayService');
                    service.syncCharacterData();
                }
            }, 60000);
        }

        // Listen for remote state updates
        $rootScope.$on('websocket:stateUpdate', function (event, data) {
            console.log('Applying remote state update:', data);
            isRemoteControlled = true;

            leftDisplay = data.leftDisplay || { type: null, content: null, overlay: null, windowPane: false };
            rightDisplay = data.rightDisplay || { type: null, content: null, overlay: null, windowPane: false };
            if (data.initiativeTracker) {
                initiativeTracker = data.initiativeTracker;
            }

            $rootScope.$apply();
            isRemoteControlled = false;
        });

        // Load images dynamically from server
        function loadImages() {
            if (isLoading) return;
            isLoading = true;

            $http.get('api/images').then(function (response) {
                images = response.data;
                isLoading = false;
                console.log('Loaded', images.length, 'images dynamically from filesystem');
                $rootScope.$broadcast('imagesLoaded', images);
            }).catch(function (error) {
                console.error('Failed to load images from server:', error);
                images = [];
                isLoading = false;
                $rootScope.$broadcast('imagesLoadError', error);
            });
        }

        var overlays = [
            // Original overlays
            { name: 'Cave Fireflies', path: 'overlays/cave-fireflies.html', emoji: '✨', description: 'Tiny glowing fireflies dancing in the darkness' },
            { name: 'Rain Drops', path: 'overlays/rain-drops.html', emoji: '🌧️', description: 'Gentle rain falling in a rhythmic pattern' },
            { name: 'Floating Embers', path: 'overlays/floating-embers.html', emoji: '🔥', description: 'Warm glowing embers drifting upward' },
            { name: 'Sunbeams', path: 'overlays/sunbeams.html', emoji: '☀️', description: 'Radiant beams of sunlight streaming through' },
            { name: 'Fog Overlay', path: 'overlays/fog-overlay.html', emoji: '🌫️', description: 'Mystical fog drifting across the bottom of the screen' },
            { name: 'Falling Snow', path: 'overlays/falling-snow.html', emoji: '❄️', description: 'Gentle snowflakes falling with realistic wind sway' },
            { name: 'Swirling Leaves', path: 'overlays/swirling-leaves.html', emoji: '🍂', description: 'Autumn leaves spinning and falling in multiple patterns' },
            // Custom overlays
            { name: 'Shadow Tendrils', path: 'overlays/shadow-tendrils.html', emoji: '🕸️', description: 'Ethereal shadow tendrils flowing across the display' },
            { name: 'Aurora', path: 'overlays/aurora.html', emoji: '🌌', description: 'Translucent aurora effect (reds, purples, greens) across the top 30% of the screen' },
            { name: 'Ocean Sway', path: 'overlays/distortion-sway.html', emoji: '⛵', description: 'A gentle rocking motion as if the image is on a ship at sea' }
        ];

        // Add new three.js overlays for DND themed effects
        overlays.push({ name: 'Ethereal Motes', path: 'overlays/ethereal-motes.html', emoji: '✨', description: 'Floating translucent motes that drift and glow — good for fae or magical ambiance' });

        // Distortion-focused overlays (ripples, swirls, warps, glass/haze effects)
        overlays.push({ name: 'Water Ripples', path: 'overlays/distortion-water-ripples.html', emoji: '🌊', description: 'Gentle concentric water ripples that subtly refract the background' });
        overlays.push({ name: 'Lens Warp', path: 'overlays/distortion-lens-warp.html', emoji: '🔍', description: 'Localized lens-like warp with subtle magnification and chromatic aberration' });
        overlays.push({ name: 'Heat Haze', path: 'overlays/distortion-heat-haze.html', emoji: '🌫️', description: 'A warm turbulence distortion like heat shimmer above a fire' });
        overlays.push({ name: 'Swirling Vortex', path: 'overlays/distortion-vortex.html', emoji: '🌀', description: 'A slow swirling vortex that gently pulls the visuals around a center' });
        overlays.push({ name: 'Glass Distort', path: 'overlays/distortion-glass.html', emoji: '🔲', description: 'Stained glass / frosted glass style distortion with subtle edges' });
        overlays.push({ name: 'Warp Grid', path: 'overlays/distortion-warp-grid.html', emoji: '▦', description: 'A grid-based warp field that bends the background along a pattern' });
        overlays.push({ name: 'Turbulent Swirl', path: 'overlays/distortion-turbulence.html', emoji: '🌪️', description: 'High-frequency turbulence and swirl for chaotic warp effects' });
        overlays.push({ name: 'Ripple Field', path: 'overlays/distortion-ripple-field.html', emoji: '🔵', description: 'Many small interfering ripples for pond-like water surface effect' });
        overlays.push({ name: 'Whirlpool', path: 'overlays/distortion-whirlpool.html', emoji: '🕳️', description: 'A stronger whirlpool-like center distortion with rotational flow' });
        overlays.push({ name: 'Wave Grid', path: 'overlays/distortion-wave-grid.html', emoji: '〰️', description: 'Sine-wave distortions applied across a grid — good for energy fields' });
        overlays.push({ name: 'Fire Flames', path: 'overlays/fire-flames.html', emoji: '🔥', description: 'Flickering flames rising from the bottom with realistic color shifting and flicker effects' });
        overlays.push({ name: 'Glitch Distortion', path: 'overlays/distortion-glitch.html', emoji: '👾', description: 'Digital corruption with blocky displacement and RGB splitting' });
        overlays.push({ name: 'Kaleidoscope', path: 'overlays/distortion-kaleidoscope.html', emoji: '💠', description: 'Mesmerizing 6-segment radial mirror effect' });
        overlays.push({ name: 'Chromatic Aberration', path: 'overlays/distortion-chromatic.html', emoji: '🌈', description: 'Lens effect where colors separate near the edges with a subtle pulse' });

        // Color Tweaking Overlays
        overlays.push({ name: 'Hue Shift', path: 'overlays/color-hue-shift.html', emoji: '🎨', description: 'Cycles the colors of the background through the spectrum' });
        overlays.push({ name: 'Vintage Film', path: 'overlays/color-vintage.html', emoji: '🎞️', description: 'Sepia tone, vignette, and film grain for an old movie look' });
        overlays.push({ name: 'Night Vision', path: 'overlays/color-night-vision.html', emoji: '🟢', description: 'Green tint, scanlines, and noise simulating night vision goggles' });
        overlays.push({ name: 'Cyberpunk Neon', path: 'overlays/color-cyberpunk.html', emoji: '🌃', description: 'High contrast with pink/cyan color grading' });
        overlays.push({ name: 'Noir', path: 'overlays/color-noir.html', emoji: '🎬', description: 'Dramatic high-contrast black and white' });
        overlays.push({ name: 'Duotone', path: 'overlays/color-duotone.html', emoji: '🟣', description: 'Maps brightness to a deep blue and hot pink gradient' });

        return {
            // Getters
            getInitiativeTracker: function () {
                return initiativeTracker;
            },

            getLeftDisplay: function () {
                return leftDisplay;
            },

            getRightDisplay: function () {
                return rightDisplay;
            },

            getImages: function () {
                return images;
            },

            getLeftImages: function () {
                return images.filter(function (image) {
                    return image.path.includes('-left');
                });
            },

            getRightImages: function () {
                return images.filter(function (image) {
                    return image.path.includes('-right');
                });
            },

            // Get themes for unified control
            getThemes: function () {
                var themes = [];
                var leftImages = this.getLeftImages();

                leftImages.forEach(function (leftImage) {
                    var themeName = leftImage.name.replace('-left', '');
                    var rightImagePath = leftImage.path.replace('-left', '-right');
                    var rightImage = images.find(function (img) {
                        return img.path === rightImagePath;
                    });

                    if (rightImage) {
                        themes.push({
                            name: themeName,
                            leftPath: leftImage.path,
                            rightPath: rightImage.path,
                            leftThumb: leftImage.path.replace('images/', 'images/thumbnails/'),
                            rightThumb: rightImage.path.replace('images/', 'images/thumbnails/'),
                            displayName: themeName.charAt(0).toUpperCase() + themeName.slice(1).replace(/[-_]/g, ' ')
                        });
                    }
                });

                return themes;
            },

            getOverlays: function () {
                return overlays;
            },

            // Utility method to refresh image list
            refreshImages: function () {
                loadImages();
            },

            // Unified theme setters
            setTheme: function (theme) {
                this.setLeftContent('image', theme.leftPath);
                this.setRightContent('image', theme.rightPath);
            },

            // Unified overlay setters
            setBothOverlays: function (overlayPath) {
                this.setLeftOverlay(overlayPath);
                this.setRightOverlay(overlayPath);
            },

            clearBothOverlays: function () {
                this.clearLeftOverlay();
                this.clearRightOverlay();
            },

            // Unified window pane toggle
            toggleBothWindowPanes: function () {
                var newState = !leftDisplay.windowPane || !rightDisplay.windowPane;
                leftDisplay.windowPane = newState;
                rightDisplay.windowPane = newState;

                if (!isRemoteControlled) {
                    this.broadcastChange('updateWindowPane', {
                        side: 'left',
                        windowPane: newState
                    });
                    this.broadcastChange('updateWindowPane', {
                        side: 'right',
                        windowPane: newState
                    });
                }
            },

            // Unified clear
            clearBoth: function () {
                this.clearLeft();
                this.clearRight();
            },

            // Check if theme is active
            isThemeActive: function (theme) {
                return leftDisplay.type === 'image' && leftDisplay.content === theme.leftPath &&
                    rightDisplay.type === 'image' && rightDisplay.content === theme.rightPath;
            },

            // Check if overlay is active on both displays
            isOverlayActiveOnBoth: function (overlayPath) {
                return leftDisplay.overlay === overlayPath && rightDisplay.overlay === overlayPath;
            },

            // Check if window panes are active on both displays
            areWindowPanesActive: function () {
                return leftDisplay.windowPane && rightDisplay.windowPane;
            },

            // Display setters
            setLeftContent: function (type, content) {
                leftDisplay.type = type;
                leftDisplay.content = content;

                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateDisplay', {
                        side: 'left',
                        type: type,
                        content: content
                    });
                }
            },

            setRightContent: function (type, content) {
                rightDisplay.type = type;
                rightDisplay.content = content;

                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateDisplay', {
                        side: 'right',
                        type: type,
                        content: content
                    });
                }
            },

            // Overlay setters
            setLeftOverlay: function (overlayPath) {
                leftDisplay.overlay = overlayPath;

                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateOverlay', {
                        side: 'left',
                        overlay: overlayPath
                    });
                }
            },

            setRightOverlay: function (overlayPath) {
                rightDisplay.overlay = overlayPath;

                // Broadcast change if not from remote
                if (!isRemoteControlled) {
                    this.broadcastChange('updateOverlay', {
                        side: 'right',
                        overlay: overlayPath
                    });
                }
            },

            clearLeftOverlay: function () {
                leftDisplay.overlay = null;

                if (!isRemoteControlled) {
                    this.broadcastChange('clearOverlay', { side: 'left' });
                }
            },

            clearRightOverlay: function () {
                rightDisplay.overlay = null;

                if (!isRemoteControlled) {
                    this.broadcastChange('clearOverlay', { side: 'right' });
                }
            },

            // Window pane controls
            toggleLeftWindowPane: function () {
                leftDisplay.windowPane = !leftDisplay.windowPane;

                if (!isRemoteControlled) {
                    this.broadcastChange('updateWindowPane', {
                        side: 'left',
                        windowPane: leftDisplay.windowPane
                    });
                }
            },

            toggleRightWindowPane: function () {
                rightDisplay.windowPane = !rightDisplay.windowPane;

                if (!isRemoteControlled) {
                    this.broadcastChange('updateWindowPane', {
                        side: 'right',
                        windowPane: rightDisplay.windowPane
                    });
                }
            },

            // Clear functions
            clearLeft: function () {
                leftDisplay.type = null;
                leftDisplay.content = null;
                leftDisplay.overlay = null;
                leftDisplay.windowPane = false;

                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'left' });
                }
            },

            clearRight: function () {
                rightDisplay.type = null;
                rightDisplay.content = null;
                rightDisplay.overlay = null;
                rightDisplay.windowPane = false;

                if (!isRemoteControlled) {
                    this.broadcastChange('clearDisplay', { side: 'right' });
                }
            },

            // Initiative Tracker methods
            getPlayerCharacterIds: function () {
                return playerCharacterIds;
            },

            syncCharacterData: function () {
                var self = this;
                var idsToSync = initiativeTracker.combatants
                    .filter(c => c.dbId)
                    .map(c => c.dbId);

                if (idsToSync.length === 0) return;

                CharacterDataService.getMultipleCharacters(idsToSync).then(results => {
                    results.forEach(charData => {
                        var combatant = initiativeTracker.combatants.find(c => c.dbId === charData.id.toString());
                        if (combatant) {
                            combatant.name = charData.name;
                            combatant.health = charData.health;
                            combatant.spellSlots = charData.spellSlots;
                            combatant.conditions = charData.conditions;
                            combatant.avatarUrl = charData.avatarUrl;
                        }
                    });

                    if (!isRemoteControlled) {
                        self.broadcastChange('updateInitiative');
                    }
                });
            },

            addCombatant: function (name, init, dbId) {
                var combatant = {
                    name: name,
                    init: Number(init),
                    dbId: dbId || null
                };

                initiativeTracker.combatants.push(combatant);

                // Auto-sort highest to lowest
                this.sortInitiative();

                if (dbId) {
                    this.syncCharacterData();
                }

                if (!isRemoteControlled) {
                    this.broadcastChange('updateInitiative');
                }
            },

            removeCombatant: function (index) {
                initiativeTracker.combatants.splice(index, 1);
                if (!isRemoteControlled) {
                    this.broadcastChange('updateInitiative');
                }
            },

            sortInitiative: function () {
                initiativeTracker.combatants.sort(function (a, b) {
                    return b.init - a.init;
                });
                if (!isRemoteControlled) {
                    this.broadcastChange('updateInitiative');
                }
            },

            toggleInitiativeVisibility: function () {
                initiativeTracker.visible = !initiativeTracker.visible;
                if (!isRemoteControlled) {
                    this.broadcastChange('updateInitiative');
                }
            },

            clearInitiative: function () {
                initiativeTracker.combatants = [];
                if (!isRemoteControlled) {
                    this.broadcastChange('updateInitiative');
                }
            },

            // Initialize
            initializeDisplays: function () {
                // Load images dynamically if not already loaded
                if (images.length === 0) {
                    loadImages();
                }

                // Start the D&D Beyond background sync
                startAutoSync();

                // Set default content if needed
                if (!leftDisplay.type && !rightDisplay.type) {
                    // Start with blank displays
                }

                // Initialize WebSocket connection
                this.initWebSocket();
            },

            // WebSocket helper methods
            initWebSocket: function () {
                // Lazy load WebSocket service to avoid circular dependencies
                try {
                    var WebSocketService = $injector.get('WebSocketService');
                    WebSocketService.connect();
                } catch (e) {
                    console.log('WebSocket service not available, running in standalone mode');
                }
            },

            broadcastChange: function (action, data) {
                // Lazy load WebSocket service
                try {
                    var WebSocketService = $injector.get('WebSocketService');
                    if (WebSocketService.isConnected()) {
                        if (action === 'updateDisplay') {
                            WebSocketService.updateDisplay(data.side, data.type, data.content);
                        } else if (action === 'clearDisplay') {
                            WebSocketService.clearDisplay(data.side);
                        } else if (action === 'updateOverlay') {
                            WebSocketService.updateOverlay(data.side, data.overlay);
                        } else if (action === 'clearOverlay') {
                            WebSocketService.clearOverlay(data.side);
                        } else if (action === 'updateWindowPane') {
                            WebSocketService.updateWindowPane(data.side, data.windowPane);
                        } else if (action === 'updateInitiative') {
                            WebSocketService.updateInitiative(initiativeTracker);
                        }
                    }
                } catch (e) {
                    console.log('WebSocket service not available');
                }
            }
        };
    }]);
