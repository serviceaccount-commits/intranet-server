import { createHash } from 'crypto';
import * as cheerio from 'cheerio';

// 1 token ≈ 4 characters is the standard rough approximation for English/Spanish.
// We use it to size chunks; the embedding model does its own tokenization.
const CHARS_PER_TOKEN = 4;

const DEFAULT_TARGET_TOKENS = 800;
const DEFAULT_OVERLAP_TOKENS = 100;
const MIN_CHUNK_TOKENS = 50;

export interface ChunkInput {
  content: string;
  content_hash: string;
  token_count: number;
  chunk_index: number;
}

export interface ChunkerOptions {
  targetTokens?: number;
  overlapTokens?: number;
}

/** SHA-256 hex digest of a string. */
export function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/** Rough token estimate based on character length. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/** Converts HTML to a plain-text representation that preserves paragraph and
 *  heading boundaries with double newlines, suitable for downstream chunking. */
export function htmlToStructuredText(html: string): string {
  const $ = cheerio.load(html);
  $('script, style').remove();
  $('br').replaceWith('\n');
  $('p, li, h1, h2, h3, h4, h5, h6, div, th, td, blockquote, pre').each((_, el) => {
    $(el).append('\n\n');
  });
  return $.root().text().replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

/** Splits structured text into paragraph-like segments. */
function splitIntoSegments(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 0);
}

/** Packs segments into chunks targeting ~targetTokens each, with a sliding
 *  overlap of ~overlapTokens taken from the tail of the previous chunk. */
export function chunkHtmlContent(
  html: string,
  options: ChunkerOptions = {},
): ChunkInput[] {
  const targetTokens = options.targetTokens ?? DEFAULT_TARGET_TOKENS;
  const overlapTokens = options.overlapTokens ?? DEFAULT_OVERLAP_TOKENS;
  const targetChars = targetTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;

  const text = htmlToStructuredText(html);
  if (!text) return [];

  const segments = splitIntoSegments(text);
  if (segments.length === 0) return [];

  const chunks: ChunkInput[] = [];
  let currentChars = 0;
  let currentParts: string[] = [];

  const flush = (): void => {
    if (currentParts.length === 0) return;
    const content = currentParts.join('\n\n').trim();
    if (estimateTokens(content) < MIN_CHUNK_TOKENS && chunks.length > 0) {
      // Too small to stand alone: append to the previous chunk instead.
      const prev = chunks[chunks.length - 1]!;
      const merged = `${prev.content}\n\n${content}`;
      chunks[chunks.length - 1] = {
        content: merged,
        content_hash: hashContent(merged),
        token_count: estimateTokens(merged),
        chunk_index: prev.chunk_index,
      };
    } else {
      chunks.push({
        content,
        content_hash: hashContent(content),
        token_count: estimateTokens(content),
        chunk_index: chunks.length,
      });
    }
    currentParts = [];
    currentChars = 0;
  };

  const tailForOverlap = (content: string): string => {
    if (overlapChars <= 0 || content.length <= overlapChars) return content;
    const tail = content.slice(-overlapChars);
    const sentenceCut = tail.search(/[.!?]\s/);
    return sentenceCut >= 0 ? tail.slice(sentenceCut + 2) : tail;
  };

  for (const segment of segments) {
    const segChars = segment.length;

    // Segment alone exceeds target → split it on sentence boundaries.
    if (segChars > targetChars) {
      flush();
      const sentences = segment.match(/[^.!?]+[.!?]+\s*|[^.!?]+$/g) ?? [segment];
      let buffer = '';
      for (const sentence of sentences) {
        if (buffer.length + sentence.length > targetChars && buffer.length > 0) {
          currentParts.push(buffer.trim());
          currentChars += buffer.length;
          flush();
          // Seed next chunk with overlap from the just-flushed one.
          const seed = chunks.length > 0 ? tailForOverlap(chunks[chunks.length - 1]!.content) : '';
          if (seed) {
            currentParts.push(seed);
            currentChars += seed.length;
          }
          buffer = sentence;
        } else {
          buffer += sentence;
        }
      }
      if (buffer.trim().length > 0) {
        currentParts.push(buffer.trim());
        currentChars += buffer.length;
      }
      continue;
    }

    // Adding this segment would overflow → flush, then seed next chunk with overlap.
    if (currentChars + segChars > targetChars && currentParts.length > 0) {
      flush();
      const seed = chunks.length > 0 ? tailForOverlap(chunks[chunks.length - 1]!.content) : '';
      if (seed) {
        currentParts.push(seed);
        currentChars += seed.length;
      }
    }

    currentParts.push(segment);
    currentChars += segChars;
  }

  flush();

  return chunks.map((c, i) => ({ ...c, chunk_index: i }));
}
