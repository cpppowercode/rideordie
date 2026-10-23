import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "/home/ubuntu/.cursor/projects/workspace/uploads";
const OUT = "/workspace/public/images/lessons";
const PREVIEW = "/tmp/privacy-previews";

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PREVIEW, { recursive: true });

async function saveWeb(image, destBase, { width } = {}) {
  let pipeline = image.rotate().removeAlpha();
  if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
  await pipeline.clone().webp({ quality: 78, effort: 6 }).toFile(`${destBase}.webp`);
  await pipeline.clone().avif({ quality: 48, effort: 5 }).toFile(`${destBase}.avif`);
  const meta = await sharp(`${destBase}.webp`).metadata();
  const kb = (fs.statSync(`${destBase}.webp`).size / 1024).toFixed(0);
  console.log(`${path.basename(destBase)}.webp ${meta.width}x${meta.height} ${kb}kb`);
  await pipeline.clone().resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(
    path.join(PREVIEW, `${path.basename(destBase)}.jpg`)
  );
}

async function fromFile(name) {
  return sharp(path.join(SRC, name)).rotate();
}

// 강습 안내 / product main: skier from behind, no face. 4:5.
{
  const file = path.join(SRC, "photo_31_e694.jpg");
  const meta = await sharp(file).metadata();
  const height = Math.min(meta.height, Math.round(meta.width * (5 / 4)));
  const top = Math.max(0, Math.round((meta.height - height) * 0.15));
  await saveWeb(
    sharp(file).extract({ left: 0, top, width: meta.width, height }),
    path.join(OUT, "lesson"),
    { width: 1400 }
  );
}

// Extra gallery: jump with helmet + goggles covering the face. Crop bottom watermark.
{
  const file = path.join(SRC, "photo_41_7980.jpg");
  const meta = await sharp(file).metadata();
  const height = Math.round(meta.height * 0.92);
  await saveWeb(
    sharp(file).extract({ left: 0, top: 0, width: meta.width, height }),
    path.join(OUT, "gallery-air"),
    { width: 1200 }
  );
}

// Extra gallery: boarder from behind. Crop bottom-right watermark.
{
  const file = path.join(SRC, "photo_19_524f.jpg");
  const meta = await sharp(file).metadata();
  const height = Math.round(meta.height * 0.9);
  const width = Math.round(height * 0.8);
  const left = Math.max(0, Math.round((meta.width - width) / 2) - 80);
  await saveWeb(
    sharp(file).extract({
      left: Math.min(left, meta.width - width),
      top: 0,
      width,
      height,
    }),
    path.join(OUT, "gallery-slope"),
    { width: 1200 }
  );
}

console.log("done");
