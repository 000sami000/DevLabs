const { default: mongoose } = require("mongoose");

const report_Model = require("../models/report_model");
const user_Model = require("../models/user_model");

const create_report = async (req, res) => {
  console.log("this is create_report")
     req.body.reporter_id=req.USER_ID;
    try {
      console.log("report--body",req.body)
        const newReport = new report_Model(req.body);

        const savedReport = await newReport.save();

        const user=await user_Model.findById({_id:savedReport.content_creator_id})

        const notification = {
          notific_id: savedReport.createdAt + Math.floor(Math.random() * 201),
          notifi_type: "report_create",
          report_content: savedReport.report_content,
          report_id: savedReport._id,
          reporter_username: savedReport.reporter_username,
          reporter_id: savedReport.reporter_id,
          report_type:savedReport.report_type,
          type_id:savedReport.type_id,
          content_creator_id:savedReport.content_creator_id,
          content_creator_username:savedReport.content_creator_username,
          reported_content:savedReport.reported_content,
          createdAt:savedReport.createdAt
        };
        user.notifications.unshift(notification);
        await user.save();
    
        res.status(200).json(savedReport);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
const get_reports = async (req, res) => {
    

    try {
       console.log("??????",req.query.report_type)
      const reports = await report_Model.find({report_type:req.query.report_type}).sort({ _id: -1 });
      // console.log(reports)
      res.status(200).json(reports);
    } catch (err) {
      // console.log(err)
      res.status(404).json({ message: err });
    }
  };


  const delete_report = async (req, res) => {
       
    const {r_id}=req.params;
  console.log("?????",r_id);
    try {
       console.log("??????",req.query.report_type)
      const deletedreport = await report_Model.deleteOne({_id:r_id}).sort({ _id: -1 });
      const reports = await report_Model.find({report_type:req.query.report_type}).sort({ _id: -1 });
      // console.log(reports)
      res.status(200).json(reports);
    } catch (err) {
      // console.log(err)
      res.status(404).json({ message: err });
    }
  };
module.exports={create_report,get_reports,delete_report}
