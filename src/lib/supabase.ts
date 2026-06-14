import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hkixbopenspfyriozgmq.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_-O0nQFwbLqlfV60Gfmcgpg_X-LPB7vY'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
