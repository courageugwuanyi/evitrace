// src/lib/supabase.ts
// Supabase client singleton — safe to import in client-side code.
// Does NOT import from any .server.ts file.

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || url.trim() === '') {
  throw new Error('VITE_SUPABASE_URL is not set')
}
if (!key || key.trim() === '') {
  throw new Error('VITE_SUPABASE_ANON_KEY is not set')
}

export const supabase = createClient<Database>(url, key)

export type { Database }
