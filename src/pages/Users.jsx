/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaEye ,FaTrash} from "react-icons/fa";
import ViewUser from "../components/ViewUser";
import EditUser from "../components/EditUser";
import RegisterUser from "./RegisterUser";


const Users = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
const [viewUser, setViewUser] = useState(null);
const [editUser, setEditUser] = useState(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
const openView = async (id) => {
  const res = await api.get(`/auth/users/${id}`);
  setViewUser(res.data.user);
};

const openEdit = (user) => {
  setEditUser(user);
};

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  /* ============================
     SEARCH DEBOUNCE
  ============================ */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ============================
     LOAD USERS
  ============================ */
  const loadUsers = async () => {
    try {
      const res = await api.get("/auth/users", {
        params: {
          page,
          limit,
          search: debouncedSearch,
        },
      });

      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error("Access denied");
      } else {
        toast.error("Failed to load users");
      }
    }
  };
  const deleteUser = async(id)=>
  {
    if(!window.confirm("Are u sure u want to delete this user")) return;
    try {
       const res = await api.delete(`/auth/deleteUser/${id}`)
       toast.success(res?.data?.message || "Delete Successfully")  
       loadUsers();
    } catch (err) {
      console.log(err)
      toast.error(err.response?.data?.message || "Cannot delete User");
    }
  }

  useEffect(() => {
    loadUsers();
  }, [page, limit, debouncedSearch]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-600">
            Manage system users & permissions
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          <FaPlus /> Add User
        </button>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search user..."
          className="border rounded-lg px-3 py-2 w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="border rounded-lg px-3 py-2 w-24"
        >
          {[5, 10, 20, 50].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!users.length && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}

            {users.map((u) => (
              <tr key={u._id} className="border-t text-center">
                <td className="p-4 text-left font-semibold">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4 capitalize">{u.role}</td>
                <td className="p-4 capitalize">{u.status}</td>
                <td className="p-4 text-center flex justify-center gap-3">
  <button
    onClick={() => openView(u._id)}
    className="text-blue-600 hover:text-blue-800"
    title="View User"
  >
    <FaEye />
  </button>

  <button
    onClick={() => openEdit(u)}
    className="text-green-600 hover:text-green-800"
    title="Edit User"
  >
    <FaEdit />
  </button>
      <button
                      onClick={() => deleteUser(u._id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <FaTrash />
                    </button>
</td>

              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= PAGINATION ================= */}
        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() =>
                setPage((p) => Math.min(p + 1, totalPages))
              }
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ================= CREATE USER MODAL ================= */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-xl">
            <RegisterUser
              onClose={() => setShowForm(false)}
              onSuccess={loadUsers}
            />
          </div>
        </div>
      )}
      {viewUser && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-xl">
      <ViewUser user={viewUser} onClose={() => setViewUser(null)} />
    </div>
  </div>
)}

{editUser && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-xl">
      <EditUser
        user={editUser}
        onClose={() => setEditUser(null)}
        onSuccess={loadUsers}
      />
    </div>
  </div>
)}

    </div>
  );
};

export default Users;
