import React, { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import {
  MdAddBox,
  MdEdit,
  MdClose,
  MdSchool,
  MdWork,
  MdCode,
  MdEmojiEvents,
  MdLink,
  MdPersonOutline,
  MdOutlineWorkspacePremium,
  MdOutlineArticle,
} from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import {
  FaFacebookF,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { SiLeetcode, SiUpwork } from "react-icons/si";
import { FiExternalLink, FiGlobe, FiLink, FiSave, FiPhone, FiMail } from "react-icons/fi";
import { useSelector } from "react-redux";
import Loader from "../../Loader";
import { fetch_userProfile, update_userProfile } from "../../../api";
import { useParams } from "react-router-dom";
import getAssetUrl from "../../../utils/getAssetUrl";

// ----- Normalization helpers (unchanged) -----
const normalizeText = (value) => String(value || "").trim();

const normalizeSocialLinks = (profile = {}) => {
  const dynamic = Array.isArray(profile?.social_links)
    ? profile.social_links
        .map((item) => ({
          label: normalizeText(item?.label || item?.name),
          url: normalizeText(item?.url || item?.link),
        }))
        .filter((item) => item.label && item.url)
    : [];

  if (dynamic.length > 0) return dynamic;

  const fallback = [
    { label: "LinkedIn", url: profile?.linkedin_link },
    { label: "LeetCode", url: profile?.leetcode_link },
    { label: "Instagram", url: profile?.instagram_link },
    { label: "Facebook", url: profile?.facebook_link },
    { label: "YouTube", url: profile?.youtube_link },
    { label: "X", url: profile?.twitter_x_link },
    { label: "GitHub", url: profile?.github_link },
  ]
    .map((item) => ({ label: item.label, url: normalizeText(item.url) }))
    .filter((item) => item.url);
  return fallback;
};

const normalizeAchievements = (profile = {}) => {
  if (!Array.isArray(profile?.achievements)) return [];
  return profile.achievements
    .map((item) => ({
      title: normalizeText(item?.title),
      description: normalizeText(item?.description || item?.summary),
      link: normalizeText(item?.link || item?.url),
    }))
    .filter((item) => item.title || item.description || item.link);
};

const normalizeProfile = (profile = {}) => ({
  experience: profile?.experience || "",
  education: Array.isArray(profile?.education) ? profile.education : [],
  project: Array.isArray(profile?.project) ? profile.project : [],
  skills: Array.isArray(profile?.skills) ? profile.skills : [],
  linkedin_link: profile?.linkedin_link || "",
  leetcode_link: profile?.leetcode_link || "",
  instagram_link: profile?.instagram_link || "",
  facebook_link: profile?.facebook_link || "",
  youtube_link: profile?.youtube_link || "",
  twitter_x_link: profile?.twitter_x_link || "",
  github_link: profile?.github_link || "",
  website_link: profile?.website_link || "",
  social_links: normalizeSocialLinks(profile),
  achievements: normalizeAchievements(profile),
});

const getSocialIcon = (label = "", url = "") => {
  const source = `${String(label).toLowerCase()} ${String(url).toLowerCase()}`;
  if (source.includes("linkedin")) return <FaLinkedin />;
  if (source.includes("leetcode")) return <SiLeetcode />;
  if (source.includes("instagram") || source.includes("insta")) return <FaInstagram />;
  if (source.includes("facebook") || source.includes("fb")) return <FaFacebookF />;
  if (source.includes("youtube")) return <FaYoutube />;
  if (source.includes("twitter") || source.includes("x.com")) return <FaTwitter />;
  if (source.includes("github")) return <FaGithub />;
  if (source.includes("upwork")) return <SiUpwork />;
  if (source.includes("http") || source.includes("www") || source.includes("website")) return <FiGlobe />;
  return <FiLink />;
};

const buildVisibleSocialItems = (profile) => {
  const dynamic = Array.isArray(profile?.social_links)
    ? profile.social_links
        .map((item, index) => ({
          key: `${item?.label || "link"}-${index}`,
          label: normalizeText(item?.label || item?.name) || "Link",
          value: normalizeText(item?.url || item?.link),
        }))
        .filter((item) => item.value)
    : [];

  if (dynamic.length > 0) return dynamic;

  return [
    { key: "linkedin_link", label: "LinkedIn", value: profile?.linkedin_link },
    { key: "leetcode_link", label: "LeetCode", value: profile?.leetcode_link },
    { key: "instagram_link", label: "Instagram", value: profile?.instagram_link },
    { key: "facebook_link", label: "Facebook", value: profile?.facebook_link },
    { key: "youtube_link", label: "YouTube", value: profile?.youtube_link },
    { key: "twitter_x_link", label: "X", value: profile?.twitter_x_link },
    { key: "github_link", label: "GitHub", value: profile?.github_link },
    { key: "website_link", label: "Website", value: profile?.website_link },
  ]
    .map((item) => ({ ...item, value: normalizeText(item.value) }))
    .filter((item) => item.value);
};

// ----- Premium UI Components -----
const SectionHeader = ({ icon, title, badge }) => (
  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--app-border)]">
    <div className="flex items-center gap-2">
      <span className="text-[var(--app-accent)] text-xl">{icon}</span>
      <h3 className="text-lg font-semibold text-[var(--app-text)]">{title}</h3>
    </div>
    {badge && (
      <span className="text-xs px-2 py-1 rounded-full bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-medium">
        {badge}
      </span>
    )}
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-8 px-4 bg-[var(--app-bg-soft)] rounded-xl border border-dashed border-[var(--app-border)]">
    <p className="text-[var(--app-text-muted)] text-sm">{message}</p>
  </div>
);

