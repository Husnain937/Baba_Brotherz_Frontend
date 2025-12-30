/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const Item = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
// ===== Pagination & Filters =====
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [totalPages, setTotalPages] = useState(1);
const [status,setStatus] = useState("");
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const [loading, setLoading] = useState(false);
const [formLoading, setFormLoading] = useState(false);
const [filterCategory, setFilterCategory] = useState("");

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [refetch, setRefetch] = useState(0);

  const [form, setForm] = useState({
    name: "",
    category: "",
    uom: "",
    minLevel: "",
    reorderLevel: "",
    note: "",
    status: "Active",
  });
useEffect(() => {
    loadCategories(); // ensure fresh list when modal opens
}, []);

 useEffect(() => {
  loadItems();
}, [page, limit, debouncedSearch, filterCategory, refetch,status]);


const loadItems = async () => {
  try {
    setLoading(true)
    const res = await api.get("/items", {
      params: {
        page,
        limit,
        search: debouncedSearch,
        category: filterCategory || undefined,
        status
      },
    });

    setItems(res.data.items || []);
    setTotalPages(res.data.meta?.pages || 1);
  } catch (err) {
    toast.error("Failed to load items");
  }
  setLoading(false)
};

const loadCategories = async () => {
  try {
    setLoading(true)
    const res = await api.get("/category/dropdown/categories");
    // 🔥 FIX: categories are inside `data`
    setCategories(res.data.categories || []);
  } catch (err) {
    toast.error("Failed to load categories");
  }
  setLoading(false)
};


  const openAdd = () => {
    setEditItem(null);
    setForm({
      name: "",
      category: "",
      uom: "",
      minLevel: "",
      reorderLevel: "",
      note: "",
      status: "Active",
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      category: item.category?._id,
      uom: item.uom,
      minLevel: item.minLevel || "",
      reorderLevel: item.reorderLevel || "",
      note: item.note || "",
       status: item.status ?? "Active",
    });
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormLoading(true)
    if (!form.name.trim()) return toast.error("Item name is required");
    if (!form.category) return toast.error("Category is required");
    if (!form.uom) return toast.error("Unit is required");

    try {
      if (editItem) {
        await api.put(`/items/${editItem._id}`, {
          ...form,
          minLevel: Number(form.minLevel || 0),
          reorderLevel: Number(form.reorderLevel || 0),
        });
        toast.success("Item updated successfully");
      } else {
        await api.post("/items", {
          ...form,
          minLevel: Number(form.minLevel || 0),
          reorderLevel: Number(form.reorderLevel || 0),
        });
        toast.success("Item created successfully");
      }

      setShowForm(false);
      setEditItem(null);
      setRefetch((p) => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save item");
    }
    setFormLoading(false)
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Are you sure you want to Inacitve this item?")) return;
setLoading(true)
    try {
      await api.delete(`/items/${id}`);
      toast.success("Item deleted successfully");
      setRefetch((p) => p + 1);
    } catch {
      toast.error("Unable to delete item");
    }
    setLoading(false)
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200">
       {loading && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
      {/* ================= MODAL ================= */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn" />

          <div
            className="
            fixed top-24 left-1/2 -translate-x-1/2 z-50
            w-full max-w-lg
            bg-white rounded-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            animate-dropFromTop
          "
          >
            {/* HEADER */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-lg font-semibold text-white">
                {editItem ? "Edit Item" : "Create Item"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-white/80 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <form onSubmit={submitForm} className="p-6 space-y-4">
              <input
                placeholder="Item Name"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <select
                className="w-full border rounded-lg px-3 py-2"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
  className="w-full border rounded-lg px-4 py-2.5"
  value={form.status}
  onChange={(e) => setForm({ ...form, status: e.target.value })}
>
  <option value="Active">Active</option>
  <option value="Inactive">Inactive</option>
</select>

              <select
                className="w-full border rounded-lg px-3 py-2"
                value={form.uom}
                onChange={(e) => setForm({ ...form, uom: e.target.value })}
                required
              >
                <option value="">Select Unit</option>
                <option value="pcs">PCS</option>
                <option value="kg">KG</option>
                <option value="meter">Meter</option>
                <option value="roll">Roll</option>
                <option value="bag">Bag</option>
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Min Level"
                  min="0"
                  className="border rounded-lg px-3 py-2"
                  value={form.minLevel}
                  onChange={(e) =>
                    setForm({ ...form, minLevel: e.target.value })
                  }
                />
                <input
                  type="number"
                  placeholder="Reorder Level"
                  min="0"
                  className="border rounded-lg px-3 py-2"
                  value={form.reorderLevel}
                  onChange={(e) =>
                    setForm({ ...form, reorderLevel: e.target.value })
                  }
                />
              </div>

              <textarea
                placeholder="Note"
                className="w-full border rounded-lg px-3 py-2"
                rows="3"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />

              {/* FOOTER */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="
                    px-5 py-2 rounded-lg text-white
                    bg-gradient-to-r from-indigo-600 to-blue-600
                    hover:from-indigo-700 hover:to-blue-700
                    shadow-md hover:shadow-lg transition
                  "
                  disabled={formLoading}
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
      {editItem ? "Updating..." : "Saving..."}
    </>
  ) : (
    editItem ? "Update Item" : "Save Item"
  )}
                
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Items</h1>
          <p className="text-sm text-gray-600">
            Manage raw materials and finished goods
          </p>
        </div>

        <button
          onClick={openAdd}
          className="
            flex items-center gap-2
            bg-gradient-to-r from-indigo-600 to-blue-600
            text-white px-5 py-2 rounded-lg
            shadow-md hover:shadow-lg hover:scale-[1.02]
            transition
          "
        >
          <FaPlus /> Add Item
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex flex-wrap gap-4 p-4 items-end">

  {/* SEARCH */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      Search
    </label>
    <input
      className="border rounded-lg px-4 py-2 w-64"
      placeholder="Item name or SKU..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

  {/* CATEGORY */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      Category
    </label>
    <select
      className="border rounded-lg px-3 py-2 w-48"
      value={filterCategory}
      onChange={(e) => {
        setFilterCategory(e.target.value);
        setPage(1);
      }}
    >
      <option value="">All</option>
      {categories.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
        </option>
      ))}
    </select>
  </div>
 {/* 📌 STATUS FILTER */}
  <div>
    <label className="block text-xs text-gray-600 mb-1">
      Status
    </label>
    <select
      value={status}
      onChange={(e) => {
        setStatus(e.target.value);
        setPage(1);
      }}
      className="border rounded-lg px-3 py-2 w-44"
    >
      <option value="">All Status</option>
      <option value="Active">Active</option>
      <option value="Inactive">Inactive</option>
    </select>
  </div>
  {/* LIMIT */}
  <div>
    <label className="block text-sm text-gray-600 mb-1">
      Limit
    </label>
    <select
      className="border rounded-lg px-3 py-2 w-24"
      value={limit}
      onChange={(e) => {
        setLimit(Number(e.target.value));
        setPage(1);
      }}
    >
      {PAGE_SIZE_OPTIONS.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  </div>
   <button
          onClick={() => {
            setSearch("");
            setFilterCategory("");
            setStatus("")
            setPage(1)
          }}
          className="px-4 py-2 border rounded-lg mt-6"
        >
          Clear
        </button>
</div>

        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Sku</th>
              <th className="p-4 text-left">Unit</th>
              <th className="p-4 text-center w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item._id}
                className="border-t hover:bg-indigo-50 transition"
              >
                <td className="p-4 font-medium">{item.name}</td>
                <td className="p-4">{item.category?.name}</td>
                <td className="p-4">
  <span
    className={`px-2 py-1 rounded-full text-xs font-semibold
      ${item.status === "Active"
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700"
      }`}
  >
    {item.status}
  </span>
</td>

                <td className="p-4">{item.sku}</td>
                <td className="p-4">{item.uom}</td>
                <td className="p-4 flex justify-center gap-4">
                  <button
                    onClick={() => openEdit(item)}
                    className="
        p-2 rounded-lg
        bg-indigo-50 text-indigo-600
        hover:bg-indigo-100 hover:text-indigo-800
        transition
      "
                  >
                    <FaEdit />
                  </button>
                  {item.status === "Active" && (
                  <button
                    onClick={() => deleteItem(item._id)}
                    className="
        p-2 rounded-lg
        bg-red-100 text-red-600
        hover:bg-red-200 hover:text-red-700
        transition
      "
                  >
                    <FaTrash />
                  </button>
)}
                </td>
              </tr>
            ))}

            {!items.length && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  No items found. Add your first item.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex justify-between items-center p-4 border-t">
  <span className="text-sm text-gray-600">
    Page {page} of {totalPages}
  </span>

  <div className="flex gap-2">
    <button
      disabled={page === 1}
      onClick={() => setPage(p => Math.max(p - 1, 1))}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Prev
    </button>

    <button
      disabled={page === totalPages}
      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

      </div>
    </div>
  );
};

export default Item;
