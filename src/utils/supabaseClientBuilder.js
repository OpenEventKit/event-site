import { createClient } from '@supabase/supabase-js'

export default class SupabaseClientBuilder {
    static client

    static getClient(supabaseUrl, supabaseKey) {
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SupabaseClientBuilder: Missing SUPABASE_URL or SUPABASE_KEY environment variables');
        }
        if (!this.client) {
            this.client = createClient(supabaseUrl, supabaseKey, { autoRefreshToken: true })
        }
        return this.client
    }
}