/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { FaUserEdit, FaCheckCircle } from "react-icons/fa";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  /* =====================
     LOAD PROFILE
  ===================== */
  const loadProfile = async () => {
    try {
      const res = await api.get("/auth");

      setProfile(res.data.user);
      setForm({
        name: res.data.user.name,
        email: res.data.user.email,
      });
    } catch {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* =====================
     UPDATE PROFILE
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await api.put("/auth", form);

      toast.success("Profile updated successfully");
      setProfile(res.data.user);
      setShowEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };
if (loading || !profile) {
  return (
    <div className="p-8 text-center text-gray-500">
      Loading profile...
    </div>
  );
}


  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-200 p-38">

  {/* ================= PROFILE CONTAINER ================= */}
  <div className="w-full bg-white rounded-3xl shadow-xl p-5">

    {/* HEADER */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-6 mb-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-800">
          My Profile
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View your account information & permissions
        </p>
      </div>

      <button
        onClick={() => setShowEdit(true)}
        className="
          mt-4 md:mt-0
          inline-flex items-center gap-2
          px-6 py-2.5 rounded-xl
          bg-indigo-600 text-white font-semibold
          hover:bg-indigo-700 transition
        "
      >
        <FaUserEdit /> Edit Profile
      </button>
    </div>

    {/* ================= BASIC INFO ================= */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

      <Info label="Full Name" value={profile.name} />
      <Info label="Email" value={profile.email} />
      <Info label="Role" value={profile.role} capitalize />

      <div>
        <p className="text-sm text-gray-500 mb-1">Account Status</p>
        <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full bg-green-100 text-green-700">
          <FaCheckCircle /> Active
        </span>
      </div>
    </div>

    {/* ================= PERMISSIONS ================= */}
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Permissions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Object.entries(profile.permissions || {}).map(([key, value]) => (
          <div
            key={key}
            className={`
              px-5 py-3 rounded-xl text-sm font-semibold text-center
              transition
              ${
                value
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }
            `}
          >
            {key}
          </div>
        ))}
      </div>
    </div>
  </div>

  {/* ================= EDIT MODAL ================= */}
  {showEdit && (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={() => setShowEdit(false)}
      />

      {/* MODAL */}
      <div className="
        fixed top-24 left-1/2 -translate-x-1/2 z-50
        w-full max-w-xl
        bg-white rounded-2xl shadow-2xl
      ">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-white">
            Edit Profile
          </h2>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <Input
            label="Role"
            value={profile.role}
            disabled
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className={`
                px-6 py-2 rounded-lg text-white font-semibold
                ${
                  saving
                    ? "bg-indigo-300 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }
              `}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  )}
</div>

  );
};

/* ===================== COMPONENTS ===================== */

const Info = ({ label, value, capitalize }) => (
  <div>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className={`font-semibold text-gray-800 ${capitalize && "capitalize"}`}>
      {value}
    </p>
  </div>
);

const Input = ({ label, type = "text", value, onChange, disabled }) => (
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full border rounded-lg px-4 py-2
        ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
      `}
      required={!disabled}
    />
  </div>
);

export default Profile;
