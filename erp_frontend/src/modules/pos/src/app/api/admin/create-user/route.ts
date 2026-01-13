import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as z from 'zod'; // Import zod for validation

// Admin client with service role key for user management
// Admin client with service role key for user management
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceRoleKey) 
    ? createClient(
        supabaseUrl,
        supabaseServiceRoleKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
    : null;

// Define a schema for the request body
const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string(),
    role: z.enum(['admin', 'manager', 'cashier', 'super_admin']),
    phone: z.string().optional(),
    pin: z.string().length(4).optional(),
    username: z.string().optional(),
    tenant_id: z.union([z.string(), z.number()]).refine((val) => val !== undefined && val !== null, {
        message: "Tenant ID is required",
    }),
});


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validationResult = createUserSchema.safeParse(body);


        if (!validationResult.success) {
            return NextResponse.json(
                { error: validationResult.error.errors },
                { status: 400 }
            );
        }

        if (!supabaseAdmin) {
            console.error('Supabase admin client not initialized. Missing environment variables.');
            return NextResponse.json(
                { error: 'Server configuration error: Missing Supabase credentials' },
                { status: 500 }
            );
        }

        const { email, password, name, role, phone, pin, username, tenant_id: rawTenantId } = validationResult.data;
        
        // Ensure tenant_id is valid number
        const tenant_id = Number(rawTenantId);
        if (isNaN(tenant_id)) {
             return NextResponse.json(
                { error: 'Invalid Tenant ID format' },
                { status: 400 }
            );
        }

        // Hash the password for storage
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                name,
                role,
                phone,
                username,
                tenant_id // Pass as number
            }
        });

        if (authError) {
            console.error('Supabase Auth error:', authError);
            return NextResponse.json(
                { error: authError.message },
                { status: 400 }
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { error: 'Failed to create user' },
                { status: 500 }
            );
        }

        // 2. Create staff record in database
        const { data: staffData, error: staffError } = await supabaseAdmin
            .from('staff')
            .insert({
                uuid: authData.user.id, // Link to auth user
                tenant_id: tenant_id, // Ensure it is always present
                username: username || email,
                name,
                email,
                phone,
                pin,
                role,
                password: hashedPassword, // Store hashed password
                is_active: true,
                permissions: {}, // Set based on role
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select() // Ensure we select to get the full record back
            .single();

        if (staffError) {
            console.error('Staff creation error:', staffError);
            // Rollback: delete the auth user if staff creation fails
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json(
                { error: 'Failed to create staff record: ' + staffError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            user: authData.user,
            staff: staffData
        });

    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
