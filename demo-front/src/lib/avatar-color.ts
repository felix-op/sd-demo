const AVATAR_COLORS = [
  "#f56a00",
  "#7265e6",
  "#ffbf00",
  "#00a2ae",
  "#1677ff",
  "#52c41a",
  "#eb2f96",
  "#fa541c",
];

/** Color determinístico a partir de un seed (ej. uuid), estable entre renders. */
export function getAvatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}
