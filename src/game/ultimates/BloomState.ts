// Shared growth-mode flag for the Bloom ultimate (Mutation T4). Read by
// Target.update() and BombTarget.update() to invert the shrink formula.
// Module-scoped so already-spawned entities react without threading context
// through every call. Reset on cleanup and on Game teardown (forceCleanup).
export const bloomState = { active: false };

// Max scale entities reach over their lifetime while Bloom is active.
// Kept separate for targets vs bombs so balance (Task 9) can tune the bomb
// misclick risk independently (design note: reduce bomb growth if too easy).
export const BLOOM_MAX_SCALE = 2;
export const BLOOM_BOMB_MAX_SCALE = 2;
