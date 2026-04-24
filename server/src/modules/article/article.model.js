let mongoose = require("mongoose");

let article_schema = mongoose.Schema(
  {
    profile_img_: { type: Object, default: null },
    title: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    article_content: { type: Object, default: null },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    likes: {
      type: [String],
      default: [],
    },
    dislikes: {
      type: [String],
      default: [],
    },
    thumbnail: {
      type: Object,
      required: false,
      default: null,
    },
    saved_art_by: {
      type: [String],
      default: [],
    },
    total_comments: { type: Number, default: 0 },
    creator_name: { type: String, default: "" },
    creator_username: { type: String, default: "", required: true },
    creator_id: { type: String, default: "", required: true, index: true },
    isApproved: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true },
    isDraft: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

article_schema.index({ createdAt: -1 });
article_schema.index({ title: "text", description: "text" });

const article_Model = mongoose.model("articles_", article_schema);
module.exports = article_Model;
