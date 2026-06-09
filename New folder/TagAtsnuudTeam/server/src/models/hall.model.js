class Hall {
  constructor({
    id,
    ownerId,
    name,
    description,
    location,
    capacity,
    pricePerHour,
    imageUrl,
    status = "ACTIVE",
    categoryIds = [],
    images = [],
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString(),
  }) {
    this.id = id;
    this.ownerId = ownerId;
    this.name = name;
    this.description = description;
    this.location = location;
    this.capacity = capacity;
    this.pricePerHour = pricePerHour;
    this.imageUrl = imageUrl;
    this.status = status;
    this.categoryIds = categoryIds;
    this.images = images;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Hall;
