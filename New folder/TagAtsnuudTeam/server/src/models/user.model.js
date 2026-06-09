class User {
  constructor({
    id,
    name,
    email,
    phone = null,
    role = "user",
    avatar = null,
    isActive = true,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.role = role;
    this.avatar = avatar;
    this.isActive = Boolean(isActive);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = User;