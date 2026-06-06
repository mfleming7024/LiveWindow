angular.module('liveWindowApp')
    .service('CharacterDataService', ['$http', '$q', function ($http, $q) {
        
        const CONDITION_MAP = {
            1: 'Blinded',
            2: 'Charmed',
            3: 'Deafened',
            4: 'Exhaustion',
            5: 'Frightened',
            6: 'Grappled',
            7: 'Incapacitated',
            8: 'Invisible',
            9: 'Paralyzed',
            10: 'Petrified',
            11: 'Poisoned',
            12: 'Prone',
            13: 'Restrained',
            14: 'Stunned',
            15: 'Unconscious'
        };

        // Total spell slots by spellcasting level (index = level, 1-20)
        const SPELL_SLOT_TOTALS = [0, 2, 3, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22];

        const FULL_CASTERS = new Set(['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard']);
        const HALF_CASTERS = new Set(['Paladin', 'Ranger']);

        // Warlock slot progression (level -> { slotLevel, slotCount })
        const WARLOCK_SLOTS = {
            1: { level: 1, count: 1 }, 2: { level: 1, count: 2 },
            3: { level: 2, count: 2 }, 4: { level: 2, count: 2 },
            5: { level: 3, count: 2 }, 6: { level: 3, count: 2 },
            7: { level: 4, count: 2 }, 8: { level: 4, count: 2 },
            9: { level: 5, count: 2 }, 10: { level: 5, count: 2 },
            11: { level: 5, count: 3 }, 12: { level: 5, count: 3 },
            13: { level: 5, count: 3 }, 14: { level: 5, count: 3 },
            15: { level: 5, count: 3 }, 16: { level: 5, count: 3 },
            17: { level: 5, count: 4 }, 18: { level: 5, count: 4 },
            19: { level: 5, count: 4 }, 20: { level: 5, count: 4 }
        };

        /**
         * Fetch and parse data for a single D&D Beyond character
         */
        this.getCharacter = function (characterId) {
            const url = `/api/character/${characterId}`;
            
            return $http.get(url).then(response => {
                if (response.data && response.data.success) {
                    return this.parseCharacter(response.data.data);
                } else {
                    return $q.reject(response.data.message || 'Failed to fetch character data');
                }
            }).catch(error => {
                console.error(`Error fetching character ${characterId}:`, error);
                return $q.reject(error);
            });
        };

        /**
         * Fetch multiple characters in parallel
         */
        this.getMultipleCharacters = function (characterIds) {
            const promises = characterIds.map(id => this.getCharacter(id));
            return $q.all(promises);
        };

        /**
         * Maps the raw D&D Beyond JSON to a clean, usable object
         */
        this.parseCharacter = function (data) {
            return {
                id: data.id,
                name: data.name,
                avatarUrl: data.decorations ? data.decorations.avatarUrl : null,
                frameUrl: data.decorations ? data.decorations.frameAvatarUrl : null,
                health: this.calculateHealth(data),
                conditions: this.extractConditions(data),
                spellSlots: this.extractSpellSlots(data),
                classes: data.classes.map(c => ({
                    name: c.definition.name,
                    level: c.level,
                    subclass: c.subclassDefinition ? c.subclassDefinition.name : null
                }))
            };
        };

        this.calculateHealth = function (data) {
            const base = data.baseHitPoints || 0;
            const bonus = data.bonusHitPoints || 0;
            const override = data.overrideHitPoints || 0;
            const removed = data.removedHitPoints || 0;
            const temp = data.temporaryHitPoints || 0;

            const totalLevel = (data.classes || []).reduce((sum, c) => sum + c.level, 0);

            // Flatten all modifiers across every source
            const allMods = Object.values(data.modifiers || {}).flat();

            // Constitution score: base stat (id=3) + bonusStat + overrideStat + modifier bonuses
            const conBase = ((data.stats || []).find(s => s.id === 3) || {}).value || 10;
            const conBonus = ((data.bonusStats || []).find(s => s.id === 3) || {}).value || 0;
            const conOverride = ((data.overrideStats || []).find(s => s.id === 3) || {}).value || null;
            const conModBonus = allMods
                .filter(m => m.subType === 'constitution-score' && m.type === 'bonus' && m.value)
                .reduce((sum, m) => sum + m.value, 0);
            const conScore = (conOverride !== null ? conOverride : conBase + conBonus) + conModBonus;
            const conMod = Math.floor((conScore - 10) / 2);

            // Per-level HP bonuses (e.g. Tough feat, Hill Dwarf Dwarven Toughness)
            const hpPerLevel = allMods
                .filter(m => m.subType === 'hit-points-per-level' && m.value)
                .reduce((sum, m) => sum + m.value, 0);

            const max = override || (base + bonus + (conMod * totalLevel) + (hpPerLevel * totalLevel));
            const current = max + temp - removed;

            return {
                current: current,
                max: max,
                temp: temp,
                percentage: Math.min(100, Math.max(0, (current / max) * 100))
            };
        };

        this.extractConditions = function (data) {
            const activeConditions = [];
            
            if (data.conditions && Array.isArray(data.conditions)) {
                data.conditions.forEach(c => {
                    const name = CONDITION_MAP[c.id];
                    if (name) {
                        activeConditions.push({
                            id: c.id,
                            name: name
                        });
                    }
                });
            }
            
            return activeConditions;
        };

        this.extractSpellSlots = function (data) {
            let totalUsed = 0;
            let totalMax = 0;

            // 1. Process standard Spell Slots
            // available is always 0 in the API; derive max from the standard slot progression table
            if (data.spellSlots && Array.isArray(data.spellSlots)) {
                let spellcastingLevel = 0;
                (data.classes || []).forEach(c => {
                    const name = c.definition.name;
                    const subclass = c.subclassDefinition ? c.subclassDefinition.name : null;
                    if (FULL_CASTERS.has(name)) {
                        spellcastingLevel += c.level;
                    } else if (HALF_CASTERS.has(name)) {
                        spellcastingLevel += Math.floor(c.level / 2);
                    } else if (name === 'Fighter' && subclass === 'Eldritch Knight') {
                        spellcastingLevel += Math.floor(c.level / 3);
                    } else if (name === 'Rogue' && subclass === 'Arcane Trickster') {
                        spellcastingLevel += Math.floor(c.level / 3);
                    }
                });

                if (spellcastingLevel > 0) {
                    totalMax += SPELL_SLOT_TOTALS[Math.min(spellcastingLevel, 20)];
                    data.spellSlots.forEach(s => { totalUsed += (s.used || 0); });
                }
            }

            // 2. Process Pact Magic (Warlocks)
            if (data.pactMagic && Array.isArray(data.pactMagic)) {
                const warlockClass = data.classes.find(c => c.definition.name === 'Warlock');
                const warlockLevel = warlockClass ? warlockClass.level : 0;
                const expected = WARLOCK_SLOTS[warlockLevel] || { level: 0, count: 0 };

                let pactUsed = 0;
                let pactMax = expected.count;

                data.pactMagic.forEach(s => {
                    pactUsed += (s.used || 0);
                    if (s.level === expected.level && s.available > expected.count) {
                        pactMax = s.available;
                    }
                });
                
                totalUsed += pactUsed;
                totalMax += pactMax;
            }

            if (totalMax === 0) return null;

            // Return as a single entry to represent a single row of dots
            return [{
                used: totalUsed,
                max: totalMax
            }];
        };

    }]);
