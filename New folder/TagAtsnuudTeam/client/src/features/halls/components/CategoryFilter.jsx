const CategoryFilter = ({ categories, selectedCategory, onChange }) => {
  return (
    <div className="filter-bar" aria-label="Category filter">
      <button
        className={!selectedCategory ? "active" : ""}
        type="button"
        onClick={() => onChange("")}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          className={String(selectedCategory) === String(category.id) ? "active" : ""}
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
