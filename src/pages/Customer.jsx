import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [refetch, setRefetch] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== Pagination & Filters =====
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const [form, setForm] = useState({
    customerName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    loadCustomers();
  }, [page, limit, debouncedSearch, refetch]);

  // ================= LOAD =================
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/customers", {
        params: { page, limit, search: debouncedSearch },
      });

      setCustomers(res.data.data || res.data.customers || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  // ================= MODAL =================
  const openAdd = () => {
    setEditCustomer(null);
    setForm({
      customerName: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
    });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditCustomer(c);
    setForm({
      customerName: c.customerName,
      companyName: c.companyName,
      email: c.email,
      phone: c.phone,
      address: c.address,
    });
    setShowForm(true);
  };

  // ================= SAVE =================
  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.customerName)
      return toast.error("Customer name is required.");

    if (!form.phone)
      return toast.error("Phone number is required.");

    try {
      setFormLoading(true);

      if (editCustomer) {
        await api.put(`/customers/${editCustomer._id}`, form);
        toast.success("Customer updated successfully");
      } else {
        await api.post("/customers", form);
        toast.success("Customer added successfully");
      }

      setShowForm(false);
      setEditCustomer(null);
      setRefetch((p) => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save customer.");
    } finally {
      setFormLoading(false);
    }
  };

  // ================= DELETE =================
  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      setLoading(true);
      await api.delete(`/customers/${id}`);
      toast.success("Customer deleted successfully");
      setRefetch((p) => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">
      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* ================= MODAL ================= */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl bg-white rounded-2xl shadow-xl">
            <div className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white">
                {editCustomer ? "Edit Customer" : "Add Customer"}
              </h2>
              <p className="text-emerald-100 text-sm">
                Customer profile & contact information
              </p>
            </div>

            <form
              onSubmit={submitForm}
              className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Name *
                </label>
                <input
                  className="w-full border rounded-lg px-4 py-2.5"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm({ ...form, customerName: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name
                </label>
                <input
                  className="w-full border rounded-lg px-4 py-2.5"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-4 py-2.5"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone *
                </label>
                <input
                  className="w-full border rounded-lg px-4 py-2.5"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <textarea
                  rows="3"
                  className="w-full border rounded-lg px-4 py-2.5"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-lg text-white
             bg-gradient-to-r from-indigo-600 to-blue-600
             hover:from-indigo-700 hover:to-blue-700
             shadow-md hover:shadow-lg
             transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {formLoading
                    ? editCustomer
                      ? "Updating..."
                      : "Saving..."
                    : editCustomer
                    ? "Update Customer"
                    : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customers</h1>
          <p className="text-sm text-gray-600">
            Manage customers and receivables
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-2
          bg-gradient-to-r from-indigo-600 to-blue-600
          text-white px-5 py-2 rounded-lg
          shadow-md hover:shadow-lg transition"
        >
          <FaPlus /> Add Customer
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="flex flex-wrap gap-4 p-4 items-end bg-white rounded-xl shadow mb-4">

  {/* SEARCH */}
  <div className="w-64">
    <label className="block text-sm text-gray-600 mb-1">Search</label>
    <input
      type="text"
      placeholder="Customer name, phone, company..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
      className="w-full border rounded-lg px-4 py-2"
    />
  </div>

  {/* LIMIT */}
  <div className="w-24">
    <label className="block text-sm text-gray-600 mb-1">Limit</label>
    <select
      value={limit}
      onChange={(e) => {
        setLimit(Number(e.target.value));
        setPage(1);
      }}
      className="w-full border rounded-lg px-3 py-2"
    >
      {PAGE_SIZE_OPTIONS.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  </div>

  {/* CLEAR */}
  <div className="mt-6">
    <button
      onClick={() => {
        setSearch("");
        setPage(1);
      }}
      className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
    >
      Clear
    </button>
  </div>
</div>

      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Customer Name</th>
              <th className="p-4 text-left">Phone</th>
              <th className="p-4 text-left">Company</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {customers.map((c) => (
              <tr key={c._id} className="border-t hover:bg-emerald-50">
                <td className="p-4 font-medium">{c.customerName}</td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4">{c.companyName || "—"}</td>
                <td className="p-4 flex justify-center gap-3">
                  <button
                    onClick={() => openEdit(c)}
                    className="  p-2 rounded-lg
        bg-indigo-50 text-indigo-600
        hover:bg-indigo-100 hover:text-indigo-800
        transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteCustomer(c._id)}
                    className="p-2 rounded-lg
    bg-red-100 text-red-600
    hover:bg-red-200 hover:text-red-800
    transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}

            {!customers.length && (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  No customers found
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

export default Customers;
