export function getAnonId(): string {
  const key = "musicspace_anon_id";

  let id = typeof window !== "undefined" ? localStorage.getItem(key) : null;
  if (!id && typeof window !== "undefined") {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }

  return id || "server-anon";
}
