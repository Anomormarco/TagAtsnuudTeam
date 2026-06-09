const crypto = require("node:crypto");

let bcrypt = null;

try {
  bcrypt = require("bcryptjs");
} catch (error) {
  bcrypt = null;
}

const hash = async (password) => {
  if (bcrypt) {
    return bcrypt.hash(password, 10);
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key.toString("hex"));
    });
  });

  return `scrypt$${salt}$${derivedKey}`;
};

const compare = async (password, hashedPassword) => {
  if (bcrypt && !String(hashedPassword).startsWith("scrypt$")) {
    return bcrypt.compare(password, hashedPassword);
  }

  const [, salt, storedKey] = String(hashedPassword).split("$");
  if (!salt || !storedKey) {
    return false;
  }

  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(key);
    });
  });
  const storedBuffer = Buffer.from(storedKey, "hex");

  return storedBuffer.length === derivedKey.length && crypto.timingSafeEqual(storedBuffer, derivedKey);
};

module.exports = {
  hash,
  compare,
};
