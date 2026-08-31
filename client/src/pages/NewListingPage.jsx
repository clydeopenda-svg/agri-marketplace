import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduce, getCurrentUser } from "../api.js";

export default function NewListingPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [form, setForm] = useState({
    name: "",
    category: "",
    price_per_unit: "",
    unit: "kg",
    quantity_available: "",
    description: "",
    image_url: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await createProduce({
        ...form,
        price_per_unit: parseFloat(form.price_per_unit),
        quantity_available: parseFloat(form.quantity_available),
      });
      navigate("/");
    } catch (err) {
      setError(err.message || "Could not create listing. Check your inputs and try again.");
    }
  };

  if (!user) {
    return (
      <div className="page-narrow">
        <p>You must be logged in to post a listing.</p>
      </div>
    );
  }

  if (user.role !== "farmer") {
    return (
      <div className="page-narrow">
        <p>Only farmer accounts can post produce listings.</p>
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <h1>Post a Produce Listing</h1>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label>Crop name</label>
          <input name="name" placeholder="e.g. Maize" value={form.name} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Category</label>
          <input name="category" placeholder="e.g. Vegetables" value={form.category} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Quantity available</label>
          <input name="quantity_available" type="number" value={form.quantity_available} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Unit</label>
          <input name="unit" placeholder="kg, bags, crates" value={form.unit} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Price per unit (KES)</label>
          <input name="price_per_unit" type="number" value={form.price_per_unit} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Image URL (optional)</label>
          <input name="image_url" placeholder="https://example.com/photo.jpg" value={form.image_url} onChange={handleChange} />
        </div>
        <div className="field">
          <label>Description (optional)</label>
          <textarea name="description" value={form.description} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary">Post Listing</button>
      </form>
    </div>
  );
}