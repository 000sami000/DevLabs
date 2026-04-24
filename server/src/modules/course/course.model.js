const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["none", "image", "video"], default: "none" },
    url: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    eyebrow: { type: String, default: "", trim: true },
    content: { type: String, default: "" },
    startMedia: {
      type: mediaSchema,
      default: () => ({ kind: "none", url: "" }),
    },
    endMedia: {
      type: mediaSchema,
      default: () => ({ kind: "none", url: "" }),
    },
  },
  { _id: true }
);

const subtopicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    sections: { type: [sectionSchema], default: [] },
  },
  { _id: true }
);

const topicSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    subtopics: { type: [subtopicSchema], default: [] },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    banner: {
      type: Object,
      default: null,
    },
    thumbnail: {
      type: Object,
      default: null,
    },
    title: { type: String, default: "", required: true, trim: true },
    description: { type: String, default: "", required: true, trim: true },
    topics: { type: [topicSchema], default: [] },
    cource_data: { type: mongoose.Schema.Types.Mixed, default: null },
    starred_by: {
      type: [String],
      default: [],
    },
    total_stars: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const cource_Model = mongoose.model("cource_", courseSchema);

module.exports = cource_Model;