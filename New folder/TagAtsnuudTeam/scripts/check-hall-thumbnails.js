const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");

if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");

  env.split(/\r?\n/).forEach((line) => {
    const separatorIndex = line.indexOf("=");

    if (separatorIndex > 0) {
      process.env[line.slice(0, separatorIndex).trim()] = line.slice(separatorIndex + 1).trim();
    }
  });
}

const db = require("../src/config/db");

const checkThumbnails = async () => {
  const [countRows] = await db.execute(
    "SELECT image_type AS imageType, COUNT(1) AS total, COUNT(DISTINCT image_url) AS uniqueUrls FROM hall_images GROUP BY image_type ORDER BY image_type"
  );
  const [sampleRows] = await db.execute(
    "SELECT hall_id, image_type, sort_order, image_url FROM hall_images WHERE hall_id = 1 ORDER BY sort_order ASC"
  );

  console.log(JSON.stringify({ count: countRows, sample: sampleRows }, null, 2));
};

checkThumbnails()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
