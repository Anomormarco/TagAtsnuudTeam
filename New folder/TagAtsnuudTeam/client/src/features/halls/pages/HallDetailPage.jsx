import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";

const moneyFormatter = new Intl.NumberFormat("mn-MN");

const HallDetailPage = () => {
  const { id } = useParams();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadHall = async () => {
      setLoading(true);
      const response = await api.get(`/halls/${id}`);
      setHall(response.data.data);
      setSelectedImageIndex(0);
      setLoading(false);
    };

    loadHall().catch(() => {
      setLoading(false);
      setError("Заалны дэлгэрэнгүй ачаалж чадсангүй");
    });
  }, [id]);

  if (loading) {
    return <p className="state-text page">Ачаалж байна...</p>;
  }

  if (error || !hall) {
    return <p className="state-text error page">{error || "Заал олдсонгүй"}</p>;
  }

  const detailImages = Array.isArray(hall.images)
    ? hall.images
        .filter((image) => (image.imageType || image.image_type) === "detail")
        .slice(0, 5)
    : [];
  const galleryImages = [
    {
      id: "main",
      imageUrl: hall.imageUrl,
      altText: hall.name,
    },
    ...detailImages,
  ];
  const selectedImage = galleryImages[selectedImageIndex] || galleryImages[0];
  const canNavigateGallery = galleryImages.length > 1;

  const showPreviousImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1
    );
  };

  const showNextImage = () => {
    setSelectedImageIndex((currentIndex) =>
      currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1
    );
  };

  return (
    <section className="detail-page">
      <div className="detail-media">
        <div className="detail-viewer">
          <img
            className="detail-image"
            src={selectedImage.imageUrl || selectedImage.image_url}
            alt={selectedImage.altText || selectedImage.alt_text || hall.name}
          />
          {canNavigateGallery && (
            <>
              <button
                aria-label="Өмнөх зураг"
                className="gallery-nav gallery-nav-prev"
                type="button"
                onClick={showPreviousImage}
              >
                ‹
              </button>
              <button
                aria-label="Дараагийн зураг"
                className="gallery-nav gallery-nav-next"
                type="button"
                onClick={showNextImage}
              >
                ›
              </button>
            </>
          )}
        </div>

        {canNavigateGallery && (
          <div className="detail-gallery">
            {galleryImages.map((image, index) => (
              <button
                className={index === selectedImageIndex ? "active" : ""}
                key={image.id}
                type="button"
                onClick={() => setSelectedImageIndex(index)}
              >
                <img
                  src={image.imageUrl || image.image_url}
                  alt={image.altText || image.alt_text || `${hall.name} зураг ${index + 1}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="detail-content">
        <div className="detail-actions">
          <Link className="back-link" to="/">
            Буцах
          </Link>
          <Link className="detail-link" to={`/halls/${hall.id}/edit`}>
            Засах
          </Link>
        </div>
        <h1>{hall.name}</h1>
        <p className="detail-location">{hall.location}</p>
        <p>{hall.description}</p>

        <div className="detail-stats">
          <div>
            <span>Багтаамж</span>
            <strong>{hall.capacity} хүн</strong>
          </div>
          <div>
            <span>Үнэ</span>
            <strong>{moneyFormatter.format(hall.pricePerHour)} MNT/цаг</strong>
          </div>
          <div>
            <span>Төлөв</span>
            <strong>{hall.status}</strong>
          </div>
        </div>

        <div className="tag-row">
          {hall.categories.map((category) => (
            <span key={category.id}>{category.name}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HallDetailPage;
