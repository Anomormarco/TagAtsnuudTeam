const db = require("../src/config/db");

const ASSET_BASE_URL = process.env.ASSET_BASE_URL || "http://localhost:3000";

const pageOneImageUrl = (hallId, imageIndex = 0) => {
  const imageNumber = ((hallId - 1 + imageIndex) % 12) + 1;
  const fileName = `page1-hall-${String(imageNumber).padStart(2, "0")}.png`;

  return `${ASSET_BASE_URL}/uploads/halls/${fileName}?v=page1-hall-${hallId}-${imageIndex}`;
};

const run = async () => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (let hallId = 1; hallId <= 12; hallId += 1) {
      await connection.execute(
        `
          UPDATE hall_images
          SET image_url = ?, alt_text = ?
          WHERE hall_id = ? AND image_type = 'thumbnail' AND sort_order = 0
        `,
        [pageOneImageUrl(hallId, 0), `Заал ${hallId} нүүр зураг`, hallId]
      );

      for (let sortOrder = 1; sortOrder <= 5; sortOrder += 1) {
        await connection.execute(
          `
            UPDATE hall_images
            SET image_url = ?, alt_text = ?
            WHERE hall_id = ? AND image_type = 'detail' AND sort_order = ?
          `,
          [pageOneImageUrl(hallId, sortOrder), `Заал ${hallId} дэлгэрэнгүй зураг ${sortOrder}`, hallId, sortOrder]
        );
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  console.log("Updated page 1 hall thumbnails and detail images.");
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
