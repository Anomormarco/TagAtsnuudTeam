import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

const emptyForm = {
  name: "",
  description: "",
  location: "",
  capacity: "",
  pricePerHour: "",
  imageUrl: "",
  status: "AVAILABLE",
  categoryIds: [],
};

const HallFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const categoriesResponse = await api.get("/categories");
      setCategories(categoriesResponse.data.data);

      if (isEdit) {
        const hallResponse = await api.get(`/halls/${id}`);
        const hall = hallResponse.data.data;
        setForm({
          name: hall.name || "",
          description: hall.description || "",
          location: hall.location || "",
          capacity: hall.capacity || "",
          pricePerHour: hall.pricePerHour || "",
          imageUrl: hall.imageUrl || "",
          status: hall.status || "AVAILABLE",
          categoryIds: hall.categoryIds || [],
        });
      }
    };

    load().catch(() => setError("Мэдээлэл ачаалж чадсангүй"));
  }, [id, isEdit]);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const toggleCategory = (categoryId) => {
    setForm((current) => {
      const exists = current.categoryIds.includes(categoryId);
      return {
        ...current,
        categoryIds: exists
          ? current.categoryIds.filter((idValue) => idValue !== categoryId)
          : [...current.categoryIds, categoryId],
      };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      pricePerHour: Number(form.pricePerHour),
    };
    const options = {
      headers: {
        "x-user-id": "6",
        "x-user-role": "OWNER",
      },
      body: JSON.stringify(payload),
    };

    try {
      const response = isEdit
        ? await api.patch(`/halls/${id}`, options)
        : await api.post("/halls", options);
      navigate(`/halls/${response.data.data.id}`);
    } catch (saveError) {
      setError(saveError.message || "Хадгалж чадсангүй");
      setSaving(false);
    }
  };

  return (
    <section className="page form-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Hall Final</p>
          <h1>{isEdit ? "Заал засах" : "Заал нэмэх"}</h1>
        </div>
        <Link className="back-link" to={isEdit ? `/halls/${id}` : "/"}>
          Буцах
        </Link>
      </div>

      {error && <p className="state-text error">{error}</p>}

      <form className="hall-form" onSubmit={submit}>
        <label>
          <span>Нэр</span>
          <input required value={form.name} onChange={updateField("name")} />
        </label>
        <label>
          <span>Байршил</span>
          <input required value={form.location} onChange={updateField("location")} />
        </label>
        <label>
          <span>Багтаамж</span>
          <input required type="number" min="1" value={form.capacity} onChange={updateField("capacity")} />
        </label>
        <label>
          <span>Цагийн үнэ</span>
          <input required type="number" min="1" value={form.pricePerHour} onChange={updateField("pricePerHour")} />
        </label>
        <label>
          <span>Зураг URL</span>
          <input value={form.imageUrl} onChange={updateField("imageUrl")} />
        </label>
        <label>
          <span>Төлөв</span>
          <select value={form.status} onChange={updateField("status")}>
            <option value="AVAILABLE">AVAILABLE</option>
            <option value="UNAVAILABLE">UNAVAILABLE</option>
          </select>
        </label>
        <label className="form-wide">
          <span>Тайлбар</span>
          <textarea rows="4" value={form.description} onChange={updateField("description")} />
        </label>
        <div className="form-wide category-checks">
          {categories.map((category) => (
            <label key={category.id}>
              <input
                type="checkbox"
                checked={form.categoryIds.includes(category.id)}
                onChange={() => toggleCategory(category.id)}
              />
              <span>{category.name}</span>
            </label>
          ))}
        </div>
        <button className="primary-action" type="submit" disabled={saving}>
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </form>
    </section>
  );
};

export default HallFormPage;
