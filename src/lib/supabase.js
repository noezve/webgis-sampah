import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gruivepysjojmpecfcqc.supabase.co";
const supabaseKey = "sb_publishable_-PYATMKKnEI7iOKoR02Z-A_ic7GAM1v";

export const supabase = createClient(supabaseUrl, supabaseKey);
