/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(0);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
  const [form, setForm] = useState({
    name: "",
    uom: "",
    note: "",
    status: "active",
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadProducts();
  }, [page, debouncedSearch, statusFilter, refetch, limit]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products/listProductsPage", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          status: statusFilter,
        },
      });

      setProducts(res.data.data || []);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({
      name: "",
      uom: "",
      note: "",
      status: "active",
    });
    setShowForm(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      uom: product.uom,
      note: product.note || "",
      status: product.status,
      price: product.price,
    });
    setShowForm(true);
  };

  const submitForm = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!form.name.trim()) {
      return toast.error("Product name is required.");
    }

    if (!form.uom) {
      return toast.error("Please select a unit of measure.");
    }

    try {
      setFormLoading(true);
      if (editProduct) {
        await api.put(`/products/${editProduct._id}`, form);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", form);
        toast.success("Product created successfully");
      }

      setTimeout(() => {
        setShowForm(false);
        setEditProduct(null);
        setForm({
          name: "",
          uom: "",
          note: "",
          status: "active",
          price: 0,
        });
        setRefetch((p) => p + 1);
      }, 100);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to save product. Please try again."
      );
    } finally {
      setFormLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to Inactive this product?"))
      return;
    try {
      setLoading(true);
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully");
      setRefetch((p) => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to delete product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">

      {/* ================= MODAL ================= */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowForm(false)}
          />

          <div
            className="
            fixed top-16 left-1/2 -translate-x-1/2 z-50
            w-full max-w-lg
            bg-white rounded-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          "
          >
            {/* MODAL HEADER */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white">
                {editProduct ? "Edit Product" : "Add Product"}
              </h2>
            </div>

            {/* FORM */}
            <form onSubmit={submitForm} className="p-6 space-y-4">
              <input
                placeholder="Product Name"
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />

              <select
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.uom}
                onChange={(e) => setForm({ ...form, uom: e.target.value })}
                required
              >
                <option value="">Select Unit</option>
                <option value="pcs">PCS</option>
                <option value="pair">PAIR</option>
                <option value="set">SET</option>
              </select>

              <select
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <input
                placeholder="Product Price"
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
              />
              <textarea
                placeholder="Note"
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />

              {/* ACTIONS */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
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
                      {editProduct ? "Updating..." : "Saving..."}
                    </>
                  ) : editProduct ? (
                    "Update Product"
                  ) : (
                    "Save Product"
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
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-sm text-gray-600">
            Manage finished goods & inventory units
          </p>
        </div>

        <button
          onClick={openAdd}
          className="
          flex items-center gap-2
          bg-gradient-to-r from-indigo-600 to-blue-600
          text-white px-5 py-2 rounded-lg
          shadow-md hover:shadow-lg transition
        "
        >
          <FaPlus /> Add Product
        </button>
      </div>
<div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* 🔍 SEARCH */}
    <div className="w-full sm:w-64">
      <label className="block text-sm text-gray-600 mb-1">
        Search
      </label>
      <input
        className="w-full border rounded-lg px-4 py-2"
        placeholder="Category name..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
    </div>

    {/* 📌 STATUS */}
    <div className="w-full sm:w-40">
      <label className="block text-sm text-gray-600 mb-1">
        Status
      </label>
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
        className="w-full border rounded-lg px-3 py-2"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    {/* 📄 LIMIT */}
    <div className="w-full sm:w-24">
      <label className="block text-sm text-gray-600 mb-1">
        Limit
      </label>
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={limit}
        onChange={(e) => {
          setLimit(Number(e.target.value));
          setPage(1);
        }}
      >
        {PAGE_SIZE_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>

    {/* CLEAR */}
    <div className="w-full sm:w-auto sm:pb-[2px]">
      <button
        onClick={() => {
          setSearch("");
          setStatusFilter("");
          setPage(1);
        }}
        className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-slate-100 transition"
      >
        Clear
      </button>
    </div>

  </div>
</div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left w-[30%]">Name</th>
              <th className="p-4 text-left w-[20%]">SKU</th>
              <th className="p-4 text-left w-[15%]">Price</th>
              <th className="p-4 text-left w-[15%]">Unit</th>
              <th className="p-4 text-left w-[15%]">Status</th>
              <th className="p-4 text-center w-[20%]">Actions</th>
            </tr>
          </thead>
{loading ? (
      <tbody>
        <tr>
          <td colSpan="6" className="h-40">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </td>
        </tr>
      </tbody>
    ) :
       (   <tbody>
            {products.map((p) => (
              <tr
                key={p._id}
                className="border-t hover:bg-indigo-50 transition"
              >
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{p.sku}</td>
                <td className="p-4 uppercase">{p.price}</td>
                <td className="p-4 uppercase">{p.uom}</td>
                <td className="p-4 capitalize">
                  <span
                    className={`px-2 py-1 rounded-md text-sm ${
                      p.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="
                      p-2 rounded-lg
                      bg-indigo-50 text-indigo-600
                      hover:bg-indigo-100 hover:text-indigo-800
                    "
                    >
                      <FaEdit />
                    </button>
                    {p.status === "active" && (
                      <button
                        onClick={() => deleteProduct(p._id)}
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
                </td>
              </tr>
            ))}

            {!products.length && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>)}
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

export default Product;
