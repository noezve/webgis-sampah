import { createClient } from "@supabase/supabase-js";

<<<<<<< HEAD
const supabaseUrl = "https://gruivepysjojmpecfcqc.supabase.co";
const supabaseKey = "sb_publishable_-PYATMKKnEI7iOKoR02Z-A_ic7GAM1v";

export const supabase = createClient(supabaseUrl, supabaseKey);
=======
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  createClient(supabaseUrl, supabaseKey);
>>>>>>> db2786e337ccdb4277a46bfb0e23404e01654e67
