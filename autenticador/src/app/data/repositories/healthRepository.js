import supabase from "../../utils/supabase";

const USERS_TABLE = "users";
const DATA_TABLE = "data_records";

export async function pingDatabase() {
  const [usersPing, dataPing] = await Promise.all([
    supabase.from(USERS_TABLE).select("id", { count: "exact", head: true }),
    supabase.from(DATA_TABLE).select("id", { count: "exact", head: true }),
  ]);

  return {
    usersPing,
    dataPing,
  };
}
