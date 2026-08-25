import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const CustomerLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  const [ledger, setLedger] = useState([]);
  const [customer, setCustomer] = useState(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

  /* ================= LOAD CUSTOMERS ================= */
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers/dropdown");
      setCustomers(res.data.customers || []);
    } catch {
      toast.error("Failed to load customers");
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
    if (selectedCustomerId) loadLedger();
  }, [selectedCustomerId, page, limit, debouncedSearch]);

  const loadLedger = async () => {
    try {
      setLoading(true);

      const res = await api.get(
        `/customer-ledger/${selectedCustomerId}`,
        { params: { page, limit, search: debouncedSearch } }
      );

      setLedger(res.data.ledger || []);
      setCustomer(res.data.customer || null);
      setTotalPages(res.data.pagination?.totalPages || 1);

    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to load customer ledger"
      );
    }

    setLoading(false);
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Customer Ledger</h1>

        {customer && (
          <p className="text-sm text-gray-600 mt-1">
            <span className="font-semibold">{customer.customerName}</span> •
            Balance:{" "}
            <span className="font-semibold text-indigo-600">
              {customer.currentBalance.toLocaleString()}
            </span>
          </p>
        )}
      </div>

      {/* FILTER */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex gap-4 items-end">
        <div className="w-72">
          <label className="block text-sm text-gray-600 mb-1">Customer</label>
          <select
            className="w-full border rounded-lg px-4 py-2"
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">-- Select Customer --</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>
                {c.customerName}
              </option>
            ))}
          </select>
        </div>

        <div className="w-64">
          <label className="block text-sm text-gray-600 mb-1">Search</label>
          <input
            type="text"
            value={search}
            disabled={!selectedCustomerId}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 disabled:bg-gray-100"
          />
        </div>

        <div className="w-24">
          <label className="block text-sm text-gray-600 mb-1">Limit</label>
          <select
            value={limit}
            disabled={!selectedCustomerId}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      {!selectedCustomerId ? (
        <div className="text-center text-gray-500 bg-white p-10 rounded-2xl shadow">
          Please select a customer to view ledger
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Description</th>
                <th className="p-4 text-center">Debit</th>
                <th className="p-4 text-center">Credit</th>
                <th className="p-4 text-right">Balance</th>
              </tr>
            </thead>
            {loading ? (
      <tbody>
        <tr>
          <td colSpan="5" className="h-40">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </td>
        </tr>
      </tbody>
    ) :
            (<tbody>
              {ledger.map((row) => (
                <tr key={row._id} className="border-t hover:bg-indigo-50">
                  <td className="p-4">
                    {new Date(row.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">{row.description || "—"}</td>

                  <td className="p-4 text-center text-red-600 font-medium">
                    {row.type === "Debit" ? row.amount.toLocaleString() : "—"}
                  </td>

                  <td className="p-4 text-center text-green-600 font-medium">
                    {row.type === "Credit" ? row.amount.toLocaleString() : "—"}
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
            </tbody>)}
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerLedger;
