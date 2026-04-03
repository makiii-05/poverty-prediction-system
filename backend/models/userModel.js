const db = require("../config/db");
const bcrypt = require("bcrypt");

const User = {

  // Create User / Admin
  create: async ({ name, address, email, password, role = "user", username }) => {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users 
      (name, address, email, password, role, username) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [name, address, email, hashedPassword, role, username]
    );

    return result.insertId;
  },

  // Find by email
  findByEmail: async (email) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows[0];
  },

  // Find by username
  findByUsername: async (username) => {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    return rows[0];
  },

  // Check username
  checkUsername: async (username) => {
    const [rows] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    return rows.length > 0;
  },

  // Find by ID
  findById: async (id) => {
    const [rows] = await db.query(
      "SELECT id, name, email, role, username, address FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  // Find user with password by ID
  findByIdWithPassword: async (id) => {
    const [rows] = await db.query(
      "SELECT id, name, email, role, username, address, password FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  // Check email
  checkEmail: async (email) => {
    const [rows] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    return rows.length > 0;
  },

  // Get all users
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT id, name, email, role, username, created_at FROM users"
    );
    return rows;
  },

  // Update user
  update: async (id, { name, address, username }) => {
    const [result] = await db.query(
      `UPDATE users 
       SET name = ?, address = ?, username = ?
       WHERE id = ?`,
      [name, address, username, id]
    );
    return result.affectedRows;
  },

  // Update password
  updatePassword: async (id, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const [result] = await db.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );

    return result.affectedRows;
  },

  // Delete user
  delete: async (id) => {
    const [result] = await db.query(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

};

module.exports = User;