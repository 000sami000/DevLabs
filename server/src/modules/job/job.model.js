const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    job_title: { type: String, required: true },
    job_role: { type: String, default: "Not specified" },
    employer_name: { type: String, required: true },
    employer_logo: { type: String, default: "" },
    source_logo: { type: String, default: "" },

    job_description: { type: String, default: "" },
    job_requirements: { type: [String], default: [] },
    job_responsibilities: { type: [String], default: [] },

    job_link: { type: String, required: true, index: true },
    // Legacy field kept for backward compatibility with existing unique index/data.
    job_apply_link: { type: String, default: "" },

    job_city: { type: String, default: "" },
    job_state: { type: String, default: "" },
    job_country: { type: String, default: "US" },
    job_latitude: { type: Number, default: null },
    job_longitude: { type: Number, default: null },

    job_posted_at_datetime_utc: { type: Date, default: Date.now },
    job_employment_type: { type: String, default: "Not specified" },
    job_type: { type: String, default: "Not specified" },
    job_work_mode: { type: String, default: "Not specified" },
    job_is_remote: { type: Boolean, default: false },
    job_salary: { type: String, default: "" },

    job_highlights: {
      Qualifications: { type: [String], default: [] },
      Responsibilities: { type: [String], default: [] },
    },

    source: { type: String, enum: ["indeed", "linkedin", "glassdoor", "other"], required: true },
    source_url: { type: String, default: "" },
    source_job_id: { type: String, default: "" },

    scraped_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Keep only fresh jobs in storage (about one month).
jobSchema.index({ scraped_at: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

module.exports = mongoose.model("Job", jobSchema);
