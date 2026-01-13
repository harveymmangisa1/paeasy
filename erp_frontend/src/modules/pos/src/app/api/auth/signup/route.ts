import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Admin client with service role key
// Admin client with service role key
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

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shopName, ownerName, email, phone, password } = body;

        if (!shopName || !ownerName || !email || !password) {
            return NextResponse.json(
                { error: 'Missing required fields' },
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

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create Supabase Auth user (triggers email verification)
        // We use the anon key client for this if possible, or just use signUp with the admin client but be careful.
        // Actually, to trigger the email flow properly, we should use signUp.
        // Note: We are using the admin client here, but calling signUp.
        const { data: authData, error: authError } = await supabaseAdmin!.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${request.nextUrl.origin}/auth/callback`,
                data: {
                    name: ownerName,
                    role: 'admin',
                    shop_name: shopName
                }
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

        // 2. Create tenant (shop) record
        const { data: tenantData, error: tenantError } = await supabaseAdmin!
            .from('tenants')
            .insert({
                name: shopName,
                owner_id: authData.user.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (tenantError) {
            console.error('Tenant creation error:', tenantError);
            // Rollback: delete auth user
            await supabaseAdmin!.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json(
                { error: 'Failed to create shop: ' + tenantError.message },
                { status: 500 }
            );
        }

        // 3. Create staff record for owner
        const { data: staffData, error: staffError } = await supabaseAdmin!
            .from('staff')
            .insert({
                uuid: authData.user.id,
                tenant_id: tenantData.id,
                username: email,
                name: ownerName,
                email,
                phone: phone || null,
                pin: '0000', // Default PIN, owner should change
                role: 'admin',
                password: hashedPassword,
                is_active: true,
                permissions: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (staffError) {
            console.error('Staff creation error:', staffError);
            // Rollback: delete tenant and auth user
            await supabaseAdmin!.from('tenants').delete().eq('id', tenantData.id);
            await supabaseAdmin!.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json(
                { error: 'Failed to create owner account: ' + staffError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Shop account created successfully',
            tenant: tenantData,
            user: authData.user,
            staff: staffData
        });

    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
