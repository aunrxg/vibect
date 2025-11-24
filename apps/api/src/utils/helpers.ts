const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function generateRandomString(length: number): string {
  return Array.from({ length }, () => {
    ALPHABETS.charAt(Math.floor(Math.random() * ALPHABETS.length));
  }).join("");
}

function addHyphens(code: string) {
  return code.match(/.{1,4}/g)?.join("-") || code;
}

export function generateInviteCodes(length = 8, formatted = true) {
  const raw = generateRandomString(length);
  return formatted ? addHyphens(raw) : raw;
}
