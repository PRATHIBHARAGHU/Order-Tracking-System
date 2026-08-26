const pool = require("../config/database");

const createUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, phone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, phone || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      message: "Failed to create user",
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      message: "Failed to fetch users",
    });
  }
};

module.exports = {
  createUser,
  getUsers,
};