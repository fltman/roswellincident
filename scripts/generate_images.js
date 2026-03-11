#!/usr/bin/env node
/**
 * Generates images for all game content (Roswell incident).
 * Usage: node scripts/generate_images.js [locations|characters|clues]
 *
 * Style: GTA V loading screen art with 1947 retro Kodachrome palette.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const data = require('../data/roswell_game_data.json');
const SCRIPT = path.join(__dirname, '..', '.claude', 'skills', 'gemini-imagegen', 'scripts', 'generate_image.py');
const IMG_DIR = path.join(__dirname, '..', 'client', 'public', 'images');

const BASE_STYLE = 'GTA V loading screen art style, bold cel-shaded illustration with graphic novel outlines, stylized realism, dramatic lighting. 1947 RETRO color palette: faded Kodachrome tones, muted dusty ochres, washed-out turquoise sky, sepia-tinged desert browns, vintage postcard warmth, like a colorized 1940s photograph filtered through a graphic novel. No logos, no text, no watermarks';

// Load prompt files lazily (only when needed)
function loadPrompts(file) {
  try { return require(file); } catch { return {}; }
}

// ── MAIN ────────────────────────────────────────────────────────

const category = process.argv[2];
if (!['locations', 'characters', 'clues'].includes(category)) {
  console.log('Usage: node scripts/generate_images.js [locations|characters|clues]');
  process.exit(1);
}

function generateImage(prompt, outputPath) {
  if (fs.existsSync(outputPath)) {
    console.log(`  SKIP (exists): ${path.basename(outputPath)}`);
    return true;
  }
  const fullPrompt = `${BASE_STYLE}. ${prompt}`;
  try {
    execSync(`python3 "${SCRIPT}" --prompt "${fullPrompt.replace(/"/g, '\\"')}" --output "${outputPath}"`, {
      timeout: 120000,
      stdio: 'pipe'
    });
    console.log(`  OK: ${path.basename(outputPath)}`);
    return true;
  } catch (e) {
    console.log(`  FAIL: ${path.basename(outputPath)} — ${e.message.substring(0, 100)}`);
    return false;
  }
}

let items;
let dir;

if (category === 'locations') {
  const prompts = loadPrompts('./prompts_locations');
  dir = path.join(IMG_DIR, 'locations');
  fs.mkdirSync(dir, { recursive: true });
  items = Object.keys(data.locations).map(id => ({
    id,
    prompt: prompts[id] || `A 1947 New Mexico scene: ${data.locations[id].name}, ${data.locations[id].description.substring(0, 150)}`,
    output: path.join(dir, `${id}.jpg`)
  }));
} else if (category === 'characters') {
  const prompts = loadPrompts('./prompts_characters');
  dir = path.join(IMG_DIR, 'characters');
  fs.mkdirSync(dir, { recursive: true });
  items = Object.keys(data.characters).map(id => ({
    id,
    prompt: prompts[id] || `Portrait of ${data.characters[id].name}, ${data.characters[id].role}, 1947 New Mexico, dramatic lighting`,
    output: path.join(dir, `${id}.jpg`)
  }));
} else {
  const prompts = loadPrompts('./prompts_clues');
  dir = path.join(IMG_DIR, 'clues');
  fs.mkdirSync(dir, { recursive: true });
  items = Object.keys(data.clues).map(id => ({
    id,
    prompt: prompts[id] || `Visual representation of: ${data.clues[id].title} — ${data.clues[id].description.substring(0, 150)}, 1947 New Mexico`,
    output: path.join(dir, `${id}.jpg`)
  }));
}

console.log(`\nGenerating ${items.length} ${category} images...\n`);

let ok = 0, fail = 0, skip = 0;
for (const item of items) {
  if (fs.existsSync(item.output)) {
    skip++;
    console.log(`  SKIP (exists): ${path.basename(item.output)}`);
    continue;
  }
  const result = generateImage(item.prompt, item.output);
  if (result) ok++; else fail++;
}

console.log(`\nDone: ${ok} generated, ${skip} skipped, ${fail} failed out of ${items.length}`);
