/**
 * Regenerates the browser/app icons in src/app from the brand logo.
 *
 * The source logo is a tall lockup (badge + wordmark). Only the circular badge
 * survives at favicon sizes, so it is cropped out and used on its own. The ICO
 * sizes get a contrast boost because the gold monogram otherwise muddies into
 * the green background below ~32px.
 *
 * Run with: npm run icons
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "public/images/deanverse-digital-logo.png");
const APP_DIR = path.join(root, "src/app");

/** Badge bounds within the trimmed source, measured once by hand. */
const BADGE = { left: 19, top: 15, width: 832, height: 832 };
const ICO_SIZES = [16, 32, 48, 64];
const BRAND_DARK = { r: 15, g: 26, b: 23, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

/** ICO container holding one embedded PNG per size (supported since Vista). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  const directory = Buffer.alloc(16 * entries.length);
  let offset = header.length + directory.length;

  entries.forEach(({ size, data }, index) => {
    const at = index * 16;
    // A 0 byte means 256px; every size we ship is smaller than that.
    directory.writeUInt8(size >= 256 ? 0 : size, at);
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1);
    directory.writeUInt16LE(1, at + 4);
    directory.writeUInt16LE(32, at + 6);
    directory.writeUInt32LE(data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });

  return Buffer.concat([header, directory, ...entries.map((entry) => entry.data)]);
}

const trimmed = await sharp(SOURCE).trim({ threshold: 10 }).toBuffer();
const badge = await sharp(trimmed).extract(BADGE).toBuffer();

await sharp(badge)
  .resize(256, 256, { fit: "contain", background: TRANSPARENT })
  .png({ compressionLevel: 9, palette: true, quality: 88 })
  .toFile(path.join(APP_DIR, "icon.png"));

// iOS draws its own rounded mask over an opaque tile, so pad onto brand dark.
const appleBadge = await sharp(badge)
  .resize(158, 158, { fit: "contain", background: TRANSPARENT })
  .toBuffer();

await sharp({ create: { width: 180, height: 180, channels: 4, background: BRAND_DARK } })
  .composite([{ input: appleBadge, gravity: "center" }])
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(path.join(APP_DIR, "apple-icon.png"));

const icoEntries = [];
for (const size of ICO_SIZES) {
  const data = await sharp(badge)
    .modulate({ saturation: 1.25, brightness: 1.12 })
    .linear(1.15, -12)
    .resize(size, size, { fit: "contain", background: TRANSPARENT, kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  icoEntries.push({ size, data });
}

writeFileSync(path.join(APP_DIR, "favicon.ico"), buildIco(icoEntries));

console.log(`Wrote icon.png, apple-icon.png, favicon.ico (${ICO_SIZES.join("/")}px)`);
