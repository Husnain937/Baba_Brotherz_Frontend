/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus, FaTrash, FaEdit, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

const BOM = () => {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [viewBOM, setViewBOM] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [status,setStatus] = useState("");
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [refetch, setRefetch] = useState(0);

  const [form, setForm] = useState({
    product: "",
    items: [{ item: "", quantity: "" }],
    note: "",
    status: "Active",
  });

  /* ===================== LOAD DATA ===================== */

  useEffect(() => {
    loadBOMs();
  }, [page, limit, debouncedSearch, refetch ,status]);

  useEffect(() => {
    loadProducts();
    loadItems();
  }, []);

  const loadBOMs = async () => {
    try {
      const res = await api.get("/bom/listBOMsPage", {
        params: {
          page,
          limit,
          search: debouncedSearch || undefined, // 🔍 PRODUCT ONLY
          status
        },
      });

      setBoms(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load BOMs");
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  const loadItems = async () => {
    try {
      const res = await api.get("/items/dropdown/items");
      setItems(res.data.data || []);
    } catch {
      toast.error("Failed to load raw materials");
    }
  };

  /* ===================== FORM HELPERS ===================== */

  const addRow = () => {
    setForm({
      ...form,
      items: [...form.items, { item: "", quantity: "" }],
    });
  };

  const removeRow = (index) => {
    const rows = [...form.items];
    rows.splice(index, 1);
    setForm({ ...form, items: rows });
  };

  const updateRow = (index, field, value) => {
    const rows = [...form.items];
    rows[index][field] = value;
    setForm({ ...form, items: rows });
  };

  /* ===================== CREATE / UPDATE ===================== */

  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.product) return toast.error("Select a product");
    if (!form.items.length) return toast.error("Add at least one item");

    for (let i of form.items) {
      if (!i.item || !i.quantity || i.quantity <= 0) {
        return toast.error("Invalid item quantity");
      }
    }

    const payload = {
      product: form.product,
      items: form.items.map((i) => ({
        item: i.item,
        quantity: Number(i.quantity),
      })),
      note: form.note,
      status: form.status,
    };

    try {
      if (editingId) {
        await api.put(`/bom/${editingId}`, payload);
        toast.success("BOM updated successfully");
      } else {
        await api.post("/bom", payload);
        toast.success("BOM created successfully");
      }

      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      product: "",
      items: [{ item: "", quantity: "" }],
      note: "",
      status: "Active",
    });
    setRefetch((p) => p + 1);
  };

  /* ===================== EDIT ===================== */

  const handleEdit = (bom) => {
    setEditingId(bom._id);
    setForm({
      product: bom.product?._id,
      items: bom.items.map((i) => ({
        item: i.item?._id,
        quantity: i.quantity,
      })),
      note: bom.note || "",
      status: bom.status ?? "Active",
    });
    setShowForm(true);
  };

  /* ===================== DELETE ===================== */

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to Inactive this BOM?")) return;

    try {
      await api.delete(`/bom/${id}`);
      toast.success("BOM deleted successfully");
      setRefetch((p) => p + 1);
    } catch {
      toast.error("Failed to delete BOM");
    }
  };
