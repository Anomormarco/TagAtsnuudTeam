import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

/**
 * Home Page - Hall Listing
 * Displays all halls with filtering, search, sorting, pagination
 */
const HomePage = () => {
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);

  // Mock data - Replace with API call
  useEffect(() => {
    setTimeout(() => {
      const mockHalls = [
        {
          id: 1,
          name: 'Grand Ballroom',
          image: '🏢',
          category: 'luxury',
          capacity: 500,
          pricePerHour: 150000,
          rating: 4.8,
          reviews: 125,
          location: 'Sukhbaatar District',
          description: 'Elegant ballroom perfect for weddings and large events'
        },
        {
          id: 2,
          name: 'Modern Conference Center',
          image: '🏗️',
          category: 'business',
          capacity: 300,
          pricePerHour: 100000,
          rating: 4.6,
          reviews: 89,
          location: 'Khan-Uul District',
          description: 'State-of-the-art conference facilities'
        },
        {
          id: 3,
          name: 'Cozy Lounge',
          image: '🍽️',
          category: 'casual',
          capacity: 80,
          pricePerHour: 50000,
          rating: 4.7,
          reviews: 156,
          location: 'Peace Avenue',
          description: 'Intimate venue for parties and gatherings'
        },
        {
          id: 4,
          name: 'Wedding Palace',
          image: '💍',
          category: 'luxury',
          capacity: 600,
          pricePerHour: 200000,
          rating: 4.9,
          reviews: 200,
          location: 'Bayanzurkh District',
          description: 'Spectacular wedding venue with stunning decorations'
        },
        {
          id: 5,
          name: 'Business Hub',
          image: '💼',
          category: 'business',
          capacity: 150,
          pricePerHour: 70000,
          rating: 4.5,
          reviews: 67,
          location: 'Chingeltei District',
          description: 'Professional meeting spaces with latest technology'
        },
        {
          id: 6,
          name: 'Event Space',
          image: '🎉',
          category: 'casual',
          capacity: 200,
          pricePerHour: 80000,
          rating: 4.6,
          reviews: 112,
          location: 'Songginokhairkhan District',
          description: 'Versatile event space for any occasion'
        }
      ];
      
      setHalls(mockHalls);
      applyFilters(mockHalls);
      setLoading(false);
    }, 300);
  }, []);

  // Apply all filters
  const applyFilters = (data) => {
    let filtered = data;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(h => h.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(h => h.pricePerHour >= priceRange[0] && h.pricePerHour <= priceRange[1]);

    // Search filter
    const search = searchParams.get('search');
    if (search) {
      filtered = filtered.filter(h => 
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.pricePerHour - b.pricePerHour);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.pricePerHour - a.pricePerHour);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else {
      filtered.sort((a, b) => b.reviews - a.reviews);
    }

    setFilteredHalls(filtered);
    setPage(1);
  };

  useEffect(() => {
    applyFilters(halls);
  }, [selectedCategory, priceRange, sortBy, searchParams]);

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredHalls.length / itemsPerPage);
  const paginatedHalls = filteredHalls.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Find Your Perfect Hall</h1>
          <p>Discover and book beautiful venues for any occasion</p>
        </div>
      </section>

      <div className="container">
        <div className="layout">
          {/* Sidebar - Filters */}
          <aside className="sidebar">
            <div className="filter-section">
              <h3>Category</h3>
              {['all', 'luxury', 'business', 'casual'].map(cat => (
                <label key={cat} className="checkbox">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h3>Price Range</h3>
              <input
                type="range"
                min="0"
                max="500000"
                step="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
              />
              <div className="price-display">
                ₮{priceRange[0].toLocaleString()} - ₮{priceRange[1].toLocaleString()}
              </div>
            </div>

            <div className="filter-section">
              <h3>Sort By</h3>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            {loading ? (
              <div className="loading">Loading halls...</div>
            ) : paginatedHalls.length === 0 ? (
              <div className="no-results">
                <p>No halls found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="halls-grid">
                  {paginatedHalls.map(hall => (
                    <Link to={`/halls/${hall.id}`} key={hall.id} className="hall-card">
                      <div className="hall-image">{hall.image}</div>
                      <div className="hall-info">
                        <h3>{hall.name}</h3>
                        <p className="description">{hall.description}</p>
                        <div className="details">
                          <span>👥 {hall.capacity} ppl</span>
                          <span>📍 {hall.location}</span>
                        </div>
                        <div className="footer">
                          <div>
                            <span className="price">₮{hall.pricePerHour.toLocaleString()}/hr</span>
                            <div className="rating">
                              ⭐ {hall.rating} ({hall.reviews} reviews)
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`page-btn ${page === p ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .home-page {
          width: 100%;
        }

        .hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 20px;
          text-align: center;
          margin-bottom: 40px;
        }

        .hero-content h1 {
          font-size: 48px;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .hero-content p {
          font-size: 20px;
          opacity: 0.9;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 30px;
        }

        .sidebar {
          background: white;
          padding: 20px;
          border-radius: 10px;
          height: fit-content;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 100px;
        }

        .filter-section {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .filter-section h3 {
          margin-bottom: 12px;
          color: #333;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .checkbox {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          cursor: pointer;
        }

        .checkbox input {
          margin-right: 8px;
          cursor: pointer;
        }

        .checkbox span {
          font-size: 14px;
          color: #666;
        }

        .price-display {
          font-size: 13px;
          color: #667eea;
          margin-top: 8px;
          font-weight: 500;
        }

        .filter-section select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        .halls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .hall-card {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s, box-shadow 0.3s;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }

        .hall-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }

        .hall-image {
          width: 100%;
          height: 180px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 80px;
        }

        .hall-info {
          padding: 15px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .hall-info h3 {
          margin: 0 0 8px 0;
          font-size: 16px;
          color: #333;
          font-weight: 600;
        }

        .description {
          font-size: 13px;
          color: #666;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .details {
          font-size: 12px;
          color: #888;
          margin-bottom: 12px;
          display: flex;
          gap: 12px;
        }

        .footer {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .price {
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
          display: block;
          margin-bottom: 5px;
        }

        .rating {
          font-size: 12px;
          color: #666;
        }

        .pagination {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 30px;
          padding-bottom: 40px;
        }

        .page-btn {
          width: 36px;
          height: 36px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s;
        }

        .page-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .page-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .loading, .no-results {
          text-align: center;
          padding: 60px 20px;
          color: #888;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
          }

          .halls-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }

          .hero-content h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
