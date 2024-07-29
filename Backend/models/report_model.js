let mongoose = require("mongoose");
let report_schema = mongoose.Schema( {
    content_creator_id:{type:String,require:true},
    content_creator_username:{type:String,require:true},
    reported_content:{type:String,require:true},
    report_content: {type: String, require: true },
    report_type:{type:String,required:true},
    type_id:{type:String,required:true},
    reporter_username:{type:String,require:true},
    reporter_id:{type:String,require:true},

  },{ timestamps: true });
const report_Model = mongoose.model("reports_", report_schema);
module.exports = report_Model;
