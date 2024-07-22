let mongoose = require("mongoose");
let single_notif={
  content_creator_id:"",
  

}
let user_schema = mongoose.Schema(
  {
    profile_img_:{type:Object,default:null},
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    profile: {
      experience: { type: String, default: "" },
      education: { type: Array,default:[] },
      project: { type: Array ,default:[]},
      skills: { type: Array ,default:[]},
    },
    isblock: { 
        type: Boolean, default: false 
    },
    role:{
      type: String,default:"user"
    },
    notifications:{type:[Object],default:[]}
  },
  { timestamps: true }
);
const user_Model = mongoose.model("user_", user_schema);
module.exports = user_Model;
