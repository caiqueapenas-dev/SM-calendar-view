import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types"; // Importando os tipos gerados

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase URL ou Anon Key não estão definidos nas variáveis de ambiente."
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
