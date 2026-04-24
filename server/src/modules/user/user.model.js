let mongoose = require("mongoose");
let user_schema = mongoose.Schema(
  {
    profile_img_: { type: Object, default: null },
    name: { type: String, required: true },
    email: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    profile: {
      experience: { type: String, default: "" },
      education: { type: Array, default: [] },
      project: { type: Array, default: [] },
      skills: { type: Array, default: [] },
      linkedin_link: { type: String, default: "" },
      leetcode_link: { type: String, default: "" },
      instagram_link: { type: String, default: "" },
      facebook_link: { type: String, default: "" },
      youtube_link: { type: String, default: "" },
      twitter_x_link: { type: String, default: "" },
      github_link: { type: String, default: "" },
      website_link: { type: String, default: "" },
      social_links: { type: [Object], default: [] },
      achievements: { type: [Object], default: [] },
    },
    isblock: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);
const user_Model = mongoose.model("user_", user_schema);
module.exports = user_Model;

