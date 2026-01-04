/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const VendorLedger = () => {
  /* ================= STATES ================= */
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");

  const [ledger, setLedger] = useState([]);
  const [vendor, setVendor] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [loading, setLoading] = useState(false);

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

  /* ================= LOAD VENDORS ================= */
  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const res = await api.get("/vendors/dropdown/vendors", {
      });
      setVendors(res.data.vendors || []);
    } catch (err) {
      toast.error("Failed to load vendors");
    }
  };

  /* ================= SEARCH DEBOUNCE ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ================= LOAD LEDGER ================= */
  useEffect(() => {
    if (selectedVendorId) loadLedger();
  }, [selectedVendorId, page, limit, debouncedSearch]);

  const loadLedger = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/vendorLedgerRoutes/${selectedVendorId}`,
        {
          params: { page, limit, search: debouncedSearch },
        }
      );

      setLedger(res.data.ledger || []);
      setVendor(res.data.vendor || null);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load vendor ledger"
      );
    }

    setLoading(false);
  };

  return (
    <div>
      {/* ================= LOADING ================= */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Vendor Ledger</h1>

        {vendor && (
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">{vendor.vendorName}</span> • Current
            Balance:{" "}
            <span className="font-semibold text-indigo-600">
              {vendor.currentBalance.toLocaleString()}
            </span>
          </p>
        )}
      </div>

      {/* ================= FILTER BAR ================= */}
     <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex flex-wrap gap-4 items-end">

  {/* VENDOR DROPDOWN */}
  <div className="w-72">
    <label className="block text-sm text-gray-600 mb-1">Select Vendor</label>
    <select
      className="w-full border rounded-lg px-4 py-2"
      value={selectedVendorId}
      onChange={(e) => {
        setSelectedVendorId(e.target.value);
        setPage(1);
      }}
    >
      <option value="">-- Select Vendor --</option>
      {vendors.map((v) => (
        <option key={v._id} value={v._id}>
          {v.vendorName} {v.companyName ? `(${v.companyName})` : ""}
        </option>
      ))}
    </select>
  </div>

  {/* SEARCH */}
  <div className="w-64">
    <label className="block text-sm text-gray-600 mb-1">Search</label>
    <input
      type="text"
      placeholder="Search ledger..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      disabled={!selectedVendorId}
      className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
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
      disabled={!selectedVendorId}
      className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
    >
      {PAGE_SIZE_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
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
      disabled={!selectedVendorId}
      className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed"
    >
      Clear
    </button>
  </div>

</div>


      {/* ================= TABLE ================= */}
      {!selectedVendorId ? (
        <div className="text-center text-gray-500 bg-white p-10 rounded-2xl shadow">
          Please select a vendor to view ledger
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-center">Debit</th>
                <th className="p-4 text-center">Credit</th>
                <th className="p-4 text-right">Balance</th>
              </tr>
            </thead>

            <tbody>
              {ledger.map((row) => (
                <tr
                  key={row._id}
                  className="border-t hover:bg-indigo-50 transition"
                >
                  <td className="p-4">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">{row.description || "—"}</td>

                  <td className="p-4 text-center text-green-600 font-medium">
                    {row.type === "Debit"
                      ? row.amount.toLocaleString()
                      : "—"}
                  </td>

                  <td className="p-4 text-center text-red-600 font-medium">
                    {row.type === "Credit"
                      ? row.amount.toLocaleString()
                      : "—"}
                  </td>

                  <td className="p-4 text-right font-semibold">
                    {row.balanceAfter.toLocaleString()}
                  </td>
                </tr>
              ))}

              {!ledger.length && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No ledger records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PAGINATION */}
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorLedger;
