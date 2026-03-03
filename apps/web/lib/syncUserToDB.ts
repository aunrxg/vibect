import { User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export async function syncUserToDB(user: User) {
  const payload = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
    avatarUrl:
      user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
  console.log("user sync started: ", payload);

  const { error } = await supabase
    .from("users")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    console.error("user sync failed: ", error.message);
  }
}
