import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

/**
 * Hall Detail Page
 * Shows detailed information about a specific hall
 */
const HallDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hall, setHall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch hall details - Replace with API call
    setTimeout(() => {
      const mockHall = {
        id: id,
        name: 'Grand Ballroom',
        category: 'luxury',
        image: '🏢',
        location: 'Sukhbaatar District',
        capacity: 500,
        pricePerHour: 150000,
        rating: 4.8,
        reviews: 125,
        description: 'Elegant ballroom perfect for weddings and large events',
        amenities: [
          '🎤 Sound System',
          '💡 Professional Lighting',
          '🎬 Projector & Screen',
          '🍽️ Catering Available',
          '🚗 Parking (200 spaces)',
          '🛗 Elevators',
          '🎨 Customizable Decor',
          '🔒 Security 24/7'
        ],
        gallery: ['🏢', '🎊', '💒', '✨'],
        policies: {
          cancellation: 'Free cancellation up to 7 days before booking',
          deposit: '30% deposit required at booking',
          payment: 'Full payment due 3 days before event'
        },
        reviews: [
          { author: 'John Smith', rating: 5, text: 'Perfect venue for our wedding!', date: '2024-05-15' },
          { author: 'Sarah Johnson', rating: 4, text: 'Great facilities and staff', date: '2024-04-20' }
        ]
      };
      setHall(mockHall);
      setLoading(false);
    }, 300);
  }, [id]);

  if (loading) {
    return <div className="loading-page">Loading hall details...</div>;
  }

  if (!hall) {
    return <div className="error-page">Hall not found</div>;
  }

  return (
    <div className="hall-detail-page">
      <div className="container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="detail-layout">
          {/* Left Column - Images & Info */}
          <div className="left-column">
            <div className="main-image">{hall.image}</div>
            <div className="gallery">
              {hall.gallery.map((img, idx) => (
                <div key={idx} className="gallery-img">{img}</div>
              ))}
            </div>
          </div>

          {/* Right Column - Details & Booking */}
          <div className="right-column">
            <div className="header-section">
              <h1>{hall.name}</h1>
              <div className="meta">
                <span className="rating">⭐ {hall.rating} ({hall.reviews} reviews)</span>
                <span className="location">📍 {hall.location}</span>
              </div>
            </div>

            <div className="price-section">
              <span className="price">₮{hall.pricePerHour.toLocaleString()}</span>
              <span className="unit">per hour</span>
            </div>

            <div className="description-section">
              <h3>About</h3>
              <p>{hall.description}</p>
              <div className="capacity">
                <strong>Capacity:</strong> Up to {hall.capacity} people
              </div>
            </div>

            <div className="amenities-section">
              <h3>Amenities</h3>
              <div className="amenities-grid">
                {hall.amenities.map((amenity, idx) => (
                  <div key={idx} className="amenity">
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            <div className="policies-section">
              <h3>Booking Policies</h3>
              <ul>
                <li><strong>Cancellation:</strong> {hall.policies.cancellation}</li>
                <li><strong>Deposit:</strong> {hall.policies.deposit}</li>
                <li><strong>Payment:</strong> {hall.policies.payment}</li>
              </ul>
            </div>

            <Link to={`/booking/${hall.id}`} className="book-btn">
              Book Now
            </Link>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="reviews-section">
          <h2>Guest Reviews</h2>
          <div className="reviews-list">
            {hall.reviews.map((review, idx) => (
              <div key={idx} className="review">
                <div className="review-header">
                  <strong>{review.author}</strong>
                  <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                </div>
                <p className="review-text">{review.text}</p>
                <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .loading-page, .error-page {
          text-align: center;
          padding: 60px 20px;
          font-size: 18px;
          color: #666;
        }

        .error-page {
          color: #dc3545;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .back-btn {
          background: white;
          border: 1px solid #ddd;
          padding: 10px 16px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          color: #333;
          margin-bottom: 20px;
          transition: all 0.3s;
        }

        .back-btn:hover {
          background: #f5f5f5;
          border-color: #667eea;
          color: #667eea;
        }

        .detail-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 60px;
        }

        .main-image {
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 150px;
          margin-bottom: 20px;
        }

        .gallery {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .gallery-img {
          width: 100%;
          aspect-ratio: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
        }

        .header-section h1 {
          font-size: 32px;
          margin-bottom: 12px;
          color: #333;
        }

        .meta {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .rating, .location {
          font-size: 14px;
          color: #666;
        }

        .price-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          margin-bottom: 30px;
        }

        .price {
          font-size: 28px;
          font-weight: 700;
          display: block;
        }

        .unit {
          font-size: 13px;
          opacity: 0.9;
        }

        .description-section,
        .amenities-section,
        .policies-section {
          margin-bottom: 30px;
        }

        .description-section h3,
        .amenities-section h3,
        .policies-section h3 {
          margin-bottom: 12px;
          color: #333;
          font-size: 18px;
        }

        .description-section p {
          color: #666;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .capacity {
          color: #667eea;
          font-weight: 500;
        }

        .amenities-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .amenity {
          background: #f5f5f5;
          padding: 12px;
          border-radius: 5px;
          font-size: 14px;
          color: #333;
        }

        .policies-section ul {
          list-style: none;
          padding: 0;
        }

        .policies-section ul li {
          padding: 8px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.6;
        }

        .book-btn {
          display: block;
          width: 100%;
          background: #667eea;
          color: white;
          padding: 16px;
          border-radius: 8px;
          text-align: center;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.3s;
          border: none;
          cursor: pointer;
        }

        .book-btn:hover {
          background: #5568d3;
        }

        .reviews-section {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .reviews-section h2 {
          margin-bottom: 20px;
          font-size: 22px;
          color: #333;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .review {
          padding: 16px;
          background: #f9f9f9;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .review-header strong {
          color: #333;
        }

        .review-rating {
          color: #ffc107;
        }

        .review-text {
          color: #666;
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .review-date {
          font-size: 12px;
          color: #999;
        }

        @media (max-width: 768px) {
          .detail-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .header-section h1 {
            font-size: 24px;
          }

          .amenities-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default HallDetailPage;
