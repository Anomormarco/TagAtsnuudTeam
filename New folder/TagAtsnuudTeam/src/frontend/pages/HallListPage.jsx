import { useEffect, useState } from "react";
import api from "../api/client";
import CategoryFilter from "../components/CategoryFilter.jsx";
import HallCard from "../components/HallCard.jsx";
import Pagination from "../components/Pagination.jsx";

const sortOptions = [
  { label: "Newest", value: "created_at,desc" },
  { label: "Price low", value: "price,asc" },
  { label: "Price high", value: "price,desc" },
  { label: "Capacity high", value: "capacity,desc" },
  { label: "Name A-Z", value: "name,asc" },
];

const HallListPage = () => {
  const [halls, setHalls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("created_at,desc");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 12,
    totalElements: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCategories = async () => {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    };

    loadCategories().catch(() => setError("Ангилал ачаалж чадсангүй"));
  }, []);

  useEffect(() => {
    const delay = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/halls", {
          params: {
            keyword,
            location,
            category: selectedCategory,
            sort,
            page,
            size: 12,
          },
        });
        const payload = response.data.data;

        setHalls(payload.content);
        setPagination({
          page: payload.page,
          size: payload.size,
          totalElements: payload.totalElements,
          totalPages: payload.totalPages,
        });
        setLoading(false);
      } catch (loadError) {
        setLoading(false);
        setError("Заалны жагсаалт ачаалж чадсангүй");
      }
    }, 250);

    return () => window.clearTimeout(delay);
  }, [keyword, location, selectedCategory, sort, page]);

  const resetToFirstPage = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Hall Business Logic</p>
          <h1>Заалны жагсаалт</h1>
        </div>
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onChange={resetToFirstPage(setSelectedCategory)}
        />
      </div>

      <div className="search-panel">
        <label>
          <span>Search</span>
          <input
            type="search"
            value={keyword}
            onChange={(event) => resetToFirstPage(setKeyword)(event.target.value)}
            placeholder="Заал хайх"
          />
        </label>
        <label>
          <span>Location</span>
          <input
            type="search"
            value={location}
            onChange={(event) => resetToFirstPage(setLocation)(event.target.value)}
            placeholder="Дүүрэг, байршил"
          />
        </label>
        <label>
          <span>Sort</span>
          <select value={sort} onChange={(event) => resetToFirstPage(setSort)(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="result-meta">
        <span>{pagination.totalElements} заал</span>
        <span>
          Хуудас {pagination.page} / {Math.max(pagination.totalPages, 1)}
        </span>
      </div>

      {error && <p className="state-text error">{error}</p>}
      {loading && <p className="state-text">Ачаалж байна...</p>}

      {!loading && (
        <>
          <div className="hall-grid">
            {halls.map((hall) => (
              <HallCard hall={hall} key={hall.id} />
            ))}
          </div>
          {!halls.length && <p className="state-text">Илэрц олдсонгүй</p>}
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
};

export default HallListPage;
