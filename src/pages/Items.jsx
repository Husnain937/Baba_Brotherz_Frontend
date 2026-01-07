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

//   return (
//     <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200">
//        {loading && (
//   <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
//     <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//   </div>
// )}
//       {/* ================= MODAL ================= */}
//       {showForm && (
//         <>
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn" />

//           <div
//             className="
//             fixed top-24 left-1/2 -translate-x-1/2 z-50
//             w-full max-w-lg
//             bg-white rounded-2xl
//             shadow-[0_20px_60px_rgba(0,0,0,0.25)]
//             animate-dropFromTop
//           "
//           >
//             {/* HEADER */}
//             <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl flex justify-between items-center">
//               <h2 className="text-lg font-semibold text-white">
//                 {editItem ? "Edit Item" : "Create Item"}
//               </h2>
//               <button
//                 onClick={() => setShowForm(false)}
//                 className="text-white/80 hover:text-white transition"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* BODY */}
//             <form onSubmit={submitForm} className="p-6 space-y-4">
//               <input
//                 placeholder="Item Name"
//                 className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 required
//               />

//               <select
//                 className="w-full border rounded-lg px-3 py-2"
//                 value={form.category}
//                 onChange={(e) => setForm({ ...form, category: e.target.value })}
//                 required
//               >
//                 <option value="">Select Category</option>
//                 {categories.map((c) => (
//                   <option key={c._id} value={c._id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//               <select
//   className="w-full border rounded-lg px-4 py-2.5"
//   value={form.status}
//   onChange={(e) => setForm({ ...form, status: e.target.value })}
// >
//   <option value="Active">Active</option>
//   <option value="Inactive">Inactive</option>
// </select>

//               <select
//                 className="w-full border rounded-lg px-3 py-2"
//                 value={form.uom}
//                 onChange={(e) => setForm({ ...form, uom: e.target.value })}
//                 required
//               >
//                 <option value="">Select Unit</option>
//                 <option value="pcs">PCS</option>
//                 <option value="kg">KG</option>
//                 <option value="meter">Meter</option>
//                 <option value="roll">Roll</option>
//                 <option value="bag">Bag</option>
//               </select>

//               <div className="grid grid-cols-2 gap-3">
//                 <input
//                   type="number"
//                   placeholder="Min Level"
//                   min="0"
//                   className="border rounded-lg px-3 py-2"
//                   value={form.minLevel}
//                   onChange={(e) =>
//                     setForm({ ...form, minLevel: e.target.value })
//                   }
//                 />
//                 <input
//                   type="number"
//                   placeholder="Reorder Level"
//                   min="0"
//                   className="border rounded-lg px-3 py-2"
//                   value={form.reorderLevel}
//                   onChange={(e) =>
//                     setForm({ ...form, reorderLevel: e.target.value })
//                   }
//                 />
//               </div>

//               <textarea
//                 placeholder="Note"
//                 className="w-full border rounded-lg px-3 py-2"
//                 rows="3"
//                 value={form.note}
//                 onChange={(e) => setForm({ ...form, note: e.target.value })}
//               />

//               {/* FOOTER */}
//               <div className="flex justify-end gap-3 pt-4 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="
//                     px-5 py-2 rounded-lg text-white
//                     bg-gradient-to-r from-indigo-600 to-blue-600
//                     hover:from-indigo-700 hover:to-blue-700
//                     shadow-md hover:shadow-lg transition
//                   "
//                   disabled={formLoading}
//                 >
//                 {formLoading ? (
//     <>
//       <svg
//         className="animate-spin h-5 w-5 text-white"
//         xmlns="http://www.w3.org/2000/svg"
//         fill="none"
//         viewBox="0 0 24 24"
//       >
//         <circle
//           className="opacity-25"
//           cx="12"
//           cy="12"
//           r="10"
//           stroke="currentColor"
//           strokeWidth="4"
//         ></circle>
//         <path
//           className="opacity-75"
//           fill="currentColor"
//           d="M4 12a8 8 0 018-8v8H4z"
//         ></path>
//       </svg>
//       {editItem ? "Updating..." : "Saving..."}
//     </>
//   ) : (
//     editItem ? "Update Item" : "Save Item"
//   )}
                
//                 </button>
//               </div>
//             </form>
//           </div>
//         </>
//       )}

//       {/* ================= HEADER ================= */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Items</h1>
//           <p className="text-sm text-gray-600">
//             Manage raw materials and finished goods
//           </p>
//         </div>

//         <button
//           onClick={openAdd}
//           className="
//             flex items-center gap-2
//             bg-gradient-to-r from-indigo-600 to-blue-600
//             text-white px-5 py-2 rounded-lg
//             shadow-md hover:shadow-lg hover:scale-[1.02]
//             transition
//           "
//         >
//           <FaPlus /> Add Item
//         </button>
//       </div>

