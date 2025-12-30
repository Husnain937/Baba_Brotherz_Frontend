/** @format */

import React, { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const RegisterUser = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Select Role",
    permissions: {
      dashboard: true,
      accounts: false,
      stock: false,
      purchase: false,
      production: false,
      wages: false,
      reports: false,
      settings: false,
    },
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePermission = (key) => {
    setForm({
      ...form,
      permissions: {
        ...form.permissions,
        [key]: !form.permissions[key],
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      toast.success("User created successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">Create User</h2>

      <input
        required
        name="name"
        placeholder="Full Name"
        className="border px-3 py-2 w-full rounded"
        value={form.name}
        onChange={handleChange}
      />

      <input
        required
        name="email"
        type="email"
        placeholder="Email"
        className="border px-3 py-2 w-full rounded"
        value={form.email}
        onChange={handleChange}
      />

      <input
        required
        name="password"
        type="password"
        placeholder="Password"
        className="border px-3 py-2 w-full rounded"
        value={form.password}
        onChange={handleChange}
      />

      <select
        name="role"
        value={form.role}
        onChange={handleChange}
        className="border px-3 py-2 w-full rounded"
      >
        <option value="">Select Role</option>
        <option value="stock">Stock</option>
        <option value="purchase">Purchase</option>
        <option value="accounts">Accounts</option>
        <option value="production">Production</option>
        <option value="wages">Wages</option>
      </select>

      <div>
        <h4 className="font-semibold mb-2">Permissions</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {Object.keys(form.permissions).map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.permissions[key]}
                onChange={() => togglePermission(key)}
              />
              {key}
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-indigo-600 text-white rounded"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  );
};

export default RegisterUser;
