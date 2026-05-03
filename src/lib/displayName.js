/* Display a user's name as "First L." (e.g., "Sarah K.").
   Already-shortened names like "Sarah K." pass through unchanged. */
export function displayName(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

/* 2-letter avatar initials: first letter of first word + first letter of last word. */
export function avatarInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