//       {/* ================= TABLE ================= */}
//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//         <div className="bg-white p-4 rounded-xl shadow mb-4">
//   <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

//     {/* 🔍 SEARCH */}
//     <div className="w-full sm:w-64">
//       <label className="block text-sm text-gray-600 mb-1">
//         Search
//       </label>
//       <input
//         className="w-full border rounded-lg px-4 py-2"
//         placeholder="Item name or SKU..."
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setPage(1);
//         }}
//       />
//     </div>

//     {/* 🗂 CATEGORY */}
//     <div className="w-full sm:w-48">
//       <label className="block text-sm text-gray-600 mb-1">
//         Category
//       </label>
//       <select
//         className="w-full border rounded-lg px-3 py-2"
//         value={filterCategory}
//         onChange={(e) => {
//           setFilterCategory(e.target.value);
//           setPage(1);
//         }}
//       >
//         <option value="">All</option>
//         {categories.map((c) => (
//           <option key={c._id} value={c._id}>
//             {c.name}
//           </option>
//         ))}
//       </select>
//     </div>

//     {/* 📌 STATUS */}
//     <div className="w-full sm:w-40">
//       <label className="block text-sm text-gray-600 mb-1">
//         Status
//       </label>
//       <select
//         value={status}
//         onChange={(e) => {
//           setStatus(e.target.value);
//           setPage(1);
//         }}
//         className="w-full border rounded-lg px-3 py-2"
//       >
//         <option value="">All Status</option>
//         <option value="Active">Active</option>
//         <option value="Inactive">Inactive</option>
//       </select>
//     </div>

//     {/* 📄 LIMIT */}
//     <div className="w-full sm:w-24">
//       <label className="block text-sm text-gray-600 mb-1">
//         Limit
//       </label>
//       <select
//         className="w-full border rounded-lg px-3 py-2"
//         value={limit}
//         onChange={(e) => {
//           setLimit(Number(e.target.value));
//           setPage(1);
//         }}
//       >
//         {PAGE_SIZE_OPTIONS.map((s) => (
//           <option key={s} value={s}>
//             {s}
//           </option>
//         ))}
//       </select>
//     </div>

//     {/* CLEAR */}
//     <div className="w-full sm:w-auto sm:pb-[2px]">
//       <button
//         onClick={() => {
//           setSearch("");
//           setFilterCategory("");
//           setStatus("");
//           setPage(1);
//         }}
//         className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-slate-100 transition"
//       >
//         Clear
//       </button>
//     </div>

//   </div>
// </div>


//         <table className="w-full text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="p-4 text-left">Name</th>
//               <th className="p-4 text-left">Category</th>
//               <th className="p-4 text-left">Status</th>
//               <th className="p-4 text-left">Sku</th>
//               <th className="p-4 text-left">Unit</th>
//               <th className="p-4 text-center w-32">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.map((item) => (
//               <tr
//                 key={item._id}
//                 className="border-t hover:bg-indigo-50 transition"
//               >
//                 <td className="p-4 font-medium">{item.name}</td>
//                 <td className="p-4">{item.category?.name}</td>
//                 <td className="p-4">
//   <span
//     className={`px-2 py-1 rounded-full text-xs font-semibold
//       ${item.status === "Active"
//         ? "bg-green-100 text-green-700"
//         : "bg-red-100 text-red-700"
//       }`}
//   >
//     {item.status}
//   </span>
// </td>

//                 <td className="p-4">{item.sku}</td>
//                 <td className="p-4">{item.uom}</td>
//                 <td className="p-4 flex justify-center gap-4">
//                   <button
//                     onClick={() => openEdit(item)}
//                     className="
//         p-2 rounded-lg
//         bg-indigo-50 text-indigo-600
//         hover:bg-indigo-100 hover:text-indigo-800
//         transition
//       "
//                   >
//                     <FaEdit />
//                   </button>
//                   {item.status === "Active" && (
//                   <button
//                     onClick={() => deleteItem(item._id)}
//                     className="
//         p-2 rounded-lg
//         bg-red-100 text-red-600
//         hover:bg-red-200 hover:text-red-700
//         transition
//       "
//                   >
//                     <FaTrash />
//                   </button>
// )}
//                 </td>
//               </tr>
//             ))}

//             {!items.length && (
//               <tr>
//                 <td colSpan="4" className="p-8 text-center text-gray-500">
//                   No items found. Add your first item.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//         <div className="flex justify-between items-center p-4 border-t">
//   <span className="text-sm text-gray-600">
//     Page {page} of {totalPages}
//   </span>

