import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth/server';
import { getAdminClient } from '@/lib/supabase/admin';
import {
  fetchYouTubeTranscript,
  fetchYouTubeVideoTitle,
  extractYouTubeVideoId,
} from '@/lib/ai/youtube-transcript';
import { analyzeVideoTranscript } from '@/lib/ai/video-analyzer';

/**
 * POST /api/ai/process-video
 * Process a YouTube video: extract transcript and analyze with AI
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { nodeId, boardId, videoUrl } = body;

    if (!nodeId || !boardId || !videoUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Create asset record with pending status
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .insert({
        node_id: nodeId,
        board_id: boardId,
        user_id: user.id,
        type: 'video',
        url: videoUrl,
        filename: `youtube_${videoId}`,
        status: 'processing',
        processed_data: {
          transcription: null,
          summary: null,
          keyPoints: [],
          entities: [],
          topics: [],
        },
      })
      .select()
      .single();

    if (assetError || !asset) {
      console.error('Error creating asset:', assetError);
      return NextResponse.json(
        { error: 'Failed to create asset' },
        { status: 500 }
      );
    }

    const assetData = asset as unknown as { id: string };

    // Process video asynchronously (in real app, use a queue)
    // For now, we'll do it inline but you could move to background job
    processVideoAsync(assetData.id, videoUrl, user.id, boardId).catch((error) => {
      console.error('Error processing video:', error);
    });

    return NextResponse.json({
      success: true,
      assetId: assetData.id,
      status: 'processing',
      message: 'Video processing started',
    });
  } catch (error) {
    console.error('Error in process-video API:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process video';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * Process video in background
 */
async function processVideoAsync(
  assetId: string,
  videoUrl: string,
  userId: string,
  boardId: string
) {
  const supabase = getAdminClient();

  try {
    // 1. Fetch video title
    const videoTitle = await fetchYouTubeVideoTitle(videoUrl);

    // 2. Fetch transcript
    const { transcript, segments } = await fetchYouTubeTranscript(videoUrl);

    // 3. Analyze with Claude
    const analysis = await analyzeVideoTranscript(transcript, videoTitle || undefined);

    // 4. Update asset with results
    await supabase
      .from('assets')
      .update({
        status: 'ready',
        processed_data: {
          transcription: transcript,
          transcriptSegments: segments,
          summary: analysis.summary,
          keyPoints: analysis.keyPoints,
          entities: analysis.entities,
          topics: analysis.topics,
          sentiment: analysis.sentiment,
          actionItems: analysis.actionItems,
          videoTitle: videoTitle,
        },
      })
      .eq('id', assetId);

    // 5. Track AI interaction
    await supabase.from('ai_interactions').insert({
      board_id: boardId,
      user_id: userId,
      operation_type: 'analyze',
      model_used: 'claude-3-5-sonnet-20241022',
      provider: 'anthropic',
      prompt: `Analyze video transcript: ${transcript.substring(0, 100)}...`,
      response: analysis.summary,
      tokens_used: Math.ceil(transcript.length / 4), // Rough estimate
      created_at: new Date().toISOString(),
    });

    console.log(`Video processed successfully: ${assetId}`);
  } catch (error) {
    console.error('Error in processVideoAsync:', error);

    // Update asset with error status
    await supabase
      .from('assets')
      .update({
        status: 'error',
        error_message:
          error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', assetId);
  }
}
