const express = require("express");
const { scrapandStoreJobs, getJobs, getJobById } = require("./job.controller");

const router = express.Router();

router.post("/scrape", scrapandStoreJobs);
router.get("/", getJobs);
router.get("/:jobId", getJobById);

module.exports = router;