const getBOMStatusBadge = (status) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 border border-green-200";

    case "Inactive":
      return "bg-gray-100 text-gray-600 border border-gray-200";

    default:
      return "bg-gray-100 text-gray-600 border border-gray-200";
  }
};


  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">
      {viewBOM && (
        <>
          {/* BACKDROP */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setViewBOM(null)}
          />

          {/* MODAL */}
          <div
            className="
        fixed top-16 left-1/2 -translate-x-1/2 z-50
        w-full max-w-3xl
        bg-white rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
      "
          >
            {/* HEADER */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-green-600 rounded-t-2xl">
              <h2 className="text-xl font-semibold text-white">BOM Details</h2>
              <p className="text-sm text-green-100 mt-1">
                {viewBOM.product?.name} ({viewBOM.product?.sku})
              </p>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-4">
              {/* ITEMS TABLE */}
              {/* ITEMS TABLE */}
              <div
                className="
    border rounded-lg overflow-hidden
    max-h-[360px]        /* 🔥 Max height (~8 rows) */
    overflow-y-auto
  "
              >
                <table className="w-full">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      <th className="p-3 text-left">Raw Material</th>
                      <th className="p-3 text-center">Quantity</th>
                      <th className="p-3 text-center">UOM</th>
                    </tr>
                  </thead>

                  <tbody>
                    {viewBOM.items.map((i) => (
                      <tr
                        key={i._id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="p-3 font-medium">{i.item?.name}</td>
                        <td className="p-3 text-center font-semibold">
                          {i.quantity}
                        </td>
                        <td className="p-3 text-center text-gray-600">
                          {i.item?.uom || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end px-6 py-4 border-t">
              <button
                onClick={() => setViewBOM(null)}
                className="
            px-5 py-2 rounded-lg
            bg-gray-200 text-gray-700
            hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Bill of Materials (BOM)
          </h1>
          <p className="text-sm text-gray-600">
            Define raw materials for finished products
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="
          flex items-center gap-2
          bg-gradient-to-r from-indigo-600 to-blue-600
          text-white px-5 py-2 rounded-lg
          shadow-md hover:shadow-lg transition
        "
        >
          <FaPlus /> Add BOM
        </button>
      </div>

      {/* ================= MODAL ================= */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={resetForm}
          />

          <div
            className="
            fixed top-16 left-1/2 -translate-x-1/2 z-50
            w-full max-w-3xl
            bg-white rounded-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            max-h-[80vh]          /* 🔥 LIMIT HEIGHT */
    flex flex-col 
          "
          >
            {/* MODAL HEADER */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? "Edit BOM" : "Create BOM"}
              </h2>
            </div>

            {/* FORM */}
            <form onSubmit={submitForm} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* PRODUCT */}
              <select
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                required
              >
                <option value="">Select Finished Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
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

              {/* ITEMS */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2 ">
                {form.items.map((row, index) => (
                  <div key={index} className="flex gap-3 items-center">
                    <select
                      className="flex-1 border rounded-lg px-3 py-2"
                      value={row.item}
                      onChange={(e) => updateRow(index, "item", e.target.value)}
                      required
                    >
                      <option value="">Select Raw Material</option>
                      {items.map((i) => (
                        <option key={i._id} value={i._id}>
                          {i.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0"
                      step="0.01"                // ✅ allows decimals (0.5, 1.25, etc.)
                      inputMode="decimal" 
                      className="w-28 border rounded-lg px-3 py-2 text-left"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(index, "quantity", e.target.value)
                      }
                      required
                    />

                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(index)}
                        className="
                        p-2 rounded-lg
                        bg-red-50 text-red-600
                        hover:bg-red-100 hover:text-red-800
                      "
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
               
              <button
                type="button"
                onClick={addRow}
                className="text-indigo-600 text-sm hover:underline"
              >
                + Add Item
              </button>

              <textarea
                placeholder="Note"
                className="w-full border rounded-lg px-4 py-2"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />

              {/* ACTIONS */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                  px-6 py-2 rounded-lg text-white
                  bg-gradient-to-r from-green-600 to-emerald-600
                  hover:from-green-700 hover:to-emerald-700
                "
                >
                  {editingId ? "Update BOM" : "Save BOM"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ================= LIST ================= */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <div className="flex flex-wrap gap-4 p-5 items-end">
          {/* 🔍 PRODUCT SEARCH */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Search Product
            </label>
            <input
              type="text"
              placeholder="Search by product name or SKU"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-64"
            />
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
          {/* 📄 LIMIT */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Limit</label>
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
        </div>

       <table className="w-full table-fixed text-sm">
  <thead className="bg-gray-100 border-b">
    <tr>
      <th className="p-4 text-left w-[25%] font-semibold text-gray-700">
        Product
      </th>
      <th className="p-4 text-left w-[25%] font-semibold text-gray-700">
        Status
      </th>
      <th className="p-4 text-left w-[20%] font-semibold text-gray-700">
        Created
      </th>
      <th className="p-4 text-center w-[20%] font-semibold text-gray-700">
        Actions
      </th>
    </tr>
  </thead>

  <tbody>
    {boms.map((b, idx) => (
      <tr
        key={b._id}
        className={`
          border-b
          transition
          ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
          hover:bg-indigo-50
        `}
      >
        {/* PRODUCT */}
        <td className="p-4 font-medium text-gray-800 truncate">
          {b.product?.name || "—"}
        </td>

        {/* STATUS */}
        <td className="p-4">
          <span
            className={`
              inline-flex items-center px-3 py-1
              rounded-full text-xs font-semibold capitalize
              ${getBOMStatusBadge(b.status)}
            `}
          >
            {b.status}
          </span>
        </td>

        {/* CREATED */}
        <td className="p-4 text-gray-600">
          {new Date(b.createdAt).toLocaleDateString()}
        </td>

        {/* ACTIONS */}
        <td className="p-4">
          <div className="flex justify-center gap-3">

            {/* 👁 VIEW */}
            <button
              onClick={() => setViewBOM(b)}
              title="View BOM"
              className="
                p-2 rounded-lg
                bg-green-50 text-green-600
                hover:bg-green-100 hover:text-green-800
                transition
              "
            >
              <FaEye />
            </button>

            {/* ✏️ EDIT */}
            <button
              onClick={() => handleEdit(b)}
              title="Edit BOM"
              className="
                p-2 rounded-lg
                bg-indigo-50 text-indigo-600
                hover:bg-indigo-100 hover:text-indigo-800
                transition
              "
            >
              <FaEdit />
            </button>

            {/* 🗑 DELETE */}
            {b.status === "Active" && (
            <button
              onClick={() => handleDelete(b._id)}
              title="Delete BOM"
              className="
                p-2 rounded-lg
                bg-red-50 text-red-600
                hover:bg-red-100 hover:text-red-800
                transition
              "
            >
              <FaTrash />
            </button>)}
          </div>
        </td>
      </tr>
    ))}

    {!boms.length && (
      <tr>
        <td colSpan="4" className="p-8 text-center text-gray-500">
          No BOMs found
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
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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

export default BOM;
