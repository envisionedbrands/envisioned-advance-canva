import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { getAdminClient } from '@/lib/supabase/admin';

/**
 * GET /api/ai/asset/[assetId]
 * Get asset processing status and results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { assetId } = await params;

    const supabase = getAdminClient();

    const { data: asset, error } = await supabase
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .eq('user_id', user.id)
      .single();

    if (error || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch asset';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
