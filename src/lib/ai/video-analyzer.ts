/**
 * Video Analysis Service
 * Uses Claude API to analyze video transcripts and extract insights
 */

import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface VideoAnalysis {
  summary: string;
  keyPoints: string[];
  topics: string[];
  entities: string[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  actionItems?: string[];
}

/**
 * Analyze video transcript using Claude
 */
export async function analyzeVideoTranscript(
  transcript: string,
  videoTitle?: string
): Promise<VideoAnalysis> {
  const prompt = `Analyze this video transcript and provide structured insights.

${videoTitle ? `Video Title: ${videoTitle}\n` : ''}
Transcript:
${transcript}

Please provide:
1. A concise summary (2-3 sentences)
2. Key points (3-5 main takeaways)
3. Main topics covered
4. Named entities (people, companies, products mentioned)
5. Overall sentiment
6. Any action items or recommendations mentioned

Format your response as JSON with this structure:
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "topics": ["...", "..."],
  "entities": ["...", "..."],
  "sentiment": "positive|neutral|negative",
  "actionItems": ["...", "..."]
}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    // Extract JSON from response (Claude sometimes wraps it in markdown)
    let jsonText = content.text.trim();
    const jsonMatch = jsonText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else if (jsonText.startsWith('```') && jsonText.endsWith('```')) {
      jsonText = jsonText.slice(3, -3).trim();
    }

    const analysis = JSON.parse(jsonText) as VideoAnalysis;

    return analysis;
  } catch (error) {
    console.error('Error analyzing transcript with Claude:', error);
    throw new Error('Failed to analyze video transcript');
  }
}

/**
 * Generate a shorter summary for display on the node card
 */
export function getShortSummary(analysis: VideoAnalysis): string {
  // Take first sentence or first 100 characters
  const firstSentence = analysis.summary.split(/[.!?]/)[0];
  if (firstSentence.length <= 100) {
    return firstSentence + '.';
  }
  return analysis.summary.substring(0, 97) + '...';
}
