// src/lib/promoVaultStorage.js
// Manages guest & member gameplay cooldowns, session invite dismissal, and unlocked reward passes.

const GAME_DATA_KEY = "mystique_vault_data_v3";
const LEGACY_GAME_DATA_KEY = "mystique_game_data_v2";
const GUEST_ID_KEY = "mystique_guest_id";
const ACTIVE_REWARD_KEY = "mystique_active_promo_v1";
const INVITE_DISMISSED_KEY = "mystique_vault_invite_dismissed";

export const GAME_CATALOG = {
  "mystery-box": {
    id: "mystery-box",
    code: "01 // COFFERS",
    name: "The Archive Coffers",
    shortName: "Archive Coffers",
    tagline: "Select one of nine sealed obsidian crates to unveil your private code.",
    duration: "10 sec",
  },
  "scratch-card": {
    id: "scratch-card",
    code: "02 // FOIL PLATE",
    name: "Silver Foil Plate",
    shortName: "Foil Plate",
    tagline: "Etch away the brushed titanium seal to reveal your archival privilege.",
    duration: "15 sec",
  },
  "lucky-wheel": {
    id: "lucky-wheel",
    code: "03 // CHRONOGRAPH",
    name: "The Monolith Dial",
    shortName: "Monolith Dial",
    tagline: "Set the precision bezel in motion to lock in an exclusive release code.",
    duration: "10 sec",
  },
  "card-flip": {
    id: "card-flip",
    code: "04 // TAROT PAIRS",
    name: "Atelier Emblem Match",
    shortName: "Emblem Match",
    tagline: "Pair all four architectural emblems within eight moves for top-tier access.",
    duration: "30 sec",
  },
  "number-guess": {
    id: "number-guess",
    code: "05 // CIPHER",
    name: "The Cipher Lock",
    shortName: "Cipher Lock",
    tagline: "Decode the vault combination between 01 and 100 in seven attempts.",
    duration: "30 sec",
  },
  "neon-vault": {
    id: "neon-vault",
    code: "06 // SEQUENCE",
    name: "Obsidian Sequence Vault",
    shortName: "Obsidian Vault",
    tagline: "Mirror the harmonic sequence across six brushed-metal pads to crack the vault.",
    duration: "45 sec",
  },
};

export function getIdentityKey(user = null) {
  if (typeof window === "undefined") return "guest:ssr";
  if (user?.uid) return `user:${user.uid}`;
  if (user?.email) return `email:${String(user.email).toLowerCase()}`;

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return `guest:${guestId}`;
}

export function loadVaultPlayData() {
  if (typeof window === "undefined") return {};
  try {
    const raw =
      localStorage.getItem(GAME_DATA_KEY) ||
      localStorage.getItem(LEGACY_GAME_DATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function recordVaultPlay({ user, activeGame, offerCycleId }) {
  if (typeof window === "undefined" || !activeGame) return {};
  const data = loadVaultPlayData();
  const identityKey = getIdentityKey(user);
  const gameCycleKey = `${activeGame}:${offerCycleId || "legacy"}`;
  const previous = data?.[identityKey]?.[gameCycleKey] || {};

  const nextData = {
    ...data,
    [identityKey]: {
      ...(data?.[identityKey] || {}),
      [gameCycleKey]: {
        lastPlayed: Date.now(),
        playCount: (previous.playCount || 0) + 1,
      },
    },
  };

  try {
    localStorage.setItem(GAME_DATA_KEY, JSON.stringify(nextData));
  } catch {
    // Ignore storage quota errors
  }
  return nextData;
}

export function getVaultPlayStatus({ user, settings }) {
  const promo = settings?.promotionalGames;
  const activeGame = promo?.activeGame || "mystery-box";
  const replayInterval = Number(promo?.replayInterval ?? 24);
  const offerCycleId = promo?.offerCycleId;

  const data = loadVaultPlayData();
  const identityKey = getIdentityKey(user);
  const gameCycleKey = `${activeGame}:${offerCycleId || "legacy"}`;
  const cycleData = data?.[identityKey]?.[gameCycleKey];
  const legacyData = !offerCycleId ? data?.[identityKey]?.[activeGame] : null;
  const record = cycleData || legacyData;

  if (!record?.lastPlayed) {
    return { canPlay: true, remainingMs: 0, oneTimeUsed: false };
  }

  if (replayInterval === 0) {
    return { canPlay: false, remainingMs: Infinity, oneTimeUsed: true };
  }

  const intervalMs = replayInterval * 60 * 60 * 1000;
  const elapsed = Date.now() - record.lastPlayed;
  const remainingMs = Math.max(0, intervalMs - elapsed);

  return {
    canPlay: remainingMs === 0,
    remainingMs,
    oneTimeUsed: false,
  };
}

export function formatRemainingTime(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return "";
  const totalMinutes = Math.ceil(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function saveUnlockedReward({ code, offerLabel, gameName, expiresAt = null }) {
  if (typeof window === "undefined" || !code) return null;
  const payload = {
    code: String(code).trim().toUpperCase(),
    offerLabel: offerLabel || "Private Archive Privilege",
    gameName: gameName || "Atelier Vault",
    unlockedAt: Date.now(),
    expiresAt: expiresAt || Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  try {
    localStorage.setItem(ACTIVE_REWARD_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("mystique-reward-updated", { detail: payload }));
  } catch {
    // Ignore storage errors
  }
  return payload;
}

export function getUnlockedReward() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_REWARD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(ACTIVE_REWARD_KEY);
      return null;
    }
    return parsed?.code ? parsed : null;
  } catch {
    return null;
  }
}

export function clearUnlockedReward() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_REWARD_KEY);
    window.dispatchEvent(new CustomEvent("mystique-reward-updated", { detail: null }));
  } catch {
    // Ignore
  }
}

export function isInviteDismissedThisSession() {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(INVITE_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissInviteForSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(INVITE_DISMISSED_KEY, "1");
  } catch {
    // Ignore
  }
}
