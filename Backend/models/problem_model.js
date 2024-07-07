let mongoose = require("mongoose");
let problem_schema = mongoose.Schema({
  title: { type: String, required: true },
  problem_content: { type: String, required: true },
  tags: [String],
  likes: {
    type: [String],
    default: [],
  },

  total_sol: {
    type: [String],
    default: [],
  },
  creator_username: { type: String,default :"" , required: true},
  creator_id: { type: String ,default :"", required: true},
  isApproved: { type: Boolean, default: false },
},{timestamps: true});
const problem_Model = mongoose.model("problems_", problem_schema);
module.exports = problem_Model;
