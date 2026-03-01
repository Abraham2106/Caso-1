import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? "https://ethtiiyoxnsvirtpzjbc.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
  "sb_publishable_LioEhkQ-dnE1s5WeHWqZLQ_6rsija7h";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Faltan variables de entorno de Supabase.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
