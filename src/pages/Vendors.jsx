import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editVendor, setEditVendor] = useState(null);
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
    vendorName: "",
    companyName: "",
    email: "",
    phone: "",
    address: "",
    gstNumber: "",
    ntnNumber: "",
  });

  useEffect(() => {
  loadVendors();
}, [page, limit, debouncedSearch, refetch]);



 const loadVendors = async () => {
  try {
    setLoading(true)
    const res = await api.get("/vendors", {
      params: {
        page,
        limit,
        search:debouncedSearch,
      },
    });

    setVendors(res.data.data || []);
    setTotalPages(res.data.pagination?.totalPages || 1);
  } catch (err) {
    toast.error("Failed to load vendors.");
  }
  finally{
    setLoading(false)
  }
};
  const openAdd = () => {
    setEditVendor(null);
    setForm({
      vendorName: "",
      companyName: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      ntnNumber: "",
    });
    setShowForm(true);
  };

  const openEdit = (v) => {
    setEditVendor(v);
    setForm({
      vendorName: v.vendorName,
      companyName: v.companyName,
      email: v.email,
      phone: v.phone,
      address: v.address,
      gstNumber: v.gstNumber,
      ntnNumber: v.ntnNumber,
    });
    setShowForm(true);
  };

  const submitForm = async (e) => {
  e.preventDefault();

  if (!form.vendorName)
    return toast.error("Vendor name is required.");

  if (!form.phone)
    return toast.error("Phone number is required.");

  try {
    setFormLoading(true)
    if (editVendor) {
      await api.put(`/vendors/${editVendor._id}`, form);
      toast.success("Vendor updated successfully");
    } else {
      await api.post("/vendors", form);
      toast.success("Vendor added successfully");
    }

    setShowForm(false);
    setEditVendor(null);
    setRefetch((p) => p + 1);

  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      "Failed to save vendor."
    );
  }
  finally{
    setFormLoading(false)
  }
};

const deleteVendor = async (id) => {
  if (!window.confirm("Delete this vendor?")) return;

  try {
    setLoading(true)
    await api.delete(`/vendors/${id}`);
    toast.success("Vendor deleted successfully");
    setRefetch((p) => p + 1);
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      "Failed to delete vendor."
    );
  }
  finally{
  setLoading(false)
  }
};

return (
  <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">
    {loading && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
    {/* ================= MODAL ================= */}
    {showForm && (
      <>
        {/* BLUR BACKDROP */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn" />

        {/* MODAL */}
        <div
          className="
            fixed top-10 left-1/2 -translate-x-1/2 z-50
            w-full max-w-2xl min-h-[520px]
            bg-white rounded-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            animate-dropFromTop
          "
        >
          {/* HEADER */}
          <div className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
            <h2 className="text-lg font-semibold text-white">
              {editVendor ? "Edit Vendor" : "Add Vendor"}
            </h2>
            <p className="text-indigo-100 text-sm">
              Vendor profile & contact information
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={submitForm}
            className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor Name *
              </label>
              <input
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.vendorName}
                onChange={(e) =>
                  setForm({ ...form, vendorName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST Number
              </label>
              <input
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.gstNumber}
                onChange={(e) =>
                  setForm({ ...form, gstNumber: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NTN Number
              </label>
              <input
                className="w-full border rounded-lg px-4 py-2.5"
                value={form.ntnNumber}
                onChange={(e) =>
                  setForm({ ...form, ntnNumber: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* ACTIONS */}
            <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-100"
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
      {editVendor ? "Updating..." : "Saving..."}
    </>
  ) : (
    editVendor ? "Update Vendor" : "Save Vendor"
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
        <h1 className="text-3xl font-bold text-gray-800">Vendors</h1>
        <p className="text-sm text-gray-600">
          Manage suppliers and vendor profiles
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
        <FaPlus /> Add Vendor
      </button>
    </div>

    {/* ================= TABLE ================= */}
    <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
<div className="flex flex-wrap gap-4 p-4 items-end bg-white rounded-xl shadow mb-4">

  {/* SEARCH */}
  <div className="w-64">
    <label className="block text-sm text-gray-600 mb-1">Search</label>
    <input
      type="text"
      placeholder="Vendor name, phone, company..."
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


      <table className="w-full table-fixed text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left w-[30%]">Vendor Name</th>
            <th className="p-4 text-left w-[20%]">Phone</th>
            <th className="p-4 text-left w-[30%]">Company</th>
            <th className="p-4 text-center w-[20%]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {vendors.map((v) => (
            <tr
              key={v._id}
              className="border-t hover:bg-indigo-50 transition"
            >
              <td className="p-4 font-medium truncate">
                {v.vendorName}
              </td>
              <td className="p-4 text-gray-600">
                {v.phone}
              </td>
              <td className="p-4 truncate text-gray-600">
                {v.companyName || "—"}
              </td>

              <td className="p-4">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => openEdit(v)}
                    className="
        p-2 rounded-lg
        bg-indigo-50 text-indigo-600
        hover:bg-indigo-100 hover:text-indigo-800
        transition
      "
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => deleteVendor(v._id)}
                    className="
        p-2 rounded-lg
        bg-red-100 text-red-600
        hover:bg-red-800 hover:text-red-800
        transition
      "
                  >
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {!vendors.length && (
            <tr>
              <td colSpan="4" className="p-6 text-center text-gray-500">
                No vendors found
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

export default Vendors;
