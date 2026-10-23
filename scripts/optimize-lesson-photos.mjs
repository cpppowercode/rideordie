import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = "/home/ubuntu/.cursor/projects/workspace/uploads";
const OUT = "/workspace/public/images/lessons";
const PREVIEW = "/tmp/hero-previews";

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(PREVIEW, { recursive: true });

function src(name) {
  return path.join(SRC, name);
}

async function saveWeb(image, destBase, { width } = {}) {
  let pipeline = image.rotate().removeAlpha();
  if (width) pipeline = pipeline.resize({ width, withoutEnlargement: true });
  const webp = `${destBase}.webp`;
  const avif = `${destBase}.avif`;
  await pipeline.clone().webp({ quality: 78, effort: 6 }).toFile(webp);
  await pipeline.clone().avif({ quality: 48, effort: 5 }).toFile(avif);
  const stat = fs.statSync(webp);
  const meta = await sharp(webp).metadata();
  console.log(
    `${path.basename(webp)} ${meta.width}x${meta.height} ${(stat.size / 1024).toFixed(0)}kb`
  );
}

async function extract(file, region) {
  return sharp(file).extract(region);
}

const heroFile = src("photo_32_16ba.jpg");
const heroMeta = await sharp(heroFile).metadata();
const hw = heroMeta.width;
const hh = heroMeta.height;
console.log(`hero source ${hw}x${hh}`);

// Desktop: 16:9. Keep the rider's head in frame and leave lower snow for the overlay text.
const deskH = Math.round(hw / (16 / 9));
const deskTop = 90;
const desktopRegion = { left: 0, top: deskTop, width: hw, height: Math.min(deskH, hh - deskTop) };

// Mobile: 3:4 portrait strip. Bias left enough to keep the trailing hand in frame.
const mobW = Math.round(hh * (3 / 4));
const riderCx = Math.round(hw * 0.54);
const mobLeft = Math.min(Math.max(0, riderCx - Math.round(mobW / 2)), hw - mobW);
const mobileRegion = { left: mobLeft, top: 0, width: mobW, height: hh };

console.log("desktop crop", desktopRegion);
console.log("mobile crop", mobileRegion);

await saveWeb(await extract(heroFile, desktopRegion), path.join(OUT, "hero"), { width: 2400 });
await saveWeb(await extract(heroFile, mobileRegion), path.join(OUT, "hero-mobile"), { width: 1200 });

// JPEG previews for visual QA
await (await extract(heroFile, desktopRegion))
  .resize({ width: 1440 })
  .jpeg({ quality: 80 })
  .toFile(path.join(PREVIEW, "hero-desktop.jpg"));
await (await extract(heroFile, mobileRegion))
  .resize({ width: 780 })
  .jpeg({ quality: 80 })
  .toFile(path.join(PREVIEW, "hero-mobile.jpg"));

const gallery = [
  {
    name: "lesson",
    file: "photo_36_692f.jpg",
    // Keep both kids and the instructor.
    region: { left: 80, top: 40, width: 2320, height: 1880 },
    width: 1400,
  },
  {
    name: "gallery-kids",
    file: "photo_12_bd80.jpg",
    region: { left: 420, top: 0, width: 1536, height: 1920 },
    width: 1200,
  },
  {
    name: "gallery-night",
    file: "photo_10_40e4.jpg",
    region: { left: 180, top: 0, width: 2048, height: 2560 },
    width: 1200,
  },
  {
    name: "gallery-ski-kids",
    file: "photo_14_83fc.jpg",
    region: null,
    width: 1200,
  },
  {
    name: "gallery-lift-kid",
    file: "photo_13_ea2e.jpg",
    region: null,
    width: 1200,
  },
  {
    name: "gallery-lift",
    file: "photo_08_2730.jpg",
    region: { left: 160, top: 0, width: 2048, height: 2560 },
    width: 1200,
  },
  {
    name: "gallery-carve",
    file: "photo_37_c55a.jpg",
    region: { left: 240, top: 0, width: 960, height: 960 },
    width: 1200,
  },
  {
    name: "gallery-jump",
    file: "photo_42_79fe.jpg",
    region: null,
    width: 1200,
  },
  {
    name: "gallery-coach",
    file: "photo_34_52c2.jpg",
    region: { left: 0, top: 120, width: 1920, height: 1800 },
    width: 1200,
  },
  {
    name: "gallery-night-lift",
    file: "photo_00_c921.jpg",
    region: null,
    width: 1200,
  },
];

for (const item of gallery) {
  const file = src(item.file);
  const image = item.region ? await extract(file, item.region) : sharp(file);
  await saveWeb(image, path.join(OUT, item.name), { width: item.width });
}

console.log("done");
