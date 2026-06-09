import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';

const HallDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadHall = async () => {
      setLoading(true);
      const [hallResponse, reviewsResponse] = await Promise.all([
        apiClient.get(`/halls/${id}`),
        apiClient.get(`/halls/${id}/reviews`),
      ]);
      setHall(hallResponse.data.data);
      setReviews(reviewsResponse.data.data || []);
      setSelectedImageIndex(0);
      setLoading(false);
    };

    loadHall().catch(() => {
      setHall(null);
      setReviews([]);
      setLoading(false);
    });
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!hall) return [];

    const images = Array.isArray(hall.images) ? hall.images : [];
    const normalizedImages = images
      .map((image, index) => ({
        id: image.id || `image-${index}`,
        imageUrl: image.imageUrl || image.image_url,
        altText: image.altText || image.alt_text || hall.name,
        sortOrder: image.sortOrder ?? image.sort_order ?? index,
      }))
      .filter((image) => image.imageUrl)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    if (normalizedImages.length) {
      return normalizedImages;
    }

    return hall.imageUrl ? [{ id: 'main', imageUrl: hall.imageUrl, altText: hall.name, sortOrder: 0 }] : [];
  }, [hall]);

  const selectedImage = galleryImages[selectedImageIndex] || galleryImages[0];
  const hasMultipleImages = galleryImages.length > 1;

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

  if (loading) return <div className="loading-page">Заалын мэдээлэл ачаалж байна...</div>;
  if (!hall) return <div className="error-page">Заал олдсонгүй</div>;

  return (
    <div className="hall-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>Буцах</button>

        <div className="detail-layout">
          <div className="gallery">
            <div className="main-image">
              {selectedImage?.imageUrl ? (
                <img src={selectedImage.imageUrl} alt={selectedImage.altText || hall.name} />
              ) : (
                <span>Заал</span>
              )}

              {hasMultipleImages && (
                <>
                  <button className="gallery-nav prev" type="button" aria-label="Өмнөх зураг" onClick={showPreviousImage}>
                    ‹
                  </button>
                  <button className="gallery-nav next" type="button" aria-label="Дараагийн зураг" onClick={showNextImage}>
                    ›
                  </button>
                  <span className="image-count">
                    {selectedImageIndex + 1} / {galleryImages.length}
                  </span>
                </>
              )}
            </div>

            {hasMultipleImages && (
              <div className="thumb-strip">
                {galleryImages.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    className={index === selectedImageIndex ? 'active' : ''}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Зураг ${index + 1}`}
                  >
                    <img src={image.imageUrl} alt={image.altText || `${hall.name} зураг ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="booking-card">
            <span className="category">{(hall.categories || []).map((category) => category.name).join(', ') || 'Заал'}</span>
            <h1>{hall.name}</h1>
            <p className="location">{hall.location}</p>
            <div className="rating">★ {hall.rating || 0} · {hall.reviewCount || reviews.length} сэтгэгдэл</div>
            <p className="price">₮{Number(hall.pricePerHour).toLocaleString()} / цаг</p>
            <div className="capacity">Багтаамж: {hall.capacity} хүн</div>
            <button className="book-btn" onClick={() => navigate(`/booking/${hall.id}`)}>Захиалах</button>
          </aside>
        </div>

        <section className="info-section">
          <h2>Тайлбар</h2>
          <p>{hall.description}</p>
        </section>

        <section className="info-section">
          <h2>Боломжууд</h2>
          <div className="amenities">
            {(hall.categories || []).map((item) => <span key={item.id}>{item.name}</span>)}
            <span>{hall.status === 'AVAILABLE' ? 'Захиалах боломжтой' : hall.status}</span>
          </div>
        </section>

        <section className="info-section">
          <h2>Захиалгын нөхцөл</h2>
          <ul>
            <li><strong>Цуцлалт:</strong> Захиалгын цагаас 24 цагийн өмнө цуцлах боломжтой.</li>
            <li><strong>Төлбөр:</strong> Захиалга баталгаажуулахад 30% урьдчилгаа төлнө.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Сэтгэгдэл</h2>
          <div className="reviews">
            {reviews.length ? (
              reviews.map((review) => (
                <div className="review-card" key={review.id}>
                  <div className="review-head">
                    <strong>{review.userName || `Хэрэглэгч #${review.userId}`}</strong>
                    <span>★ {review.rating}</span>
                  </div>
                  <p>{review.comment}</p>
                  <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                </div>
              ))
            ) : (
              <p className="empty-text">Одоогоор сэтгэгдэл алга.</p>
            )}
          </div>
        </section>
      </div>

      <style>{`
        .hall-detail-page {
          padding: 30px 0;
          background: var(--color-page);
          min-height: calc(100vh - 200px);
        }

        .container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .back-btn {
          background: white;
          border: 1px solid var(--color-border-strong);
          border-radius: 6px;
          color: var(--color-primary-hover);
          font-weight: 800;
          padding: 9px 14px;
          margin-bottom: 18px;
          cursor: pointer;
        }

        .detail-layout {
          display: grid;
          grid-template-columns: 1.4fr 0.8fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .gallery,
        .booking-card,
        .info-section {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: var(--shadow-card);
        }

        .gallery {
          padding: 14px;
        }

        .main-image {
          position: relative;
          height: 430px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f7941d 0%, #e86f1b 60%, #b95613 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          font-weight: 800;
          overflow: hidden;
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .gallery-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 42px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          background: rgba(35, 24, 12, 0.7);
          color: white;
          font-size: 34px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gallery-nav.prev {
          left: 14px;
        }

        .gallery-nav.next {
          right: 14px;
        }

        .gallery-nav:hover {
          background: var(--color-primary);
        }

        .image-count {
          position: absolute;
          right: 14px;
          bottom: 14px;
          background: rgba(35, 24, 12, 0.72);
          color: white;
          border-radius: 20px;
          padding: 6px 10px;
          font-size: 13px;
          font-weight: 800;
        }

        .thumb-strip {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-top: 10px;
        }

        .thumb-strip button {
          border: 2px solid transparent;
          border-radius: 7px;
          padding: 0;
          height: 82px;
          overflow: hidden;
          cursor: pointer;
          background: var(--color-primary-soft);
        }

        .thumb-strip button.active {
          border-color: var(--color-primary);
        }

        .thumb-strip img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .booking-card {
          padding: 22px;
          height: fit-content;
          position: sticky;
          top: 100px;
        }

        .category {
          display: inline-block;
          background: var(--color-primary-soft);
          color: var(--color-primary-hover);
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .booking-card h1 {
          font-size: 26px;
          color: var(--color-text);
          margin-bottom: 10px;
        }

        .location,
        .capacity {
          color: var(--color-muted);
          margin-bottom: 12px;
        }

        .rating {
          color: #b88700;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .price {
          color: var(--color-primary-hover);
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .book-btn {
          width: 100%;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          padding: 13px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .book-btn:hover {
          background: var(--color-primary-hover);
        }

        .info-section {
          padding: 22px;
          margin-bottom: 18px;
        }

        .info-section h2 {
          color: var(--color-text);
          font-size: 20px;
          margin-bottom: 12px;
        }

        .info-section p,
        .info-section li {
          color: var(--color-muted);
          line-height: 1.6;
        }

        .amenities {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .amenities span {
          background: var(--color-primary-soft);
          color: var(--color-primary-hover);
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 13px;
        }

        .reviews {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }

        .review-card {
          background: var(--color-surface-warm);
          border-radius: 8px;
          padding: 14px;
        }

        .review-head {
          display: flex;
          justify-content: space-between;
          color: var(--color-text);
          margin-bottom: 8px;
        }

        .review-card small,
        .empty-text {
          color: var(--color-muted);
        }

        @media (max-width: 768px) {
          .detail-layout {
            grid-template-columns: 1fr;
          }

          .booking-card {
            position: static;
          }

          .main-image {
            height: 280px;
          }

          .thumb-strip {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default HallDetailPage;
