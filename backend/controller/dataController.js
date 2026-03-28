const DataService = require("../service/dataService");

const DataController = {
  // GET /api/regional-data
  getAll: async (req, res) => {
    try {
      const data = await DataService.getAllData();
      res.json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // GET /api/regional-data/:id
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await DataService.getDataById(id);
      res.json(data);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  // GET /api/regional-data/region/:region
  getByRegion: async (req, res) => {
    try {
      const { region } = req.params;
      const data = await DataService.getByRegion(region);
      res.json(data);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  // GET /api/regional-data/year/:year
  getByYear: async (req, res) => {
    try {
      const { year } = req.params;
      const data = await DataService.getByYear(year);
      res.json(data);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  },

  // GET /api/regional-data/filter?region=NCR&year=2023
  filter: async (req, res) => {
    try {
      const { region, year } = req.query;

      const data = await DataService.filterData({
        region,
        year,
      });

      res.json(data);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // POST /api/regional-data
  create: async (req, res) => {
    try {
      const result = await DataService.createData(req.body);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // DELETE /api/regional-data/:id
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const result = await DataService.deleteData(id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = DataController;