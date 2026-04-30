import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const avatarBucket = "/storage/v1/object/public/avatars";
const recipeBucket = "/storage/v1/object/public/recipe-images";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const BASE_URL = supabaseUrl;
export const avatarBucketPath = avatarBucket;
export const recipeBucketPath = recipeBucket;
