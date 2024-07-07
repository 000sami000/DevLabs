let mongoose = require("mongoose");
let user_schema = mongoose.Schema(
  {
    // profile_img_:{type:String,default:""},
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    profile: {
      experience: { type: String, default: "" },
      education: { type: Array },
      project: { type: Array },
      skills: { type: Array },
    },
    isban: { 
        type: Boolean, default: false 
    },
  },
  { timestamps: true }
);
const user_Model = mongoose.model("user_", user_schema);
module.exports = user_Model;
