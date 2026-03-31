import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jkvblbzfqptfqdxglosy.supabase.co";
const supabaseKey = "sb_publishable_Zl4jjDfPLIwUvu62J0H3Cw_L76yVN5q";

export const supabase = createClient(supabaseUrl, supabaseKey);