const DataModel = require("../models/dataModel");

const DataService = {
  // Get all data
  getAllData: async () => {
    const data = await DataModel.getAll();

    if (!data || data.length === 0) {
      throw new Error("No regional data found");
    }

    return data;
  },

  // Get single data
  getDataById: async (id) => {
    if (!id) {
      throw new Error("ID is required");
    }

    const data = await DataModel.getById(id);

    if (!data) {
      throw new Error("Data not found");
    }

    return data;
  },

  // Get by region
  getByRegion: async (region) => {
    if (!region) {
      throw new Error("Region is required");
    }

    const data = await DataModel.getByRegion(region);

    if (!data || data.length === 0) {
      throw new Error("No data found for this region");
    }

    return data;
  },

  // Get by year
  getByYear: async (year) => {
    if (!year) {
      throw new Error("Year is required");
    }

    const data = await DataModel.getByYear(year);

    if (!data || data.length === 0) {
      throw new Error("No data found for this year");
    }

    return data;
  },

  // Filter logic
  filterData: async ({ region, year }) => {
    if (!region && !year) {
      throw new Error("At least one filter (region or year) is required");
    }

    const data = await DataModel.filter({ region, year });

    if (!data || data.length === 0) {
      throw new Error("No matching data found");
    }

    return data;
  },

  // Create data (optional)
  createData: async (payload) => {
    const requiredFields = [
      "region",
      "region_name",
      "year",
      "ave_income",
      "expenditure",
      "unemployment_rate",
      "mean_years_education",
      "population_size",
      "poverty_level",
    ];

    for (let field of requiredFields) {
      if (!payload[field]) {
        throw new Error(`${field} is required`);
      }
    }

    const id = await DataModel.create(payload);

    return {
      message: "Data created successfully",
      id,
    };
  },

  // Delete data
  deleteData: async (id) => {
    if (!id) {
      throw new Error("ID is required");
    }

    await DataModel.delete(id);

    return {
      message: "Data deleted successfully",
    };
  },
};

module.exports = DataService;