//   <div className="flex gap-2">
//     <button
//       disabled={page === 1}
//       onClick={() => setPage(p => Math.max(p - 1, 1))}
//       className="px-3 py-1 border rounded disabled:opacity-50"
//     >
//       Prev
//     </button>

//     <button
//       disabled={page === totalPages}
//       onClick={() => setPage(p => Math.min(p + 1, totalPages))}
//       className="px-3 py-1 border rounded disabled:opacity-50"
//     >
//       Next
//     </button>
//   </div>
// </div>

//       </div>
//     </div>
//   );
return (
  <div className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-sans">

    {/* ======== LOADING SPINNER ======== */}
    {loading && (
      <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
      </div>
    )}

    {/* ======== MODAL ======== */}
    {showForm && (
      <>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn" />
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg mx-4 sm:mx-0 bg-white rounded-3xl shadow-2xl animate-dropFromTop border border-gray-100">

          {/* HEADER */}
          <div className="px-6 py-4 flex justify-between items-center rounded-t-3xl bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md">
            <h2 className="text-xl font-bold text-white">{editItem ? "Edit Item" : "Create Item"}</h2>
            <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white text-2xl transition">✕</button>
          </div>

          {/* FORM BODY */}
          <form onSubmit={submitForm} className="p-6 space-y-5">
            <input
              placeholder="Item Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
            />

            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={form.uom}
              onChange={(e) => setForm({ ...form, uom: e.target.value })}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
            >
              <option value="">Select Unit</option>
              <option value="pcs">PCS</option>
              <option value="kg">KG</option>
              <option value="meter">Meter</option>
              <option value="roll">Roll</option>
              <option value="bag">Bag</option>
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min Level"
                min="0"
                value={form.minLevel}
                onChange={(e) => setForm({ ...form, minLevel: e.target.value })}
                className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
              />
              <input
                type="number"
                placeholder="Reorder Level"
                min="0"
                value={form.reorderLevel}
                onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
                className="rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
              />
            </div>

            <textarea
              placeholder="Note"
              rows="3"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
            />

            {/* FOOTER */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition w-full sm:w-auto">Cancel</button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    {editItem ? "Updating..." : "Saving..."}
                  </>
                ) : editItem ? "Update Item" : "Save Item"}
              </button>
            </div>
          </form>
        </div>
      </>
    )}

    {/* ======== HEADER ======== */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Items</h1>
        <p className="text-sm text-gray-500 mt-1">Manage raw materials and finished goods</p>
      </div>
      <button onClick={openAdd} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition text-sm sm:text-base">
        <FaPlus /> Add Item
      </button>
    </div>

    {/* ======== FILTERS ======== */}
    <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-md mb-6 overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4 w-full">

        <div className="flex-1 sm:w-64 mb-3 sm:mb-0">
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <input
            placeholder="Item name or SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          />
        </div>

        <div className="flex-1 sm:w-48 mb-3 sm:mb-0">
          <label className="block text-sm text-gray-600 mb-1">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="">All</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex-1 sm:w-40 mb-3 sm:mb-0">
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex-1 sm:w-24 mb-3 sm:mb-0">
          <label className="block text-sm text-gray-600 mb-1">Limit</label>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
          >
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="sm:pb-1">
          <button onClick={() => { setSearch(""); setFilterCategory(""); setStatus(""); setPage(1); }} className="w-full sm:w-auto px-4 py-2 border rounded-xl hover:bg-gray-100 transition">Clear</button>
        </div>

      </div>
    </div>

    {/* ======== TABLE ======== */}
    <div className="bg-white rounded-3xl shadow-lg overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Category</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">SKU</th>
            <th className="p-4 text-left">Unit</th>
            <th className="p-4 text-center w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length ? items.map((item) => (
            <tr key={item._id} className="border-t hover:bg-indigo-50 transition-colors">
              <td className="p-4 font-medium">{item.name}</td>
              <td className="p-4">{item.category?.name || "—"}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{item.status}</span>
              </td>
              <td className="p-4">{item.sku || "—"}</td>
              <td className="p-4">{item.uom || "—"}</td>
              <td className="p-4 flex justify-center gap-3 flex-wrap sm:flex-nowrap">
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition"><FaEdit /></button>
                {item.status === "Active" && <button onClick={() => deleteItem(item._id)} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition"><FaTrash /></button>}
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" className="p-10 text-center text-gray-500">No items found. Add your first item.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 gap-2 sm:gap-0">
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))} className="px-3 py-1 border rounded-xl disabled:opacity-50 transition">Prev</button>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(p + 1, totalPages))} className="px-3 py-1 border rounded-xl disabled:opacity-50 transition">Next</button>
        </div>
      </div>
    </div>

  </div>
);


};

export default Item;
