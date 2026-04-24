const report_Model = require("./report.model");
const user_Model = require("../user/user.model");
const { createNotificationForUser } = require("../notification/notification.service");

const create_report = async (req, res) => {
  req.body.reporter_id = req.USER_ID;

  try {
    const newReport = new report_Model(req.body);
    const savedReport = await newReport.save();
    const reporter = await user_Model
      .findById({ _id: req.USER_ID })
      .select("_id name username profile_img_")
      .lean();

    const notification = {
      notific_id: savedReport.createdAt + Math.floor(Math.random() * 201),
      notifi_type: "report_create",
      report_content: savedReport.report_content,
      report_id: savedReport._id,
      reporter_username: reporter?.username || savedReport.reporter_username,
      reporter_id: savedReport.reporter_id,
      report_type: savedReport.report_type,
      type_id: savedReport.type_id,
      content_creator_id: savedReport.content_creator_id,
      content_creator_username: savedReport.content_creator_username,
      reported_content: savedReport.reported_content,
      actor_id: savedReport.reporter_id,
      actor_name: reporter?.name || reporter?.username || savedReport.reporter_username,
      actor_username: reporter?.username || savedReport.reporter_username,
      actor_profile_img_: reporter?.profile_img_ || null,
      createdAt: savedReport.createdAt,
    };

    await createNotificationForUser(savedReport.content_creator_id, notification);

    res.status(200).json(savedReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const get_reports = async (req, res) => {
  try {
    const reports = await report_Model.find({ report_type: req.query.report_type }).sort({ _id: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

const delete_report = async (req, res) => {
  const { r_id } = req.params;
  try {
    await report_Model.deleteOne({ _id: r_id }).sort({ _id: -1 });
    const reports = await report_Model.find({ report_type: req.query.report_type }).sort({ _id: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

module.exports = { create_report, get_reports, delete_report };


