import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import apiClient from '../utils/apiClient';

const HomePage = () => {
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError('');

      const [hallsResponse, categoriesResponse] = await Promise.all([
        apiClient.get('/halls', { params: { size: 200, sort: 'created_at,desc' } }),
        apiClient.get('/categories'),
      ]);

      const hallContent = hallsResponse.data?.data?.content;
      const categoryContent = categoriesResponse.data?.data;

      setHalls(Array.isArray(hallContent) ? hallContent : []);
      setCategories(Array.isArray(categoryContent) ? categoryContent : []);
      setLoading(false);
    };

    loadInitialData().catch((err) => {
      setHalls([]);
      setCategories([]);
      setError(err.response?.data?.message || 'Заалны мэдээлэл ачаалж чадсангүй. Server асаалттай эсэхийг шалгана уу.');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    let filtered = [...halls];

    if (selectedCategory) {
      filtered = filtered.filter((hall) => (hall.categoryIds || []).includes(Number(selectedCategory)));
    }

    filtered = filtered.filter(
      (hall) => Number(hall.pricePerHour) >= priceRange[0] && Number(hall.pricePerHour) <= priceRange[1]
    );

    const search = searchParams.get('search');
    if (search) {
      filtered = filtered.filter((hall) =>
        `${hall.name} ${hall.description} ${hall.location}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => Number(a.pricePerHour) - Number(b.pricePerHour));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => Number(b.pricePerHour) - Number(a.pricePerHour));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    } else {
      filtered.sort((a, b) => Number(b.reviewCount || 0) - Number(a.reviewCount || 0));
    }

    setFilteredHalls(filtered);
    setPage(1);
  }, [halls, selectedCategory, priceRange, sortBy, searchParams]);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(filteredHalls.length / itemsPerPage);
  const paginatedHalls = filteredHalls.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const quickCategories = ['Хөлбөмбөг', 'Сагсан бөмбөг', 'Волейбол', 'Ширээний теннис'];

  const selectCategoryByName = (categoryName) => {
    const category = categories.find((item) => item.name === categoryName);
    setSelectedCategory(category ? String(category.id) : '');
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Монголын бүх заалыг эндээс</h1>
          <p>Дүүрэг, төрөл, үнэ болон үнэлгээгээр нь шүүж хүссэн заалаа захиалаарай.</p>
          <div className="quick-tabs">
            {quickCategories.map((categoryName) => {
              const category = categories.find((item) => item.name === categoryName);
              const isActive = category && selectedCategory === String(category.id);

              return (
                <button
                  key={categoryName}
                  type="button"
                  className={isActive ? 'active' : ''}
                  onClick={() => selectCategoryByName(categoryName)}
                >
                  {categoryName}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="container">
        <div className="list-header">
          <h2>Ð¡Ð°Ð½Ð°Ð» Ð±Ð¾Ð»Ð³Ð¾Ñ… Ð·Ð°Ð°Ð»ÑƒÑƒÐ´</h2>
          <span>{filteredHalls.length} Ð·Ð°Ð°Ð» Ð¾Ð»Ð´Ð»Ð¾Ð¾</span>
        </div>

        <div className="layout">
          <aside className="sidebar">
            <div className="filter-section">
              <h3>Төрөл</h3>
              <label className="checkbox">
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === ''}
                  onChange={() => setSelectedCategory('')}
                />
                <span>Бүгд</span>
              </label>
              {categories.map((category) => (
                <label key={category.id} className="checkbox">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === String(category.id)}
                    onChange={() => setSelectedCategory(String(category.id))}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>

            <div className="filter-section">
              <h3>Үнийн дээд хэмжээ</h3>
              <input
                type="range"
                min="0"
                max="500000"
                step="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value, 10)])}
              />
              <div className="price-display">
                ₮{priceRange[0].toLocaleString()} - ₮{priceRange[1].toLocaleString()}
              </div>
            </div>

            <div className="filter-section">
              <h3>Эрэмбэлэх</h3>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="popular">Их сэтгэгдэлтэй</option>
                <option value="price-low">Үнэ багаас их</option>
                <option value="price-high">Үнэ ихээс бага</option>
                <option value="rating">Үнэлгээ өндөр</option>
              </select>
            </div>
          </aside>

          <main className="main-content">
            <div className="list-header">
              <h2>Санал болгох заалууд</h2>
              <span>{filteredHalls.length} заал олдлоо</span>
            </div>

            {loading ? (
              <div className="loading">Заалуудыг ачаалж байна...</div>
            ) : error ? (
              <div className="no-results">
                <p>{error}</p>
              </div>
            ) : paginatedHalls.length === 0 ? (
              <div className="no-results">
                <p>Илэрц олдсонгүй. Шүүлтүүрээ өөрчлөөд дахин хайна уу.</p>
              </div>
            ) : (
              <>
                <div className="halls-grid">
                  {paginatedHalls.map((hall) => (
                    <Link to={`/halls/${hall.id}`} key={hall.id} className="hall-card">
                      <div className="hall-image">
                        {hall.imageUrl ? <img src={hall.imageUrl} alt={hall.name} /> : <span>Заал</span>}
                      </div>
                      <div className="hall-info">
                        <h3>{hall.name}</h3>
                        <p className="description">{hall.description}</p>
                        <div className="details">
                          <span>{hall.capacity} хүн</span>
                          <span>{hall.location}</span>
                        </div>
                        <div className="footer">
                          <div>
                            <span className="price">₮{Number(hall.pricePerHour).toLocaleString()}/цаг</span>
                            <div className="rating">
                              ★ {hall.rating || 0} ({hall.reviewCount || 0} сэтгэгдэл)
                            </div>
                          </div>
                          <span className="add-link">Дэлгэрэнгүй</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>
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
          background: linear-gradient(135deg, #fff2dc 0%, #ffe3bf 100%);
          color: var(--color-text);
          padding: 44px 20px 36px;
          margin-bottom: 30px;
          border-bottom: 1px solid var(--color-border);
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-content h1 {
          font-size: 42px;
          margin-bottom: 12px;
          font-weight: 800;
          color: var(--color-text);
        }

        .hero-content p {
          font-size: 17px;
          color: var(--color-muted);
          margin-bottom: 20px;
        }

        .quick-tabs {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .quick-tabs button {
          background: white;
          color: var(--color-primary-hover);
          border: 1px solid var(--color-border-strong);
          border-radius: 8px;
          padding: 9px 13px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
        }

        .quick-tabs button.active,
        .quick-tabs button:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .layout {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 24px;
          align-items: start;
          position: relative;
        }

        .sidebar {
          background: white;
          padding: 20px;
          border-radius: 8px;
          height: fit-content;
          max-height: calc(100vh - 116px);
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          scrollbar-gutter: stable;
          box-shadow: var(--shadow-card);
          border: 1px solid var(--color-border);
          position: sticky;
          top: 92px;
          align-self: start;
          margin-top: 0;
        }

        .sidebar::-webkit-scrollbar {
          width: 8px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: var(--color-primary-soft);
          border-radius: 999px;
          margin: 8px 0;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: var(--color-border-strong);
          border-radius: 999px;
          border: 2px solid var(--color-primary-soft);
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
        }

        .filter-section {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }

        .filter-section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: 0;
        }

        .filter-section h3 {
          margin-bottom: 12px;
          color: var(--color-text);
          font-size: 14px;
          font-weight: 800;
        }

        .checkbox {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          cursor: pointer;
          gap: 8px;
        }

        .checkbox span {
          font-size: 14px;
          color: var(--color-muted);
        }

        .price-display {
          font-size: 13px;
          color: var(--color-primary-hover);
          margin-top: 8px;
          font-weight: 700;
        }

        .filter-section select {
          width: 100%;
          padding: 9px;
          border: 1px solid var(--color-border-strong);
          border-radius: 6px;
          font-size: 14px;
          color: var(--color-text);
          background: white;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;
        }

        .layout .list-header {
          display: none;
        }

        .main-content {
          position: relative;
        }

        .list-header h2 {
          font-size: 22px;
          color: var(--color-text);
        }

        .list-header span {
          color: var(--color-muted);
          font-weight: 700;
        }

        .halls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 18px;
          margin-bottom: 40px;
        }

        .hall-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-card);
          border: 1px solid var(--color-border);
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
        }

        .hall-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 14px 30px rgba(89, 48, 12, 0.12);
        }

        .hall-image {
          width: 100%;
          height: 170px;
          background: linear-gradient(135deg, #f7941d 0%, #e86f1b 60%, #b95613 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          color: white;
        }

        .hall-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
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
          color: var(--color-text);
          font-weight: 800;
        }

        .description {
          font-size: 13px;
          color: var(--color-muted);
          margin-bottom: 12px;
          line-height: 1.45;
        }

        .details {
          font-size: 12px;
          color: var(--color-muted);
          margin-bottom: 12px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .footer {
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-end;
        }

        .price {
          font-size: 17px;
          font-weight: 800;
          color: var(--color-primary-hover);
          display: block;
          margin-bottom: 5px;
        }

        .rating {
          font-size: 12px;
          color: var(--color-muted);
        }

        .add-link {
          color: var(--color-primary);
          font-weight: 800;
          font-size: 13px;
        }

        .pagination {
          position: absolute;
          left: 0;
          right: 0;
          bottom: -76px;
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 0;
          padding-bottom: 0;
          flex-wrap: wrap;
        }

        .page-btn {
          width: 36px;
          height: 36px;
          border: 1px solid var(--color-border-strong);
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
        }

        .page-btn.active,
        .page-btn:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .loading,
        .no-results {
          background: white;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          text-align: center;
          padding: 48px 20px;
          color: var(--color-muted);
          font-size: 16px;
          box-shadow: var(--shadow-card);
        }

        @media (max-width: 768px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
            max-height: none;
            overflow: visible;
            margin-top: 0;
          }

          .pagination {
            position: static;
            margin-top: 30px;
            padding-bottom: 40px;
          }

          .hero-content h1 {
            font-size: 30px;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
