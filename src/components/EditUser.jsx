/** @format */
import React, { useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const EditUser = ({ user, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  });

  const togglePermission = (key) => {
    setForm({
      ...form,
      permissions: {
        ...form.permissions,
        [key]: !form.permissions[key],
      },
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/auth/users/${user._id}`, form);
      toast.success("User updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-xl font-semibold">Edit User</h2>

      <input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="border px-3 py-2 w-full rounded"
      />

      <select
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
        className="border px-3 py-2 w-full rounded"
      >
        <option value="stock">Select Role</option>
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
            <label key={key} className="flex gap-2">
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
          className="border px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-indigo-600 text-white px-5 py-2 rounded"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default EditUser;
