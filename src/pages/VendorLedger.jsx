import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaSearch } from "react-icons/fa";

const VendorLedger = () => {
  const [vendors, setVendors] = useState([]);
  const [ledger, setLedger] = useState([]);

  const [selectedVendor, setSelectedVendor] = useState("");
  const [runningBalance, setRunningBalance] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    const res = await api.get("/vendors/dropdown/vendors");
    setVendors(res.data.vendors || []);
  };

  const loadLedger = async () => {
    if (!selectedVendor) return alert("Select vendor first");

    const res = await api.get(`/vendor-ledger/${selectedVendor}`, {
      params: { fromDate, toDate },
    });

    const entries = res.data.ledger || [];

    // Calculate running balance
    let balance = 0;
    const updated = entries.map((e) => {
      if (e.type === "Credit") balance += e.amount; // vendor ko dena hai
      else balance -= e.amount; // vendor ko pay kia

      return { ...e, balance };
    });

    setLedger(updated);
    setRunningBalance(balance);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Vendor Ledger</h1>

      {/* FILTER CARD */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          className="border p-2 rounded"
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
        >
          <option value="">Select Vendor</option>
          {vendors.map((v) => (
            <option key={v._id} value={v._id}>
              {v.vendorName}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 rounded"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <button
          onClick={loadLedger}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded justify-center"
        >
          <FaSearch className="mr-2" /> Search
        </button>
      </div>

      {/* BALANCE CARD */}
      {selectedVendor && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-4">
          <h2 className="text-lg font-semibold">
            Outstanding Balance:
            <span className="ml-2 font-bold text-red-600">
              {runningBalance.toFixed(2)}
            </span>
          </h2>
        </div>
      )}

      {/* LEDGER TABLE */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Debit</th>
              <th className="p-3 text-left">Credit</th>
              <th className="p-3 text-left">Balance</th>
            </tr>
          </thead>

          <tbody>
            {ledger.map((l, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {new Date(l.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3">{l.description || "-"}</td>

                <td className="p-3 text-red-600">
                  {l.type === "Debit" ? l.amount.toFixed(2) : "-"}
                </td>

                <td className="p-3 text-green-600">
                  {l.type === "Credit" ? l.amount.toFixed(2) : "-"}
                </td>

                <td className="p-3 font-semibold">
                  {l.balance.toFixed(2)}
                </td>
              </tr>
            ))}

            {!ledger.length && (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No ledger entries found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendorLedger;
