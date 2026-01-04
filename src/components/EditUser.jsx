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
   const [formLoading, setFormLoading] = useState(false);
 
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
      setFormLoading(true)
      await api.patch(`/auth/users/${user._id}`, form);
      toast.success("User updated");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to update user");
    }
    finally{
      setFormLoading(false)
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
             className="px-5 py-2 rounded-lg text-white
             bg-gradient-to-r from-indigo-600 to-blue-600
             hover:from-indigo-700 hover:to-blue-700
             shadow-md hover:shadow-lg
             transition-all duration-200 flex items-center justify-center gap-2"
                  disabled={formLoading} // or formLoading if you separate it
                >
                  {formLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      { "Updating..."}
                    </>
                  ) : 
                    "Update"
                  }
                </button>
      </div>
    </form>
  );
};

export default EditUser;
