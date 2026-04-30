/**
 * Standalone tests for the chunker. No DB, no Gemini. Pure function checks.
 *
 * Run after build with:
 *   npx ts-node test-chunker.ts
 * or post-build with:
 *   node dist/test-chunker.js
 */

import { chunkHtmlContent, hashContent, htmlToStructuredText, estimateTokens } from './src/shared/utils/chunker';

let failed = 0;
let passed = 0;

function assert(cond: boolean, name: string, detail?: string): void {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('\n[1] Empty / whitespace input');
assert(chunkHtmlContent('').length === 0, 'empty string returns 0 chunks');
assert(chunkHtmlContent('   \n\n   ').length === 0, 'whitespace returns 0 chunks');
assert(chunkHtmlContent('<p></p>').length === 0, 'empty paragraph returns 0 chunks');

console.log('\n[2] Short input -> single chunk');
const shortHtml = '<p>This is a short article about refunds.</p>';
const shortChunks = chunkHtmlContent(shortHtml);
assert(shortChunks.length === 1, 'short html returns 1 chunk');
assert(
  shortChunks[0]!.content.toLowerCase().includes('refund'),
  'chunk content preserves text',
);
assert(shortChunks[0]!.chunk_index === 0, 'first chunk has index 0');
assert(shortChunks[0]!.content_hash.length === 64, 'sha256 hash is 64 hex chars');

console.log('\n[3] Determinism: same input -> same hash');
const a = chunkHtmlContent('<p>Hello world</p>');
const b = chunkHtmlContent('<p>Hello world</p>');
assert(a[0]!.content_hash === b[0]!.content_hash, 'identical input produces identical hash');

console.log('\n[4] Sensitivity: small change -> different hash');
const c = chunkHtmlContent('<p>Hello world</p>');
const d = chunkHtmlContent('<p>Hello World</p>');
assert(c[0]!.content_hash !== d[0]!.content_hash, 'case change yields different hash');

console.log('\n[5] HTML structure preserved as paragraph boundaries');
const structured = htmlToStructuredText('<h1>Title</h1><p>Para one.</p><p>Para two.</p>');
assert(structured.includes('Title'), 'heading text retained');
assert(structured.includes('Para one'), 'paragraph 1 retained');
assert(structured.includes('Para two'), 'paragraph 2 retained');
assert(structured.includes('\n\n'), 'paragraph boundaries kept as double newlines');

console.log('\n[6] Long input splits into multiple chunks with overlap');
const sentence = 'This sentence describes a refund procedure for the customer service representative. ';
const longHtml = `<div>${sentence.repeat(150)}</div>`;
const longChunks = chunkHtmlContent(longHtml, { targetTokens: 200, overlapTokens: 30 });
assert(longChunks.length >= 2, `long input yields >=2 chunks (got ${longChunks.length})`);
assert(
  longChunks.every((c) => estimateTokens(c.content) > 0),
  'every chunk has positive token count',
);
assert(
  longChunks.every((c, i) => c.chunk_index === i),
  'chunks are zero-indexed in order',
);
const uniqueHashes = new Set(longChunks.map((c) => c.content_hash));
assert(uniqueHashes.size === longChunks.length, 'all chunk hashes are unique');

console.log('\n[7] Tiny tail merges into prior chunk (avoids dust)');
const withTinyTail = chunkHtmlContent(
  '<p>' + 'word '.repeat(800) + '</p>\n\n<p>tiny</p>',
  { targetTokens: 200, overlapTokens: 30 },
);
const lastChunk = withTinyTail[withTinyTail.length - 1]!;
assert(
  estimateTokens(lastChunk.content) >= 50 || withTinyTail.length === 1,
  `last chunk respects min size (got ${estimateTokens(lastChunk.content)} tokens)`,
);

console.log('\n[8] hashContent + estimateTokens basics');
assert(hashContent('a') === hashContent('a'), 'hashContent is deterministic');
assert(hashContent('a') !== hashContent('A'), 'hashContent is case-sensitive');
assert(estimateTokens('') === 0, 'empty string is 0 tokens');
assert(estimateTokens('aaaa') === 1, '4 chars ~= 1 token');
assert(estimateTokens('a'.repeat(400)) === 100, '400 chars ~= 100 tokens');

console.log('\n────────────────────────────────────────');
console.log(`Passed: ${passed}   Failed: ${failed}`);
if (failed > 0) {
  process.exit(1);
}
