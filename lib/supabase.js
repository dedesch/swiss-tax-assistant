import { createClient } from '@supabase/supabase-js'

// Supabase configuration for server-side operations
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    throw new Error('Supabase configuration incomplete')
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
})

// Database helper functions
export async function createTables() {
    try {
        // Test connection by trying to access users table
        const { error: testError } = await supabase
            .from('users')
            .select('id')
            .limit(1)
        
        if (testError && testError.code === 'PGRST116') {
            console.warn('Tables do not exist. Please create them manually in Supabase Dashboard.')
            console.warn('See lib/supabase-env.md for SQL schema.')
            return false
        }
        
        console.log('Supabase database connection verified')
        return true
    } catch (error) {
        console.error('Database connection error:', error)
        // Don't throw error - let the app continue and handle errors per operation
        return false
    }
}

export async function createUser(email, passwordHash) {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{
                email: email,
                password_hash: passwordHash
            }])
            .select()
            .single()
        
        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new Error('Email already exists')
            }
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Create user error:', error)
        throw error
    }
}

export async function getUserByEmail(email) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single()
        
        if (error) {
            if (error.code === 'PGRST116') {
                return null // No rows returned
            }
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Get user by email error:', error)
        throw error
    }
}

export async function saveCalculation(userId, taxYear, calculationData) {
    try {
        await createTables() // Ensure tables exist
        
        const { data, error } = await supabase
            .from('tax_calculations')
            .upsert({
                user_id: userId,
                tax_year: taxYear,
                data: calculationData,
                updated_at: new Date().toISOString()
            })
            .select()
            .single()
        
        if (error) {
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Save calculation error:', error)
        throw error
    }
}

export async function getCalculation(userId, taxYear) {
    try {
        const { data, error } = await supabase
            .from('tax_calculations')
            .select('*')
            .eq('user_id', userId)
            .eq('tax_year', taxYear)
            .single()
        
        if (error) {
            if (error.code === 'PGRST116') {
                return null // No rows returned
            }
            throw error
        }
        
        return data
    } catch (error) {
        console.error('Get calculation error:', error)
        throw error
    }
}