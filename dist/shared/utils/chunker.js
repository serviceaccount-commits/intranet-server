"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashContent = hashContent;
exports.estimateTokens = estimateTokens;
exports.htmlToStructuredText = htmlToStructuredText;
exports.chunkHtmlContent = chunkHtmlContent;
const crypto_1 = require("crypto");
const cheerio = __importStar(require("cheerio"));
// 1 token ≈ 4 characters is the standard rough approximation for English/Spanish.
// We use it to size chunks; the embedding model does its own tokenization.
const CHARS_PER_TOKEN = 4;
const DEFAULT_TARGET_TOKENS = 800;
const DEFAULT_OVERLAP_TOKENS = 100;
const MIN_CHUNK_TOKENS = 50;
/** SHA-256 hex digest of a string. */
function hashContent(content) {
    return (0, crypto_1.createHash)('sha256').update(content, 'utf8').digest('hex');
}
/** Rough token estimate based on character length. */
function estimateTokens(text) {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}
/** Converts HTML to a plain-text representation that preserves paragraph and
 *  heading boundaries with double newlines, suitable for downstream chunking. */
function htmlToStructuredText(html) {
    const $ = cheerio.load(html);
    $('script, style').remove();
    $('br').replaceWith('\n');
    $('p, li, h1, h2, h3, h4, h5, h6, div, th, td, blockquote, pre').each((_, el) => {
        $(el).append('\n\n');
    });
    return $.root().text().replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
/** Splits structured text into paragraph-like segments. */
function splitIntoSegments(text) {
    return text
        .split(/\n{2,}/)
        .map((s) => s.replace(/\s+/g, ' ').trim())
        .filter((s) => s.length > 0);
}
/** Packs segments into chunks targeting ~targetTokens each, with a sliding
 *  overlap of ~overlapTokens taken from the tail of the previous chunk. */
function chunkHtmlContent(html, options = {}) {
    const targetTokens = options.targetTokens ?? DEFAULT_TARGET_TOKENS;
    const overlapTokens = options.overlapTokens ?? DEFAULT_OVERLAP_TOKENS;
    const targetChars = targetTokens * CHARS_PER_TOKEN;
    const overlapChars = overlapTokens * CHARS_PER_TOKEN;
    const text = htmlToStructuredText(html);
    if (!text)
        return [];
    const segments = splitIntoSegments(text);
    if (segments.length === 0)
        return [];
    const chunks = [];
    let currentChars = 0;
    let currentParts = [];
    const flush = () => {
        if (currentParts.length === 0)
            return;
        const content = currentParts.join('\n\n').trim();
        if (estimateTokens(content) < MIN_CHUNK_TOKENS && chunks.length > 0) {
            // Too small to stand alone: append to the previous chunk instead.
            const prev = chunks[chunks.length - 1];
            const merged = `${prev.content}\n\n${content}`;
            chunks[chunks.length - 1] = {
                content: merged,
                content_hash: hashContent(merged),
                token_count: estimateTokens(merged),
                chunk_index: prev.chunk_index,
            };
        }
        else {
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
    const tailForOverlap = (content) => {
        if (overlapChars <= 0 || content.length <= overlapChars)
            return content;
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
                    const seed = chunks.length > 0 ? tailForOverlap(chunks[chunks.length - 1].content) : '';
                    if (seed) {
                        currentParts.push(seed);
                        currentChars += seed.length;
                    }
                    buffer = sentence;
                }
                else {
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
            const seed = chunks.length > 0 ? tailForOverlap(chunks[chunks.length - 1].content) : '';
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
//# sourceMappingURL=chunker.js.map