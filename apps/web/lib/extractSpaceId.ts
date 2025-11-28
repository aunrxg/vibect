const extractSpaceId = (input: string): string => {
  let spaceId = input.trim();
  if (spaceId.includes("/space/")) {
    const match = input.match(/\/space\/([0-9a-fA-F-]{36})/);
    if (match) {
      spaceId = match[1];
    }
  }

  return spaceId;
};

export default extractSpaceId;
