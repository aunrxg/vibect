export type SpaceIdType = "uuid" | "invite_code" | "url" | "unknown";

export interface ExtractedSpace {
  id: string;
  type: SpaceIdType;
}

const extractSpaceId = (input: string): ExtractedSpace | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // UUID Regex
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  // Invite Code Regex (e.g., ABCD-EFGH or 1234-5678)
  const inviteCodeRegex = /^[a-z0-9]{4}-[a-z0-9]{4}$/i;
  // Simple check for just invite code without dash (if you want to support it, but user said 8 digit separated by -)
  const inviteCodeNoDashRegex = /^[a-z0-9]{8}$/i;

  // 1. Check if it's a full URL
  try {
    const url = new URL(trimmed);
    const path = url.pathname;

    // Check for UUID in URL
    const uuidMatch = path.match(uuidRegex);
    if (uuidMatch) return { id: uuidMatch[0], type: "url" };

    // Check for Invite Code in URL (assuming it's trailing or after /join/ or /space/)
    const inviteMatch = path.match(/([a-z0-9]{4}-[a-z0-9]{4})/i);
    if (inviteMatch) return { id: inviteMatch[1], type: "url" };
  } catch (e) {
    // Not a valid URL, continue to direct checks
  }

  // 2. Check for standalone UUID
  const uuidMatch = trimmed.match(uuidRegex);
  if (uuidMatch && uuidMatch[0] === trimmed) {
    return { id: uuidMatch[0], type: "uuid" };
  }

  // 3. Check for standalone Invite Code
  if (inviteCodeRegex.test(trimmed)) {
    return { id: trimmed.toUpperCase(), type: "invite_code" };
  }

  // 4. Fallback: if it's just 8 characters, maybe it's missing the dash?
  if (inviteCodeNoDashRegex.test(trimmed)) {
    const withDash = `${trimmed.slice(0, 4)}-${trimmed.slice(4)}`.toUpperCase();
    return { id: withDash, type: "invite_code" };
  }

  return null;
};

export default extractSpaceId;
