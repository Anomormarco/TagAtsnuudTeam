const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");

  env.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    process.env[key] = value;
  });
}

const db = require("../src/config/db");

const ASSET_BASE_URL = process.env.ASSET_BASE_URL || "http://localhost:3000";
const IMAGE_COUNT = 24;

const buildLocalImageUrl = (hallId, imageIndex) => {
  const imageNumber = ((hallId + imageIndex * 7) % IMAGE_COUNT) + 1;
  const fileName = `zaal-interior-${String(imageNumber).padStart(2, "0")}.png`;

  return `${ASSET_BASE_URL}/uploads/halls/${fileName}?v=hall-${hallId}-${imageIndex}`;
};

const seedLocalHallImages = async () => {
  const [halls] = await db.execute(
    "SELECT id, name FROM halls WHERE deleted_at IS NULL ORDER BY id ASC"
  );

  if (!halls.length) {
    console.log("No halls found.");
    return;
  }

  const values = halls.flatMap((hall) => [
    [hall.id, buildLocalImageUrl(hall.id, 0), "thumbnail", 0, `${hall.name} нүүр зураг`],
    [hall.id, buildLocalImageUrl(hall.id, 1), "detail", 1, `${hall.name} дэлгэрэнгүй зураг 1`],
    [hall.id, buildLocalImageUrl(hall.id, 2), "detail", 2, `${hall.name} дэлгэрэнгүй зураг 2`],
    [hall.id, buildLocalImageUrl(hall.id, 3), "detail", 3, `${hall.name} дэлгэрэнгүй зураг 3`],
    [hall.id, buildLocalImageUrl(hall.id, 4), "detail", 4, `${hall.name} дэлгэрэнгүй зураг 4`],
    [hall.id, buildLocalImageUrl(hall.id, 5), "detail", 5, `${hall.name} дэлгэрэнгүй зураг 5`],
  ]);

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    await connection.execute("DELETE FROM hall_images WHERE image_type IN ('thumbnail', 'detail')");
    await connection.query(
      "INSERT INTO hall_images (hall_id, image_url, image_type, sort_order, alt_text) VALUES ?",
      [values]
    );
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  console.log(`Seeded ${halls.length} halls with ${values.length} local images.`);
};

seedLocalHallImages()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
