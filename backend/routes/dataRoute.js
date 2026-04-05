const express = require("express");
const router = express.Router();

const DataController = require("../controller/dataController");

router.get("/filter/search", DataController.filter);
router.get("/region/:region", DataController.getByRegion);
router.get("/year/:year", DataController.getByYear);

router.get("/region-year-level", DataController.getRegionYearLevel);

router.get("/:id", DataController.getById);
router.get("/", DataController.getAll);

router.post("/", DataController.create);
router.delete("/:id", DataController.delete);
router.delete("/year/:year", DataController.deleteByYear);

module.exports = router;