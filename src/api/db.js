import { createClient, SupabaseClient } from "@supabase/supabase-js";



const db = createClient(
  import.meta.env.VITE_DB_URL,
  import.meta.env.VITE_DB_KEY
)
export default db




