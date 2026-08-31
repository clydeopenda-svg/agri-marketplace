import { useEffect, useState } from "react";
import { getProduce, getCurrentUser, logout, createOrder } from "../api.js";
import { useNavigate, Link } from "react-router-dom";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=1600&q=80",
  "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=1600&q=80",
  "https://images.unsplash.com/photo-1595855759920-86582396756a?w=1600&q=80",
  "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=1600&q=80",
];

export default function ListingsPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [orderStatus, setOrderStatus] = useState({});

  const fetchProduce = async () => {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (category) filters.category = category;
      const data = await getProduce(filters);
      setItems(data.items);
    } catch (err) {
      setError(err.message || "Failed to load produce");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduce();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleQuantityChange = (produceId, value) => {
    setQuantities({ ...quantities, [produceId]: value });
  };

  const handleOrder = async (produceId) => {
    const qty = parseFloat(quantities[produceId]);
    if (!qty || qty <= 0) {
      setOrderStatus({ ...orderStatus, [produceId]: { type: "error", message: "Enter a valid quantity" } });
      return;
    }
    setOrderStatus({ ...orderStatus, [produceId]: { type: "pending", message: "Placing order..." } });
    try {
      await createOrder([{ produce_id: produceId, quantity: qty }]);
      setOrderStatus({ ...orderStatus, [produceId]: { type: "success", message: "Order placed!" } });
      setQuantities({ ...quantities, [produceId]: "" });
      fetchProduce();
    } catch (err) {
      setOrderStatus({ ...orderStatus, [produceId]: { type: "error", message: err.message || "Order failed" } });
    }
  };

  return (
    <>
      <section className="hero">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img}
            className={`hero-bg-layer ${i === heroIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1>Fresh Produce, Straight From the Farm</h1>
          <p>Buy directly from local farmers — no middlemen, fair prices.</p>
          <div className="hero-search">
            <input
              placeholder="Search by category (e.g. Vegetables)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <button className="btn btn-primary" onClick={fetchProduce}>
              Search
            </button>
          </div>
        </div>
      </section>

      {!user && (
        <section className="how-it-works">
          <div className="how-it-works-inner">
            <h2>How Agri Marketplace Works</h2>
            <p className="how-it-works-subtitle">
              A simple, direct way for farmers and buyers to trade — no middlemen, no guesswork.
            </p>
            <div className="how-it-works-columns">
              <div>
                <p className="how-column-title">Farmers</p>
                <div className="how-step">
                  <div className="how-step-number">1</div>
                  <div className="how-step-text">
                    <h4>Create a free account</h4>
                    <p>Register as a Farmer in under a minute, no fees to join.</p>
                  </div>
                </div>
                <div className="how-step">
                  <div className="how-step-number">2</div>
                  <div className="how-step-text">
                    <h4>List your produce</h4>
                    <p>Post what you have available, crop, quantity, unit, and your price. You set the price.</p>
                  </div>
                </div>
                <div className="how-step">
                  <div className="how-step-number">3</div>
                  <div className="how-step-text">
                    <h4>Receive orders directly</h4>
                    <p>Buyers order straight from your listing. Track every order in one place.</p>
                  </div>
                </div>
                <div className="how-step">
                  <div className="how-step-number">4</div>
                  <div className="how-step-text">
                    <h4>Get paid fairly</h4>
                    <p>Reach more buyers without losing margin to intermediaries.</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="how-column-title">Buyers</p>
                <div className="how-step">
                  <div className="how-step-number">1</div>
                  <div className="how-step-text">
                    <h4>Browse fresh listings</h4>
                    <p>Search produce by category and see what local farmers have available right now.</p>
                  </div>
                </div>
                <div className="how-step">
                  <div className="how-step-number">2</div>
                  <div className="how-step-text">
                    <h4>Order what you need</h4>
                    <p>Pick a quantity and place your order in a couple of clicks.</p>
                  </div>
                </div>
                <div className="how-step">
                  <div className="how-step-number">3</div>
                  <div className="how-step-text">
                    <h4>Track your orders</h4>
                    <p>Follow your order status from your own Orders page, anytime.</p>
                  </div>
                </div>
                <div className="how-step">
                  <div className="how-step-number">4</div>
                  <div className="how-step-text">
                    <h4>Support local farmers</h4>
                    <p>Every order goes directly to the farmer who grew it, fresher produce, fairer trade.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="how-it-works-cta">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </section>
      )}

      <div className="page">
        <div className="page-header">
          <h2>Available Listings</h2>
          {user ? (
            <div className="user-badge">
              <span>Hi, {user.name} ({user.role})</span>
              <button className="btn btn-secondary" onClick={() => navigate("/orders")}>
                {user.role === "farmer" ? "My Sales" : "My Orders"}
              </button>
              <button className="btn btn-secondary" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <span className="user-badge">Not logged in</span>
          )}
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p className="empty-state">No produce found.</p>
        ) : (
          <div className="card-grid">
            {items.map((item) => (
              <div key={item.id} className="card">
                <img className="card-image" src={item.image_url || "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=400&q=60"} alt={item.name} onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1506484381205-f7945653044d?w=400&q=60"; }} />
                <span className="card-category">{item.category}</span>
                <h3>{item.name}</h3>
                <p className="card-price">KES {item.price_per_unit} / {item.unit}</p>
                <p>{item.quantity_available} {item.unit} available</p>
                {item.description && <p className="card-desc">{item.description}</p>}

                {user && user.role === "buyer" && (
                  <>
                    <div className="card-order">
                      <input
                        type="number"
                        placeholder={`Qty (${item.unit})`}
                        value={quantities[item.id] || ""}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        min="0"
                        step="0.1"
                      />
                      <button className="btn btn-primary" onClick={() => handleOrder(item.id)}>
                        Order
                      </button>
                    </div>
                    {orderStatus[item.id] && (
                      <p className={`order-status ${orderStatus[item.id].type}`}>
                        {orderStatus[item.id].message}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}