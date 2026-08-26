const pool = require("../config/database");

const createOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { order_number, customer_id } = req.body;

    if (!order_number || !customer_id) {
      return res.status(400).json({
        message: "order_number and customer_id are required",
      });
    }

    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders (order_number, customer_id)
       VALUES ($1, $2)
       RETURNING *`,
      [order_number, customer_id]
    );

    const order = orderResult.rows[0];

    await client.query(
      `INSERT INTO order_status_history
       (order_id, from_status, to_status, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [order.id, null, order.status, customer_id]
    );

    await client.query("COMMIT");

    res.status(201).json(order);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create order error:", error);

    res.status(500).json({
      message: "Failed to create order",
      error:
        error.code === "23505"
          ? "Order number already exists"
          : error.message,
    });
  } finally {
    client.release();
  }
};

const getOrders = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id,
        o.order_number,
        o.status,
        o.created_at,
        o.updated_at,
        u.name AS customer_name,
        u.email AS customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      ORDER BY o.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        o.*,
        u.name AS customer_name,
        u.email AS customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get order error:", error);

    res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { status, changed_by } = req.body;

    const validStatuses = [
      "PLACED",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
      });
    }

    if (!changed_by) {
      return res.status(400).json({
        message: "changed_by is required",
      });
    }

    await client.query("BEGIN");

    const currentOrderResult = await client.query(
      `SELECT status
       FROM orders
       WHERE id = $1
       FOR UPDATE`,
      [id]
    );

    if (currentOrderResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Order not found",
      });
    }

    const currentStatus = currentOrderResult.rows[0].status;

    const orderResult = await client.query(
      `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    await client.query(
      `
      INSERT INTO order_status_history
      (order_id, from_status, to_status, changed_by)
      VALUES ($1, $2, $3, $4)
      `,
      [id, currentStatus, status, changed_by]
    );

    await client.query("COMMIT");

    res.json(orderResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update order status error:", error);

    res.status(500).json({
      message: "Failed to update order status",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        order_id,
        from_status,
        to_status,
        changed_by,
        changed_at
      FROM order_status_history
      WHERE order_id = $1
      ORDER BY changed_at ASC
      `,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get order history error:", error);

    res.status(500).json({
      message: "Failed to fetch order history",
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderHistory,
};
