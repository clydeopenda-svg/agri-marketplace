import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="page-narrow">
      <h1>Log In</h1>
      {error && <div className="alert-error">{error}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="field">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn btn-primary">Log In</button>
      </form>
      <p className="form-footer">
        No account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}
