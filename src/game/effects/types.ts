export type SkillEffect =
  | { kind: "targetLifetimeMul"; value: number }
  | { kind: "targetSizeMul"; value: number }
  | { kind: "goldenLifetimeMul"; value: number }
  | { kind: "bombBlinkFasterEndS"; value: number }
  | { kind: "multiClicksRequired"; value: number }
  | { kind: "shieldedShieldBreaksOnMiss" }
  | { kind: "spawnAnimMul"; value: number }
  | { kind: "scoreMul"; value: number }
  | { kind: "comboNoResetOnBombClick" }
  | { kind: "bombComboCashout"; scoreMul: number }
  | { kind: "goldenSpawnRateMul"; value: number }
  | { kind: "doubleTargetChance"; value: number }
  | { kind: "bombExpireCurrencyChance"; value: number }
  | { kind: "comboCap"; value: number }
  | { kind: "currencyPerHitAtComboGte"; combo: number; amount: number }
  | { kind: "startingHPAdd"; value: number }
  | { kind: "bombClickFreeAfterFirst" }
  | { kind: "firstMissForgiven" }
  | { kind: "hpRegenPer1000Score"; value: number }
  | { kind: "backgroundClickIgnored" }
  | { kind: "damageIframesMs"; value: number }
  | { kind: "shieldedMissNoHPLoss" }
  | { kind: "lifetimeJitterPct"; value: number }
  | { kind: "bombWeightHalvedEveryFifthBomb" }
  | { kind: "oversizeChance"; value: number; sizeMul: number; scoreMul: number }
  | { kind: "bombDecoyChance"; value: number }
  | {
      kind: "spawnRateSurgeEveryMs";
      period: number;
      durationMs: number;
      mul: number;
    }
  | { kind: "scoreDoubledNoCurrency" }
  | { kind: "targetsFollowCursorSpeed"; value: number }
  | { kind: "slowBloomPhaseMs"; value: number }
  | { kind: "beaconBombs"; growToScale: number }
  | { kind: "convergentDriftSpeed"; value: number }
  | {
      kind: "phaseFlashCycle";
      periodMs: number;
      invisibleMs: number;
      bonusMul: number;
    }
  | { kind: "echoPhantomMs"; duration: number; bonusMul: number }
  | { kind: "magnetSpeed"; value: number }
  | { kind: "mirrorSpawn" }
  | { kind: "timePulse"; periodMs: number; durationMs: number }
  | { kind: "ultimateUnlock"; id: string };

export type SkillEffectKind = SkillEffect["kind"];
