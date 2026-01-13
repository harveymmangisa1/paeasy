import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Create Supabase client
// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase client will be initialized per-request to respect RLS

// Define schema for quotation operations
const quotationSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_email: z.string().email().optional(),
  customer_phone: z.string().optional(),
  customer_address: z.string().optional(),
  items: z.array(z.object({
    product_id: z.number(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unit_price: z.number().min(0, 'Unit price must be non-negative'),
  })),
  discount_amount: z.number().min(0).default(0),
  tax_rate: z.number().min(0).max(100).default(16.5),
  valid_until: z.string().optional(),
  notes: z.string().optional(),
  tenant_id: z.union([z.string(), z.number()]).optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    let query = supabase.from('quotations').select('*');

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,notes.ilike.%${search}%`);
    }

    const { data: quotations, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotations:', error);
      return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
    }

    return NextResponse.json({ 
      quotations: quotations || [],
      count: quotations?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = quotationSchema.safeParse(body);


    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { 
      customer_name, 
      customer_email, 
      customer_phone, 
      customer_address,
      items,
      discount_amount,
      tax_rate,
      valid_until,
      notes,
      tenant_id 
    } = validationResult.data;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const discount_amount_final = discount_amount || 0;
    const total_after_discount = subtotal - discount_amount_final;
    const tax_amount = total_after_discount * (tax_rate / 100);
    const total_amount = total_after_discount + tax_amount;

    const quotation = {
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      items,
      discount_amount: discount_amount_final,
      tax_rate,
      subtotal,
      tax_amount,
      total_amount,
      valid_until: valid_until || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      status: 'pending' as const,
      notes,
      tenant_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('quotations')
      .insert(quotation)
      .select()
      .single();

    if (error) {
      console.error('Error creating quotation:', error);
      return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Quotation created successfully',
      quotation: data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Quotation ID is required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Allow partial updates
    const allowedFields = ['customer_name', 'customer_email', 'customer_phone', 'customer_address', 'status', 'notes'];
    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    updateData.updated_at = new Date().toISOString();

    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data, error } = await supabase
      .from('quotations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quotation:', error);
      return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Quotation updated successfully',
      quotation: data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Quotation ID is required' }, { status: 400 });
    }

    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } }
      }
    );

    const { data, error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quotation:', error);
      return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Quotation deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}