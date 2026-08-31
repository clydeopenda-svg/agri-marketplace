import { useEffect, useState } from "react";
import { getOrders, getCurrentUser, updateOrderStatus } from "../api.js";
import { Link } from "react-router-dom";

const FARMER_ACTIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["delivered", "cancelled"],
};

export default function OrdersPage() {
  const user = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState({});

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getOrders();
      setOrders(data.items || data);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setActionStatus({ ...actionStatus, [orderId]: "updating" });
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err) {
      setActionStatus({ ...actionStatus, [orderId]: err.message || "Update failed" });
    }
  };

  if (!user) {
    return (
      <div className="page">
        <p>You must be logged in to view your orders.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{user.role === "farmer" ? "My Sales" : "My Orders"}</h1>
        <Link to="/" className="btn btn-secondary">Back to Browse</Link>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p className="empty-state">
          {user.role === "farmer" ? "No sales yet." : "No orders yet."}
        </p>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <span>Order #{order.id}</span>
                <span className="order-status-badge">{order.status}</span>
              </div>
              {(order.items || []).map((item) => (
                <div key={item.id} className="order-item-row">
                  <span>{item.quantity} × {item.produce_name || `Produce #${item.produce_id}`}</span>
                  <span>KES {item.price_at_purchase}</span>
                </div>
              ))}
              {order.total_amount != null && (
                <p className="order-total">Total: KES {order.total_amount}</p>
              )}

              {user.role === "farmer" && FARMER_ACTIONS[order.status] && (
                <div className="card-order" style={{ marginTop: "0.75rem" }}>
                  {FARMER_ACTIONS[order.status].map((action) => (
                    <button
                      key={action}
                      className={action === "cancelled" ? "btn btn-secondary" : "btn btn-primary"}
                      onClick={() => handleStatusChange(order.id, action)}
                    >
                      {action === "confirmed" ? "Confirm" : action === "delivered" ? "Mark Delivered" : "Cancel"}
                    </button>
                  ))}
                </div>
              )}

              {user.role === "buyer" && order.status === "pending" && (
                <div className="card-order" style={{ marginTop: "0.75rem" }}>
                  <button className="btn btn-secondary" onClick={() => handleStatusChange(order.id, "cancelled")}>
                    Cancel Order
                  </button>
                </div>
              )}

              {actionStatus[order.id] && actionStatus[order.id] !== "updating" && (
                <p className="order-status error">{actionStatus[order.id]}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}