/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios"; // <-- axios replaced with custom API
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [refetch, setRefetch] = useState(0);
  const [page, setPage] = useState(1);
  const [formLoading, setFormLoading] = useState(false);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [statusSearch, setStatusSearch] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Active",
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // LOAD CATEGORIES
  useEffect(() => {
    loadCategories();
  }, [page, limit, debouncedSearch, refetch, statusSearch]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/category", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          statusSearch,
        },
      });

      setCategories(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load categories.");
    }
    setLoading(false);
  };

  // OPEN ADD
  const openAdd = () => {
    setEditCategory(null);
    setForm({ name: "", description: "", status: "Active" });
    setShowForm(true);
  };

  // OPEN EDIT
  const openEdit = (cat) => {
    setEditCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
      status: cat.status ?? "Active",
    });
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setFormLoading(true)

    if (!form.name.trim()) {
      return toast.error("Category name is required.");
    }

    try {
      if (editCategory) {
        await api.put(`/category/${editCategory._id}`, form);
        toast.success("Category updated successfully");
      } else {
        await api.post("/category", form);
        toast.success("Category created successfully");
      }
      setTimeout(() => {
        setShowForm(false);
        setEditCategory(null);
        setForm({ name: "", description: "" });
        setRefetch((p) => p + 1);
      }, 100);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to save category. Please try again."
      );
    }
    setFormLoading(false)
  };

  // DELETE CATEGORY
  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to Inactive this category?"))
      return;
    try {
      setLoading(true)
      await api.delete(`/category/${id}`);
      toast.success("Category deleted successfully");
      setRefetch((p) => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete category.");
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
//           {/* BACKDROP */}
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn" />

//           {/* MODAL */}
//           <div
//             className="
//         fixed top-24 left-1/2 -translate-x-1/2 z-50
//         w-full max-w-lg
//         bg-white rounded-2xl
//         shadow-[0_20px_60px_rgba(0,0,0,0.25)]
//         animate-dropFromTop
//       "
//           >
//             {/* HEADER */}
//             <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
//               <h2 className="text-lg font-semibold text-white">
//                 {editCategory ? "Edit Category" : "Create Category"}
//               </h2>

//               <button
//                 onClick={() => setShowForm(false)}
//                 className="text-white/80 hover:text-white transition"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* BODY */}
//             <form onSubmit={submitForm} className="p-6 space-y-5">
//               {/* NAME */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Category Name <span className="text-red-500">*</span>
//                 </label>

//                 <input
//                   className="
//                 mt-1 w-full rounded-lg border border-gray-300
//                 px-3 py-2
//                 focus:outline-none focus:ring-2 focus:ring-indigo-500
//                 transition
//               "
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Status
//                 </label>

//                 <select
//                   className="
//       mt-1 w-full rounded-lg border border-gray-300
//       px-3 py-2
//       focus:outline-none focus:ring-2 focus:ring-indigo-500
//       transition
//     "
//                   value={form.status}
//                   onChange={(e) => setForm({ ...form, status: e.target.value })}
//                 >
//                   <option value="Active">Active</option>
//                   <option value="Inactive">Inactive</option>
//                 </select>
//               </div>

//               {/* DESCRIPTION */}
//               <div>
//                 <label className="text-sm font-medium text-gray-700">
//                   Description
//                 </label>

//                 <textarea
//                   rows="3"
//                   className="
//                 mt-1 w-full rounded-lg border border-gray-300
//                 px-3 py-2
//                 focus:outline-none focus:ring-2 focus:ring-indigo-500
//                 transition
//               "
//                   value={form.description}
//                   onChange={(e) =>
//                     setForm({ ...form, description: e.target.value })
//                   }
//                 />
//               </div>

//               {/* FOOTER */}
//               <div className="flex justify-end gap-3 pt-4 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowForm(false)}
//                   className="
//                 px-4 py-2 rounded-lg
//                 border border-gray-300 text-gray-600
//                 hover:bg-gray-100 transition
//               "
//                 >
//                   Cancel
//                 </button>

              
//                 <button
//   type="submit"
//   className="px-5 py-2 rounded-lg text-white
//              bg-gradient-to-r from-indigo-600 to-blue-600
//              hover:from-indigo-700 hover:to-blue-700
//              shadow-md hover:shadow-lg
//              transition-all duration-200 flex items-center justify-center gap-2"
//   disabled={formLoading} // or formLoading if you separate it
// >
//   {formLoading ? (
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
//       {editCategory ? "Updating..." : "Saving..."}
//     </>
//   ) : (
//     editCategory ? "Update Category" : "Save Category"
//   )}
// </button>

//               </div>
//             </form>
//           </div>
//         </>
//       )}

//       {/* ================= HEADER ================= */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
//           <p className="text-sm text-gray-600 mt-1">
//             Organize inventory & product classification
//           </p>
//         </div>

//         <button
//           onClick={openAdd}
//           className="
//         flex items-center gap-2
//         bg-gradient-to-r from-indigo-600 to-blue-600
//         text-white px-5 py-2 rounded-lg
//         shadow-md hover:shadow-lg
//         hover:scale-[1.02]
//         transition-all duration-200
//       "
//         >
//           <FaPlus /> Add Category
//         </button>
//       </div>

//       {/* ================= TABLE ================= */}
//       <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
//       <div className="bg-white p-4 rounded-xl shadow mb-4">
//   <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

//     {/* 🔍 SEARCH */}
//     <div className="w-full sm:w-64">
//       <label className="block text-sm text-gray-600 mb-1">
//         Search
//       </label>
//       <input
//         className="w-full border rounded-lg px-4 py-2"
//         placeholder="Category name..."
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setPage(1);
//         }}
//       />
//     </div>

//     {/* 📌 STATUS FILTER */}
//     <div className="w-full sm:w-40">
//       <label className="block text-sm text-gray-600 mb-1">
//         Status
//       </label>
//       <select
//         value={statusSearch}
//         onChange={(e) => {
//           setStatusSearch(e.target.value);
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

//     {/* CLEAR BUTTON */}
//     <div className="w-full sm:w-auto sm:pb-[2px]">
//       <button
//         onClick={() => {
//           setSearch("");
//           setStatusSearch("");
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
//           <thead className="bg-gray-100 text-sm text-gray-700">
//             <tr>
//               <th className="p-4 text-left w-40">Name</th>
//               <th className="p-4 text-left w-40">Status</th>
//               <th className="p-4 text-left w-40">Description</th>
//               <th className="p-4 text-center w-32">Actions</th>
//             </tr>
//           </thead>

//           <tbody>
//             {categories.map((cat) => (
//               <tr
//                 key={cat._id}
//                 className="
//               border-t
//               hover:bg-indigo-50
//               transition-colors duration-150
//             "
//               >
//                 <td className="p-4 font-medium text-gray-800">{cat.name}</td>
//                 <td className="p-4">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-semibold
//       ${
//         cat.status === "Active"
//           ? "bg-green-100 text-green-700"
//           : "bg-gray-100 text-gray-600"
//       }`}
//                   >
//                     {cat.status}
//                   </span>
//                 </td>

//                 <td className="p-4 text-gray-600">{cat.description || "—"}</td>

//                 <td className="p-4">
//                   <div className="flex justify-center gap-4">
//                     <button
//                       onClick={() => openEdit(cat)}
//                       className=" p-2 rounded-lg
//                      bg-indigo-50 text-indigo-600
//                      hover:bg-indigo-100 hover:text-indigo-800
//                      transition"
//                     >
//                       <FaEdit />
//                     </button>

//                     {cat.status === "Active" && (
//                       <button
//                         onClick={() => deleteCategory(cat._id)}
//                         className="
//                             p-2 rounded-lg
//                             bg-red-100 text-red-600
//                             hover:bg-red-200 hover:text-red-700
//                             transition"
//                         title="Deactivate Category"
//                       >
//                         <FaTrash />
//                       </button>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}

//             {!categories.length && (
//               <tr>
//                 <td colSpan="3" className="p-8 text-center text-gray-500">
//                   No categories found.
//                   <span className="text-indigo-600 font-medium">
//                     {" "}
//                     Add your first category.
//                   </span>
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//         <div className="flex justify-between items-center p-4 border-t">
//           <span className="text-sm text-gray-600">
//             Page {page} of {totalPages}
//           </span>

//           <div className="flex gap-2">
//             <button
//               disabled={page === 1}
//               onClick={() => setPage((p) => Math.max(p - 1, 1))}
//               className="px-3 py-1 border rounded disabled:opacity-50"
//             >
//               Prev
//             </button>

//             <button
//               disabled={page === totalPages}
//               onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//               className="px-3 py-1 border rounded disabled:opacity-50"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
return (
  <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-sans">

    {/* ======== LOADING SPINNER ======== */}
    {loading && (
      <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin shadow-lg"></div>
      </div>
    )}

    {/* ======== MODAL ======== */}
    {showForm && (
      <>
        {/* BACKDROP */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn" />

        {/* MODAL */}
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-dropFromTop border border-gray-100">
          
          {/* HEADER */}
          <div className="px-6 py-4 flex justify-between items-center rounded-t-3xl bg-gradient-to-r from-indigo-600 to-blue-600 shadow-md">
            <h2 className="text-xl font-bold text-white">
              {editCategory ? "Edit Category" : "Create Category"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-white/80 hover:text-white text-2xl transition"
            >
              ✕
            </button>
          </div>

          {/* FORM BODY */}
          <form onSubmit={submitForm} className="p-6 space-y-6">
            {/* NAME */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Category Name <span className="text-red-500">*</span></label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
                placeholder="Enter category name"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                rows="3"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition"
                placeholder="Add description (optional)"
              />
            </div>

            {/* FOOTER BUTTONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    {editCategory ? "Updating..." : "Saving..."}
                  </>
                ) : editCategory ? "Update Category" : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      </>
    )}

    {/* ======== HEADER ======== */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
        <p className="text-sm text-gray-500 mt-1">Organize inventory & product classification</p>
      </div>
      <button
        onClick={openAdd}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition"
      >
        <FaPlus /> Add Category
      </button>
    </div>

    {/* ======== FILTERS ======== */}
    <div className="bg-white p-5 rounded-2xl shadow-md mb-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:gap-4">

        {/* SEARCH */}
        <div className="flex-1 sm:w-64">
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <input
            placeholder="Category name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition"
          />
        </div>

        {/* STATUS */}
        <div className="flex-1 sm:w-40">
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select
            value={statusSearch}
            onChange={(e) => { setStatusSearch(e.target.value); setPage(1); }}
            className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* LIMIT */}
        <div className="flex-1 sm:w-24">
          <label className="block text-sm text-gray-600 mb-1">Limit</label>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            className="w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 transition"
          >
            {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* CLEAR */}
        <div className="sm:pb-1">
          <button
            onClick={() => { setSearch(""); setStatusSearch(""); setPage(1); }}
            className="w-full sm:w-auto px-4 py-2 border rounded-xl hover:bg-gray-100 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    {/* ======== TABLE ======== */}
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Status</th>
            <th className="p-4 text-left">Description</th>
            <th className="p-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length ? categories.map((cat) => (
            <tr key={cat._id} className="border-t hover:bg-indigo-50 transition-colors">
              <td className="p-4 font-medium text-gray-800">{cat.name}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  cat.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {cat.status}
                </span>
              </td>
              <td className="p-4 text-gray-600">{cat.description || "—"}</td>
              <td className="p-4">
                <div className="flex justify-center gap-3">
                  <button onClick={() => openEdit(cat)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition">
                    <FaEdit />
                  </button>
                  {cat.status === "Active" && (
                    <button onClick={() => deleteCategory(cat._id)} className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition">
                      <FaTrash />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" className="p-10 text-center text-gray-500">
                No categories found. <span className="text-indigo-600 font-semibold">Add your first category.</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="flex justify-between items-center p-4 border-t border-gray-100">
        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => Math.max(p - 1, 1))} className="px-3 py-1 border rounded-xl disabled:opacity-50 transition">Prev</button>
          <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(p + 1, totalPages))} className="px-3 py-1 border rounded-xl disabled:opacity-50 transition">Next</button>
        </div>
      </div>
    </div>
  </div>
);

};

export default Categories;
