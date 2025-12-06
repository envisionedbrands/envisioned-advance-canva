/**
 * YouTube Transcript Extraction
 * Fetches transcripts from YouTube videos
 */

import { YoutubeTranscript } from 'youtube-transcript';

export interface TranscriptSegment {
  text: string;
  duration: number;
  offset: number;
}

/**
 * Extract video ID from YouTube URL
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch transcript from YouTube video
 */
export async function fetchYouTubeTranscript(
  videoUrl: string
): Promise<{ transcript: string; segments: TranscriptSegment[] }> {
  try {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

    const segments: TranscriptSegment[] = transcriptData.map((item) => ({
      text: item.text,
      duration: item.duration || 0,
      offset: item.offset || 0,
    }));

    const transcript = segments.map((s) => s.text).join(' ');

    return {
      transcript,
      segments,
    };
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    throw new Error(
      'Failed to fetch transcript. Make sure the video has captions enabled.'
    );
  }
}

/**
 * Get YouTube video title from URL (basic implementation)
 */
export async function fetchYouTubeVideoTitle(
  videoUrl: string
): Promise<string | null> {
  try {
    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      return null;
    }

    // Use oEmbed API to get video title without requiring YouTube API key
    const response = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error('Error fetching video title:', error);
    return null;
  }
}
