import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { IoCloseCircle } from "react-icons/io5";
import { MdAddPhotoAlternate, MdEdit, MdSave, MdDelete, MdLock } from "react-icons/md";
import { deleteUser, updateUser } from "../../../redux_/actions/user";
import { change_password } from "../../../api";
import getAssetUrl from "../../../utils/getAssetUrl";

function User_account() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.userReducer.current_user);
  const [edit, setEdit] = useState(false);
  const [temp_user, setTempUser] = useState(user);
  const [imageUrl, setImageUrl] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [passwordObj, setPasswordObj] = useState({ password: "", confirmpassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setImageUrl(URL.createObjectURL(selectedFile));
      setFile(selectedFile);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveChanges = () => {
    if (!file && temp_user.name === user.name && temp_user.username === user.username) return;
    dispatch(updateUser({ ...temp_user, file }));
    setEdit(false);
  };

  const handlePasswordChange = async () => {
    setError("");
    setSuccess("");
    if (!passwordObj.password || !passwordObj.confirmpassword) {
      setError("Both fields are required");
      return;
    }
    if (passwordObj.password.length < 8 || passwordObj.confirmpassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (passwordObj.password !== passwordObj.confirmpassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const { data } = await change_password(passwordObj);
      setSuccess(data.message || "Password changed successfully");
      setPasswordObj({ password: "", confirmpassword: "" });
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteMode(true);
    setIsModalOpen(true);
  };

  const openPasswordModal = () => {
    setIsDeleteMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError("");
    setSuccess("");
    setPasswordObj({ password: "", confirmpassword: "" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Premium Card */}
      <div className="bg-[var(--app-bg-panel)] rounded-2xl shadow-xl border border-[var(--app-border)] overflow-hidden transition-all">
        {/* Gradient Header with Avatar */}
        <div className="relative h-28 bg-gradient-to-r from-[var(--app-accent)] to-[var(--app-accent-dark)]">
          <div
            onClick={handleImageClick}
            className="absolute -bottom-12 left-8 w-28 h-28 rounded-full border-4 border-[var(--app-bg-panel)] bg-cover bg-center bg-no-repeat cursor-pointer group overflow-hidden shadow-lg transition-transform hover:scale-105"
            style={{
              backgroundImage: `url(${
                imageUrl
                  ? imageUrl
                  : temp_user?.profile_img_
                  ? getAssetUrl(temp_user.profile_img_)
                  : "/default_profile.jpg"
              })`,
            }}
          >
            <span className="absolute inset-0 bg-black/40 flex justify-center items-center opacity-0 group-hover:opacity-100 transition rounded-full">
              <MdAddPhotoAlternate className="text-white text-3xl" />
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
        </div>

        {/* Content */}
        <div className="pt-14 pb-6 px-8">
          {/* Header Row */}
          <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--app-text)]">
                {temp_user?.name || "User"}
              </h1>
              <p className="text-[var(--app-text-muted)] text-sm">@{temp_user?.username}</p>
            </div>
            <button
              onClick={() => setEdit(!edit)}
              className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all shadow-sm ${
                edit
                  ? "bg-gray-500 hover:bg-gray-600 text-white"
                  : "bg-[var(--app-accent)] hover:bg-[var(--app-accent-dark)] text-white"
              }`}
            >
              <MdEdit size={18} />
              {edit ? "Cancel" : "Edit Account"}
            </button>
          </div>

          {/* Editable Fields */}
          {edit && (
            <div className="mb-6 p-5 bg-[var(--app-bg-soft)] rounded-xl space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-1">
                  Username
                </label>
                <input
                  value={temp_user?.username || ""}
                  onChange={(e) =>
                    setTempUser((prev) => ({ ...prev, username: e.target.value }))
                  }
                  className="w-full md:w-80 p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--app-text-muted)] mb-1">
                  Full Name
                </label>
                <input
                  value={temp_user?.name || ""}
                  onChange={(e) =>
                    setTempUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full md:w-80 p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveChanges}
                  disabled={!file && temp_user.name === user.name && temp_user.username === user.username}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-dark)] transition disabled:opacity-50 shadow-sm"
                >
                  <MdSave size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <hr className="my-6 border-[var(--app-border)]" />

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={openDeleteModal}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
            >
              <MdDelete size={18} />
              Delete Account
            </button>
            <button
              onClick={openPasswordModal}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white transition shadow-sm"
            >
              <MdLock size={18} />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Premium Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(4px)",
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
            border: "none",
            borderRadius: "1.25rem",
            padding: 0,
            width: "90vw",
            maxWidth: "420px",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          },
        }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-[var(--app-border)] bg-[var(--app-bg-panel)]">
          <h2 className="text-lg font-semibold text-[var(--app-text)]">
            {isDeleteMode ? "Delete Account" : "Change Password"}
          </h2>
          <button
            onClick={closeModal}
            className="text-[var(--app-text-muted)] hover:text-red-500 transition"
          >
            <IoCloseCircle size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {isDeleteMode ? (
            <>
              <p className="text-center text-[var(--app-text)] text-sm">
                Are you sure you want to delete your account?<br />
                This action is irreversible.
              </p>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-1.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => dispatch(deleteUser(navigate))}
                  className="px-4 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm"
                >
                  Delete Permanently
                </button>
              </div>
            </>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded-lg text-xs">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-100 text-green-700 p-2 rounded-lg text-xs">
                  {success}
                </div>
              )}
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="New Password"
                  value={passwordObj.password}
                  onChange={(e) =>
                    setPasswordObj({ ...passwordObj, password: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={passwordObj.confirmpassword}
                  onChange={(e) =>
                    setPasswordObj({ ...passwordObj, confirmpassword: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-text)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]"
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-1.5 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-lg bg-[var(--app-accent)] text-white hover:bg-[var(--app-accent-dark)] transition disabled:opacity-50 text-sm"
                >
                  {loading ? "Changing..." : "Change Password"}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default User_account;