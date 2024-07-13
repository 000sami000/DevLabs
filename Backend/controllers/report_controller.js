const { default: mongoose } = require("mongoose");

const report_Model = require("../models/report_model");

const create_report = async (req, res) => {
  console.log("this is create_report")
     req.body.reporter_id=req.USER_ID;
    try {
        const newReport = new report_Model(req.body);
        const savedReport = await newReport.save();
        res.status(200).json(savedReport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const get_reports = async (req, res) => {
    
    const page=Number(Number(req.query.page)+1)||1
    console.log('=====',page)
    const skip=(page-1)*5;
    try {
      const total = await report_Model.countDocuments({});
      const reports = await report_Model.find().sort({ _id: -1 }).limit(5).skip(skip);
      // console.log(reports)
      res.status(200).json({reports,total});
    } catch (err) {
      // console.log(err)
      res.status(404).json({ message: err });
    }
  };
module.exports={create_report,get_reports}
