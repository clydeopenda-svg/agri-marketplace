import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="page-narrow">
      <h1>Register</h1>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label>Full name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Account type</label>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="buyer">Buyer</option>
            <option value="farmer">Farmer</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
      <p className="form-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