const StatCard = ({ count, label, icon }) => (
  <div className="bg-[var(--app-bg-soft)] rounded-xl p-3 text-center border border-[var(--app-border)]">
    <div className="text-2xl font-bold text-[var(--app-accent)]">{count}</div>
    <div className="text-xs text-[var(--app-text-muted)] flex items-center justify-center gap-1 mt-1">
      {icon}
      <span>{label}</span>
    </div>
  </div>
);

// ----- Main Component -----
function User_profile() {
  const { id } = useParams();
  const [temp_data, settemp_data] = useState(normalizeProfile());
  const user = useSelector((state) => state.userReducer.current_user);
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [Profile_info, setProfile_info] = useState({});
  const [Editwindow, setEditwindow] = useState(false);
  const [activeTab, setActiveTab] = useState("professional"); // tabs: professional, eduProjects, skillsAchievements, social
  
  // Local state for adding new items
  const [obj, setobj] = useState({
    edu: "",
    pro: { name: "", des: "" },
    sk: "",
    social: { label: "", url: "" },
    achievement: { title: "", description: "", link: "" },
  });

  const fetch_profile = async (profileId) => {
    try {
      setloading(true);
      const { data } = await fetch_userProfile(profileId);
      setProfile_info(data);
      settemp_data(normalizeProfile(data.profile));
    } catch (err) {
      seterror(err);
      console.error("profile fetch error", err);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    if (id) fetch_profile(id);
  }, [id]);

  const update_profile = async (profileId, profile_obj) => {
    try {
      setloading(true);
      const { data } = await update_userProfile(profileId, profile_obj);
      setProfile_info((prev) => ({ ...prev, profile: data }));
      settemp_data(normalizeProfile(data));
    } catch (err) {
      seterror(err);
      console.error("profile update error", err);
    } finally {
      setloading(false);
    }
  };

  const update_profileinfo_handler = () => {
    const targetUserId = Profile_info?._id || user?._id;
    if (targetUserId) {
      update_profile(targetUserId, temp_data);
    } else {
      setProfile_info((prev) => ({ ...prev, profile: temp_data }));
    }
    setEditwindow(false);
  };

  const Cancel_update = () => {
    settemp_data(normalizeProfile(Profile_info.profile));
    setEditwindow(false);
  };

  const visibleSocialItems = useMemo(
    () => buildVisibleSocialItems(Profile_info.profile),
    [Profile_info.profile]
  );

  const achievements = useMemo(() => {
    if (!Array.isArray(Profile_info?.profile?.achievements)) return [];
    return Profile_info.profile.achievements.filter(
      (item) => item?.title || item?.description || item?.link
    );
  }, [Profile_info?.profile?.achievements]);

  // Stats for profile header
  const stats = useMemo(() => ({
    projects: Profile_info.profile?.project?.length || 0,
    skills: Profile_info.profile?.skills?.length || 0,
    achievements: achievements.length,
  }), [Profile_info.profile, achievements]);

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded-xl shadow-lg border border-red-200">
          {error?.response?.data?.message || error?.message || "Something went wrong"}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  // Tabs configuration
  const tabs = [
    { id: "professional", label: "Professional", icon: <MdPersonOutline /> },
    { id: "eduProjects", label: "Education & Projects", icon: <MdSchool /> },
    { id: "skillsAchievements", label: "Skills & Achievements", icon: <MdCode /> },
    { id: "social", label: "Social Links", icon: <MdLink /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      {/* Profile Header Card - Premium Design */}
      <div className="bg-[var(--app-bg-panel)] rounded-2xl shadow-xl overflow-hidden border border-[var(--app-border)] mb-8 relative transition-all duration-300 hover:shadow-2xl">
        {/* Cover Image with Overlay Gradient */}
        <div className="relative h-32 bg-gradient-to-r from-[var(--app-accent)] via-[var(--app-accent-dark)] to-[var(--app-accent)] opacity-90">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--app-bg-panel)] to-transparent"></div>
        </div>
        
        {/* Avatar and Main Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-wrap items-end justify-between -mt-12">
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl border-4 border-[var(--app-bg-panel)] bg-cover bg-center bg-no-repeat shadow-xl overflow-hidden"
                  style={{
                    backgroundImage: `url(${
                      user?.profile_img_
                        ? getAssetUrl(user.profile_img_)
                        : "/default_profile.jpg"
                    })`,
                    backgroundSize: "cover",
                  }}
                />
                <div className="absolute -bottom-1 -right-1 bg-[var(--app-accent)] rounded-full p-1 shadow-md">
                  <MdEdit size={12} className="text-white" />
                </div>
              </div>
              <div className="mb-2">
                <h1 className="text-2xl font-bold text-[var(--app-text)] flex items-center gap-2">
                  {Profile_info?.name || "User"}
                  <span className="text-xs bg-[var(--app-accent)]/10 text-[var(--app-accent)] px-2 py-0.5 rounded-full">Member</span>
                </h1>
                <p className="text-[var(--app-text-muted)] text-sm flex items-center gap-1 mt-1">
                  <FiMail size={12} /> {Profile_info?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditwindow(true)}
              className="flex items-center gap-2 bg-[var(--app-accent)] hover:bg-[var(--app-accent-dark)] text-white px-6 py-2.5 rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-xl font-medium"
            >
              <MdEdit size={18} />
              Edit Profile
            </button>
          </div>
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <StatCard count={stats.projects} label="Projects" icon={<MdWork size={12} />} />
            <StatCard count={stats.skills} label="Skills" icon={<MdCode size={12} />} />
            <StatCard count={stats.achievements} label="Achievements" icon={<MdEmojiEvents size={12} />} />
          </div>
        </div>
      </div>

      {/* Profile Content Grid - Premium Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Experience Card */}
          <div className="bg-[var(--app-bg-panel)] rounded-xl p-6 border border-[var(--app-border)] shadow-md hover:shadow-lg transition-shadow duration-300">
            <SectionHeader icon={<MdWork />} title="Experience" badge="Professional" />
            {Profile_info.profile?.experience ? (
              <div className="prose prose-sm max-w-none text-[var(--app-text)] leading-relaxed whitespace-pre-wrap">
                {Profile_info.profile.experience}
              </div>
            ) : (
              <EmptyState message="No experience added yet. Click Edit to share your professional journey." />
            )}
          </div>

          {/* Education Card */}
          <div className="bg-[var(--app-bg-panel)] rounded-xl p-6 border border-[var(--app-border)] shadow-md hover:shadow-lg transition-shadow duration-300">
            <SectionHeader icon={<MdSchool />} title="Education" badge="Academic" />
            {Profile_info.profile?.education?.length > 0 ? (
              <div className="space-y-3">
                {Profile_info.profile.education.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--app-bg-soft)] transition">
                    <div className="w-2 h-2 rounded-full bg-[var(--app-accent)] mt-2"></div>
                    <span className="text-[var(--app-text)]">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No education added yet." />
            )}
          </div>

          {/* Skills Card */}
          <div className="bg-[var(--app-bg-panel)] rounded-xl p-6 border border-[var(--app-border)] shadow-md hover:shadow-lg transition-shadow duration-300">
            <SectionHeader icon={<MdCode />} title="Skills" badge="Competencies" />
            {Profile_info.profile?.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {Profile_info.profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-gradient-to-r from-[var(--app-accent)]/10 to-[var(--app-accent)]/5 text-[var(--app-text)] px-3 py-1.5 rounded-full text-sm font-medium border border-[var(--app-accent)]/20 hover:border-[var(--app-accent)]/40 transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <EmptyState message="No skills listed yet." />
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Projects Card */}
          <div className="bg-[var(--app-bg-panel)] rounded-xl p-6 border border-[var(--app-border)] shadow-md hover:shadow-lg transition-shadow duration-300">
            <SectionHeader icon={<MdOutlineArticle />} title="Projects" badge="Portfolio" />
            {Profile_info.profile?.project?.length > 0 ? (
              <div className="space-y-4">
                {Profile_info.profile.project.map((proj, idx) => (
                  <div key={idx} className="group border-l-2 border-[var(--app-accent)] pl-4 py-2 hover:bg-[var(--app-bg-soft)] rounded-r-lg transition">
                    <h4 className="font-semibold text-[var(--app-text)] group-hover:text-[var(--app-accent)] transition">
                      {proj.Project_title}
                    </h4>
                    <p className="text-[var(--app-text-muted)] text-sm mt-1 leading-relaxed">
                      {proj.Project_exp}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No projects added." />
            )}
          </div>

          {/* Achievements Card */}
          <div className="bg-[var(--app-bg-panel)] rounded-xl p-6 border border-[var(--app-border)] shadow-md hover:shadow-lg transition-shadow duration-300">
            <SectionHeader icon={<MdEmojiEvents />} title="Achievements" badge="Recognitions" />
            {achievements.length > 0 ? (
              <div className="space-y-3">
                {achievements.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[var(--app-bg-soft)] rounded-lg p-4 transition-all hover:shadow-md hover:translate-x-1"
                  >
                    {item.title && (
                      <h4 className="font-semibold text-[var(--app-text)] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]"></span>
                        {item.title}
                      </h4>
                    )}
                    {item.description && (
                      <p className="text-sm text-[var(--app-text-muted)] mt-2 pl-3">
                        {item.description}
                      </p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--app-accent)] text-sm mt-3 hover:underline pl-3"
                      >
                        <FiExternalLink size={14} />
                        View credential
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No achievements added yet." />
            )}
          </div>

          {/* Social Links Card */}
          <div className="bg-[var(--app-bg-panel)] rounded-xl p-6 border border-[var(--app-border)] shadow-md hover:shadow-lg transition-shadow duration-300">
            <SectionHeader icon={<MdLink />} title="Social & Links" badge="Connect" />
            {visibleSocialItems.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {visibleSocialItems.map((item) => (
                  <a
                    key={item.key}
                    href={item.value}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--app-bg-soft)] text-[var(--app-text)] hover:bg-[var(--app-accent)] hover:text-white transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
                  >
                    {getSocialIcon(item.label, item.value)}
                    <span className="text-sm font-medium">{item.label}</span>
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState message="No social links added." />
            )}
          </div>
        </div>
      </div>

      {/* ==================== PREMIUM MODAL WITH TABS ==================== */}
      <Modal
        isOpen={Editwindow}
        onRequestClose={Cancel_update}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "var(--app-bg-panel)",
            border: "1px solid var(--app-border)",
            borderRadius: "1.5rem",
            padding: 0,
            width: "90vw",
            maxWidth: "1000px",
            height: "85vh",
            maxHeight: "750px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        {/* Fixed Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-[var(--app-border)] bg-[var(--app-bg-panel)] shrink-0">
          <div className="flex items-center gap-2">
            <MdOutlineWorkspacePremium className="text-[var(--app-accent)] text-2xl" />
            <h2 className="text-xl font-bold text-[var(--app-text)]">Edit Profile</h2>
          </div>
          <button
            onClick={Cancel_update}
            className="text-[var(--app-text-muted)] hover:text-red-500 transition p-1 rounded-full hover:bg-red-50"
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-3 border-b border-[var(--app-border)] bg-[var(--app-bg-panel)] shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--app-accent)] text-white shadow-md"
                  : "text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-bg-soft)]"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scroll">
          {/* Professional Tab */}
          {activeTab === "professional" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block font-semibold text-[var(--app-text)] mb-2 flex items-center gap-2">
                  <MdWork className="text-[var(--app-accent)]" />
                  Professional Experience
                </label>
                <textarea
                  value={temp_data.experience}
                  onChange={(e) => settemp_data({ ...temp_data, experience: e.target.value })}
                  rows={6}
                  className="w-full p-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)] transition"
                  placeholder="Describe your professional experience, roles, responsibilities, and achievements..."
                />
                <p className="text-xs text-[var(--app-text-muted)] mt-2">Markdown supported • {temp_data.experience.length} characters</p>
              </div>
            </div>
          )}

          {/* Education & Projects Tab */}
          {activeTab === "eduProjects" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Education Section */}
              <div>
                <label className="block font-semibold text-[var(--app-text)] mb-3 flex items-center gap-2">
                  <MdSchool className="text-[var(--app-accent)]" />
                  Education
                </label>
                <div className="space-y-3">
                  {temp_data.education?.map((edu, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[var(--app-bg-soft)] rounded-xl group">
                      <span className="flex-1 text-[var(--app-text)]">{edu}</span>
                      <button
                        onClick={() =>
                          settemp_data({
                            ...temp_data,
                            education: temp_data.education.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                      >
                        <TiDelete size={22} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <input
                    value={obj.edu}
                    onChange={(e) => setobj({ ...obj, edu: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                    placeholder="e.g., B.Sc. Computer Science, Stanford University, 2020"
                  />
                  <button
                    onClick={() => {
                      if (obj.edu.trim()) {
                        settemp_data({
                          ...temp_data,
                          education: [...temp_data.education, obj.edu.trim()],
                        });
                        setobj({ ...obj, edu: "" });
                      }
                    }}
                    className="px-4 py-2 bg-[var(--app-accent)] text-white rounded-xl hover:bg-[var(--app-accent-dark)] transition flex items-center gap-1"
                  >
                    <MdAddBox size={20} /> Add
                  </button>
                </div>
              </div>

              {/* Projects Section */}
              <div>
                <label className="block font-semibold text-[var(--app-text)] mb-3 flex items-center gap-2">
                  <MdOutlineArticle className="text-[var(--app-accent)]" />
                  Projects
                </label>
                <div className="space-y-4">
                  {temp_data.project?.map((proj, idx) => (
                    <div key={idx} className="p-4 bg-[var(--app-bg-soft)] rounded-xl border border-[var(--app-border)]">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[var(--app-text)]">{proj.Project_title}</h4>
                        <button onClick={() => settemp_data({ ...temp_data, project: temp_data.project.filter((_, i) => i !== idx) })}>
                          <TiDelete size={20} className="text-red-400 hover:text-red-600" />
                        </button>
                      </div>
                      <p className="text-sm text-[var(--app-text-muted)] leading-relaxed">{proj.Project_exp}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-3">
                  <input
                    value={obj.pro.name}
                    onChange={(e) => setobj({ ...obj, pro: { ...obj.pro, name: e.target.value } })}
                    className="w-full p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                    placeholder="Project title"
                  />
                  <textarea
                    value={obj.pro.des}
                    onChange={(e) => setobj({ ...obj, pro: { ...obj.pro, des: e.target.value } })}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                    placeholder="Project description, technologies used, your role..."
                  />
                  <button
                    onClick={() => {
                      if (obj.pro.name.trim() && obj.pro.des.trim()) {
                        settemp_data({
                          ...temp_data,
                          project: [...temp_data.project, { Project_title: obj.pro.name.trim(), Project_exp: obj.pro.des.trim() }],
                        });
                        setobj({ ...obj, pro: { name: "", des: "" } });
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-[var(--app-accent)]/10 text-[var(--app-accent)] font-medium hover:bg-[var(--app-accent)] hover:text-white transition flex items-center justify-center gap-2"
                  >
                    <MdAddBox size={20} /> Add Project
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Skills & Achievements Tab */}
          {activeTab === "skillsAchievements" && (
            <div className="space-y-8 animate-fadeIn">
              {/* Skills Section */}
              <div>
                <label className="block font-semibold text-[var(--app-text)] mb-3 flex items-center gap-2">
                  <MdCode className="text-[var(--app-accent)]" />
                  Skills
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {temp_data.skills?.map((skill, idx) => (
                    <span key={idx} className="bg-[var(--app-bg-soft)] px-3 py-1.5 rounded-full flex items-center gap-2 text-[var(--app-text)]">
                      {skill}
                      <TiDelete size={18} className="cursor-pointer text-red-400 hover:text-red-600" onClick={() => settemp_data({ ...temp_data, skills: temp_data.skills.filter((_, i) => i !== idx) })} />
                    </span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    value={obj.sk}
                    onChange={(e) => setobj({ ...obj, sk: e.target.value })}
                    className="flex-1 p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                    placeholder="Add a skill (e.g., React, Python, Leadership)"
                  />
                  <button
                    onClick={() => {
                      if (obj.sk.trim()) {
                        settemp_data({ ...temp_data, skills: [...temp_data.skills, obj.sk.trim()] });
                        setobj({ ...obj, sk: "" });
                      }
                    }}
                    className="px-4 py-2 bg-[var(--app-accent)] text-white rounded-xl hover:bg-[var(--app-accent-dark)] transition"
                  >
                    <MdAddBox size={20} />
                  </button>
                </div>
              </div>

              {/* Achievements Section */}
              <div>
                <label className="block font-semibold text-[var(--app-text)] mb-3 flex items-center gap-2">
                  <MdEmojiEvents className="text-[var(--app-accent)]" />
                  Achievements
                </label>
                <div className="space-y-3">
                  {temp_data.achievements?.map((ach, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-[var(--app-bg-soft)] rounded-xl items-start">
                      <input
                        value={ach.title}
                        onChange={(e) => {
                          const updated = [...temp_data.achievements];
                          updated[idx].title = e.target.value;
                          settemp_data({ ...temp_data, achievements: updated });
                        }}
                        placeholder="Achievement title"
                        className="p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                      />
                      <input
                        value={ach.description}
                        onChange={(e) => {
                          const updated = [...temp_data.achievements];
                          updated[idx].description = e.target.value;
                          settemp_data({ ...temp_data, achievements: updated });
                        }}
                        placeholder="Description"
                        className="p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                      />
                      <div className="flex gap-2">
                        <input
                          value={ach.link}
                          onChange={(e) => {
                            const updated = [...temp_data.achievements];
                            updated[idx].link = e.target.value;
                            settemp_data({ ...temp_data, achievements: updated });
                          }}
                          placeholder="Link (optional)"
                          className="flex-1 p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                        />
                        <button onClick={() => settemp_data({ ...temp_data, achievements: temp_data.achievements.filter((_, i) => i !== idx) })}>
                          <TiDelete size={22} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                  <input
                    value={obj.achievement.title}
                    onChange={(e) => setobj({ ...obj, achievement: { ...obj.achievement, title: e.target.value } })}
                    placeholder="Title"
                    className="p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                  />
                  <input
                    value={obj.achievement.description}
                    onChange={(e) => setobj({ ...obj, achievement: { ...obj.achievement, description: e.target.value } })}
                    placeholder="Description"
                    className="p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                  />
                  <div className="flex gap-2">
                    <input
                      value={obj.achievement.link}
                      onChange={(e) => setobj({ ...obj, achievement: { ...obj.achievement, link: e.target.value } })}
                      placeholder="Link"
                      className="flex-1 p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                    />
                    <button
                      onClick={() => {
                        const { title, description, link } = obj.achievement;
                        if (title.trim() || description.trim() || link.trim()) {
                          settemp_data({
                            ...temp_data,
                            achievements: [...temp_data.achievements, { title: title.trim(), description: description.trim(), link: link.trim() }],
                          });
                          setobj({ ...obj, achievement: { title: "", description: "", link: "" } });
                        }
                      }}
                      className="px-3 bg-[var(--app-accent)] text-white rounded-xl hover:bg-[var(--app-accent-dark)] transition"
                    >
                      <MdAddBox size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Links Tab */}
          {activeTab === "social" && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label className="block font-semibold text-[var(--app-text)] mb-3 flex items-center gap-2">
                  <MdLink className="text-[var(--app-accent)]" />
                  Social & Professional Links
                </label>
                <div className="space-y-3">
                  {temp_data.social_links?.map((link, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-3 p-3 bg-[var(--app-bg-soft)] rounded-xl">
                      <input
                        value={link.label}
                        onChange={(e) => {
                          const updated = [...temp_data.social_links];
                          updated[idx].label = e.target.value;
                          settemp_data({ ...temp_data, social_links: updated });
                        }}
                        className="flex-1 p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                        placeholder="Platform (e.g., GitHub, Twitter)"
                      />
                      <input
                        value={link.url}
                        onChange={(e) => {
                          const updated = [...temp_data.social_links];
                          updated[idx].url = e.target.value;
                          settemp_data({ ...temp_data, social_links: updated });
                        }}
                        className="flex-[2] p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                        placeholder="https://..."
                      />
                      <button
                        onClick={() =>
                          settemp_data({
                            ...temp_data,
                            social_links: temp_data.social_links.filter((_, i) => i !== idx),
                          })
                        }
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <TiDelete size={24} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <input
                    value={obj.social.label}
                    onChange={(e) => setobj({ ...obj, social: { ...obj.social, label: e.target.value } })}
                    className="flex-1 p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                    placeholder="Platform name"
                  />
                  <input
                    value={obj.social.url}
                    onChange={(e) => setobj({ ...obj, social: { ...obj.social, url: e.target.value } })}
                    className="flex-[2] p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)]"
                    placeholder="Profile URL"
                  />
                  <button
                    onClick={() => {
                      if (obj.social.label.trim() && obj.social.url.trim()) {
                        settemp_data({
                          ...temp_data,
                          social_links: [...temp_data.social_links, { label: obj.social.label.trim(), url: obj.social.url.trim() }],
                        });
                        setobj({ ...obj, social: { label: "", url: "" } });
                      }
                    }}
                    className="px-5 py-2 bg-[var(--app-accent)] text-white rounded-xl hover:bg-[var(--app-accent-dark)] transition flex items-center justify-center gap-2"
                  >
                    <MdAddBox size={20} /> Add Link
                  </button>
                </div>
                <p className="text-xs text-[var(--app-text-muted)] mt-3">Add links to your professional profiles, portfolio, or social media.</p>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[var(--app-border)] bg-[var(--app-bg-soft)] shrink-0">
          <button
            onClick={Cancel_update}
            className="px-6 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={update_profileinfo_handler}
            className="px-6 py-2.5 rounded-xl bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-dark)] transition flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
          >
            <FiSave size={18} />
            Save Changes
          </button>
        </div>
      </Modal>

      {/* Custom CSS for scrollbar and animations */}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: var(--app-bg-soft);
          border-radius: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: var(--app-accent);
          border-radius: 10px;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default User_profile;