import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    if (!path) {
      return NextResponse.json({ error: 'Storage path is required.' }, { status: 400 });
    }

    // Generate a 60-minute secure signed URL
    const { data, error } = await supabaseAdmin.storage
      .from('patient-docs')
      .createSignedUrl(path, 3600);

    if (error) {
      console.error('Storage signed URL error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ signedUrl: data.signedUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
