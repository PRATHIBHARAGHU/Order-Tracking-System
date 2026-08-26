import { useEffect, useState } from "react";

function App() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/orders")
      .then((res) => res.json())
      .then(setOrders)
      .catch(console.error);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f4f6f8",
      padding: "40px",
      fontFamily: "Arial, sans-serif"
    }}>
      <h1> Order Tracking System</h1>
      <p style={{ color: "#666" }}>
        Real-time order management dashboard
      </p>

      <div style={{
        background: "white",
        padding: "24px",
        borderRadius: "12px",
        marginTop: "30px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
      }}>
        <h2>Orders</h2>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "18px",
                marginTop: "15px"
              }}
            >
              <strong>{order.order_number}</strong>

              <p>Customer: {order.customer_name}</p>
              <p>Email: {order.customer_email}</p>

              <span style={{
                background: "#e8f5e9",
                padding: "6px 12px",
                borderRadius: "20px",
                fontWeight: "bold"
              }}>
                {order.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;