const db = require("../config/db");

const DataModel = {
  // Get all regional data
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT 
        id,
        region,
        region_name,
        year,
        ave_income,
        expenditure,
        unemployment_rate,
        mean_years_education,
        population_size,
        poverty_level
      FROM regional_data
      ORDER BY year ASC, region_name ASC
    `);
    return rows;
  },

  // Get by ID
  getById: async (id) => {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        region,
        region_name,
        year,
        ave_income,
        expenditure,
        unemployment_rate,
        mean_years_education,
        population_size,
        poverty_level
      FROM regional_data
      WHERE id = ?
      `,
      [id]
    );
    return rows[0];
  },

  // Get by region
  getByRegion: async (region) => {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        region,
        region_name,
        year,
        ave_income,
        expenditure,
        unemployment_rate,
        mean_years_education,
        population_size,
        poverty_level
      FROM regional_data
      WHERE region = ? OR region_name = ?
      ORDER BY year ASC
      `,
      [region, region]
    );
    return rows;
  },

  // Get by year
  getByYear: async (year) => {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        region,
        region_name,
        year,
        ave_income,
        expenditure,
        unemployment_rate,
        mean_years_education,
        population_size,
        poverty_level
      FROM regional_data
      WHERE year = ?
      ORDER BY region_name ASC
      `,
      [year]
    );
    return rows;
  },

  // Filter by region and/or year
  filter: async ({ region, year }) => {
    let query = `
      SELECT 
        id,
        region,
        region_name,
        year,
        ave_income,
        expenditure,
        unemployment_rate,
        mean_years_education,
        population_size,
        poverty_level
      FROM regional_data
      WHERE 1 = 1
    `;

    const values = [];

    if (region) {
      query += ` AND (region = ? OR region_name = ?)`;
      values.push(region, region);
    }

    if (year) {
      query += ` AND year = ?`;
      values.push(year);
    }

    query += ` ORDER BY year ASC, region_name ASC`;

    const [rows] = await db.query(query, values);
    return rows;
  },

  // Create one row manually if needed
  create: async ({
    region,
    region_name,
    year,
    ave_income,
    expenditure,
    unemployment_rate,
    mean_years_education,
    population_size,
    poverty_level,
  }) => {
    const [result] = await db.query(
      `
      INSERT INTO regional_data (
        region,
        region_name,
        year,
        ave_income,
        expenditure,
        unemployment_rate,
        mean_years_education,
        population_size,
        poverty_level
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        region,
        region_name,
        year,
        ave_income,
        expenditure,
        unemployment_rate,
        mean_years_education,
        population_size,
        poverty_level,
      ]
    );

    return result.insertId;
  },

  // Delete one row
  delete: async (id) => {
    const [result] = await db.query(
      `DELETE FROM regional_data WHERE id = ?`,
      [id]
    );
    return result;
  },

  // Delete by year
  deleteByYear: async (year) => {
    const [result] = await db.query(
      `DELETE FROM regional_data WHERE year = ?`,
      [year]
    );
    return result
  }

};

module.exports = DataModel;