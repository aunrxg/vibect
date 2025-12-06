const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function generateRandomString(length: number): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += ALPHABETS[Math.floor(Math.random() * ALPHABETS.length)];
  }
  return result;
}

function addHyphens(code: string) {
  return code.match(/.{1,4}/g)?.join("-") || code;
}

export function generateInviteCodes(length = 8, formatted = true) {
  const raw = generateRandomString(length);
  return formatted ? addHyphens(raw) : raw;
}
