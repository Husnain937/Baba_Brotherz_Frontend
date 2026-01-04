/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const Stock = () => {
  const [activeTab, setActiveTab] = useState("master");

  const [stockMaster, setStockMaster] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [itemSearch, setItemSearch] = useState("");
  const [ledgerItem, setLedgerItem] = useState("");
  const [ledgerInOut, setledgerInOut] = useState("");
  const [showLedgerFilters, setShowLedgerFilters] = useState(false);

  // ===== Stock Master =====
  const [masterPage, setMasterPage] = useState(1);
  const [masterLimit, setMasterLimit] = useState(10);
  const [masterTotalPages, setMasterTotalPages] = useState(1);
  const [masterSearch, setMasterSearch] = useState("");
  const [debouncedMasterSearch, setDebouncedMasterSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  // ===== Stock Ledger =====
  const [debouncedLedgerSearch, setDebouncedLedgerSearch] = useState("");

  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerLimit, setLedgerLimit] = useState(10);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerStartDate, setLedgerStartDate] = useState("");
  const [ledgerEndDate, setLedgerEndDate] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMasterSearch(masterSearch);
      setMasterPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [masterSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLedgerSearch(ledgerSearch);
      setLedgerPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [ledgerSearch]);

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
  const filteredItems = itemsList.filter((it) =>
    it.name.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    item: "",
    type: "Increase",
    quantity: "",
    reason: "",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    loadStockMaster();
    loadLedger();
    loadItems();
  }, []);

  const loadStockMaster = async () => {
    try {
      setLoading(true)
      const res = await api.get("/stock/master", {
        params: {
          page: masterPage,
          limit: masterLimit,
          search: debouncedMasterSearch,
        },
      });

      setStockMaster(res.data.data || []);
      setMasterTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to load stock master");
    }
    setLoading(false)
  };
  useEffect(() => {
    if (activeTab === "master") {
      loadStockMaster();
    }
  }, [activeTab, masterPage, masterLimit, debouncedMasterSearch]);

  const loadLedger = async () => {
    try {
      setLoading(true)
      const res = await api.get("/stock/ledger", {
        params: {
          page: ledgerPage,
          limit: ledgerLimit,
          search: debouncedLedgerSearch,
          item: ledgerItem || undefined,
          startDate: ledgerStartDate || undefined,
          endDate: ledgerEndDate || undefined,
          type: ledgerInOut,
        },
      });
      setLedger(res.data.data || []);
      setLedgerTotalPages(res.data.pagination?.totalPages || 1);
    } catch {
      toast.error("Failed to load stock ledger");
    }
    setLoading(false)
  };
  useEffect(() => {
    if (activeTab === "ledger") {
      loadLedger();
    }
  }, [
    activeTab,
    ledgerPage,
    ledgerLimit,
    debouncedLedgerSearch,
    ledgerStartDate,
    ledgerItem,
    ledgerEndDate,
    ledgerInOut,
  ]);

  const loadItems = async () => {
    try {
      setLoading(true)
      const res = await api.get("/items/dropdown/items");
      setItemsList(res.data.data || []);
    } catch {
      toast.error("Failed to load items");
    }
    setLoading(false)
  };

  /* ================= ADJUST STOCK ================= */
  const submitAdjustment = async (e) => {
    e.preventDefault();
    setFormLoading(true)
    if (!adjustForm.item) return toast.error("Select an item");
    if (!adjustForm.quantity || Number(adjustForm.quantity) <= 0)
      return toast.error("Quantity must be greater than 0");

    try {
      await api.post("/stock/adjust", {
        ...adjustForm,
        quantity: Number(adjustForm.quantity),
      });

      toast.success("Stock adjusted successfully");

      setAdjustForm({
        item: "",
        type: "Increase",
        quantity: "",
        reason: "",
      });

      setShowAdjust(false);
      loadStockMaster();
      loadLedger();
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment failed");
    }
    setFormLoading(false)
  };
const getStockStatus = (quantity, minLevel, reorderLevel) => {
  if (quantity === 0) {
    return {
      label: "Empty",
      className: "bg-gray-200 text-gray-700"
    };
  }

  if (quantity <= reorderLevel) {
    return {
      label: "Reorder Point",
      className: "bg-red-100 text-red-700"
    };
  }

  if (quantity <= minLevel) {
    return {
      label: "Minimum",
      className: "bg-yellow-100 text-yellow-700"
    };
  }

  return {
    label: "Stable",
    className: "bg-green-100 text-green-700"
  };
};

  /* ================= UI ================= */
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">
       {loading && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Stock Management</h1>
          <p className="text-sm text-gray-600">
            Monitor inventory levels and stock movements
          </p>
        </div>

        <button
          onClick={() => setShowAdjust(true)}
          className="
          flex items-center gap-2
          bg-gradient-to-r from-indigo-600 to-blue-600
          text-white px-5 py-2 rounded-lg
          shadow-md hover:shadow-lg
          transition
        "        >
          <FaPlus /> Adjust Stock
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-6 mb-6 border-b">
        {[
          { key: "master", label: "Stock Master" },
          { key: "ledger", label: "Stock Ledger" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
            pb-3 px-1 font-medium transition
            ${
              activeTab === tab.key
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }
          `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= STOCK MASTER ================= */}
      {activeTab === "master" && (<>
        <div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* 🔍 SEARCH */}
    <div className="w-full sm:w-64">
      <label className="block text-sm text-gray-600 mb-1">Search</label>
      <input
        type="text"
        placeholder="Item or SKU..."
        value={masterSearch}
        onChange={(e) => setMasterSearch(e.target.value)}
        className="w-full border rounded-lg px-4 py-2"
      />
    </div>

    {/* 📄 LIMIT */}
    <div className="w-full sm:w-24">
      <label className="block text-sm text-gray-600 mb-1">Limit</label>
      <select
        value={masterLimit}
        onChange={(e) => {
          setMasterLimit(Number(e.target.value));
          setMasterPage(1);
        }}
        className="w-full border rounded-lg px-3 py-2"
      >
        {PAGE_SIZE_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>

    {/* 🔄 CLEAR BUTTON */}
    <div className="w-full sm:w-auto sm:pb-[2px]">
      <button
        onClick={() => {
          setMasterSearch("");
          setPage(1);
        }}
        className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
      >
        Clear
      </button>
    </div>

  </div>
</div>

        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
         
          <table className="w-full table-fixed text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left w-[20%]">Item</th>
                <th className="p-4 text-left w-[25%]">SKU</th>
                <th className="p-4 text-right w-[15%]">Quantity</th>
                <th className="p-4 text-center w-[20%]">Status</th>
                <th className="p-4 text-center w-[20%]">Unit</th>
              </tr>
            </thead>
            <tbody>
             {stockMaster.map((s) => {
  // 🔥 FUNCTION CALL HAPPENS HERE
  const status = getStockStatus(
    s.quantity,
    s.item?.minLevel ?? 0,
    s.item?.reorderLevel ?? 0
  );

  return (
    <tr key={s._id} className="border-t hover:bg-indigo-50">
      <td className="p-4 font-semibold">{s.item?.name}</td>
      <td className="p-4">{s.item?.sku}</td>
      <td className="p-4 text-right">{s.quantity}</td>
       {/* 👇 USING THE RESULT */}
      <td className="p-4 text-center">
        <span className={`px-3 py-1 rounded-full text-xs ${status.className}`}>
          {status.label}
        </span>
      </td>
      <td className="p-4 text-center">{s.item?.uom}</td>
    </tr>
  );
})}
              {!stockMaster.length && (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-gray-500">
                    No stock data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Page {masterPage} of {masterTotalPages}
            </span>

            <div className="flex gap-2">
              <button
                disabled={masterPage === 1}
                onClick={() => setMasterPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              <button
                disabled={masterPage === masterTotalPages}
                onClick={() =>
                  setMasterPage((p) => Math.min(p + 1, masterTotalPages))
                }
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
     </> )}

      {/* ================= STOCK LEDGER ================= */}
      {activeTab === "ledger" && (
        <>
        <div className="bg-white rounded-xl shadow mb-4">

  {/* ================= TOP BAR: SEARCH + LIMIT + ADVANCED BUTTON ================= */}
  <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 p-4 border-b">

    {/* LEFT: SEARCH + LIMIT */}
    <div className="flex flex-col sm:flex-row sm:items-end gap-4 w-full md:w-auto">
      {/* SEARCH */}
      <div className="w-full sm:w-64">
        <label className="block text-sm text-gray-600 mb-1">Search</label>
        <input
          type="text"
          placeholder="Item, source, reference..."
          value={ledgerSearch}
          onChange={(e) => {
            setLedgerSearch(e.target.value);
            setLedgerPage(1);
          }}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      {/* LIMIT */}
      <div className="w-full sm:w-24">
        <label className="block text-sm text-gray-600 mb-1">Limit</label>
        <select
          value={ledgerLimit}
          onChange={(e) => {
            setLedgerLimit(Number(e.target.value));
            setLedgerPage(1);
          }}
          className="w-full border rounded-lg px-3 py-2"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>

    {/* RIGHT: ADVANCED FILTERS TOGGLE */}
    <div className="flex-shrink-0">
      <button
        onClick={() => setShowLedgerFilters((p) => !p)}
        className="
          flex items-center gap-2
          px-4 py-2
          border rounded-lg
          text-sm font-medium
          bg-white
          hover:bg-gray-100
          transition
        "
      >
        ➕ Advanced Filters
      </button>
    </div>

  </div>

  {/* ================= ADVANCED FILTERS ================= */}
  {showLedgerFilters && (
    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 p-4 items-end">

      {/* ITEM */}
      <div className="w-full sm:w-64">
        <label className="block text-sm text-gray-600 mb-1">Item</label>
        <select
          value={ledgerItem}
          onChange={(e) => {
            setLedgerItem(e.target.value);
            setLedgerPage(1);
          }}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
        >
          <option value="">All Items</option>
          {itemsList.map((it) => (
            <option key={it._id} value={it._id}>{it.name}</option>
          ))}
        </select>
      </div>

      {/* FROM DATE */}
      <div className="w-full sm:w-40">
        <label className="block text-sm text-gray-600 mb-1">From Date</label>
        <input
          type="date"
          value={ledgerStartDate}
          onChange={(e) => {
            setLedgerStartDate(e.target.value);
            setLedgerPage(1);
          }}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* TO DATE */}
      <div className="w-full sm:w-40">
        <label className="block text-sm text-gray-600 mb-1">To Date</label>
        <input
          type="date"
          value={ledgerEndDate}
          onChange={(e) => {
            setLedgerEndDate(e.target.value);
            setLedgerPage(1);
          }}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* STOCK IN/OUT */}
      <div className="w-full sm:w-40">
        <label className="block text-sm text-gray-600 mb-1">Stock</label>
        <select
          value={ledgerInOut}
          onChange={(e) => {
            setledgerInOut(e.target.value);
            setLedgerPage(1);
          }}
          className="w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
        >
          <option value="">All</option>
          <option value="IN">IN</option>
          <option value="OUT">OUT</option>
        </select>
      </div>

      {/* CLEAR BUTTON */}
      <div className="w-full sm:w-auto">
        <button
          onClick={() => {
            setLedgerSearch("");
            setLedgerStartDate("");
            setLedgerEndDate("");
            setLedgerItem("");
            setLedgerPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
        >
          Clear
        </button>
      </div>

    </div>
  )}
</div>

        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
       

          <table className="w-full table-fixed text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-center w-[12%]">Date</th>
                <th className="p-4 text-left w-[26%]">Item</th>
                <th className="p-4 text-center w-[12%]">Unit</th>
                <th className="p-4 text-center w-[12%]">Type</th>
                <th className="p-4 pr-10 text-right w-[12%]">Qty</th>
                <th className="p-4 pl-10 text-left w-[18%]">Source</th>
                <th className="p-4 text-left w-[20%]">Reference</th>
              </tr>
            </thead>

            <tbody>
              {ledger.map((l) => {
                const sourceStyle =
                  l.source === "GRN"
                    ? "bg-blue-100 text-blue-700"
                    : l.source === "Adjustment"
                    ? "bg-amber-100 text-amber-700"
                    : l.source === "Production"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-700";

                return (
                  <tr
                    key={l._id}
                    className="border-t hover:bg-indigo-50 transition"
                  >
                    <td className="p-4 text-center tabular-nums">
                      {l.createdAt.split("T")[0]}
                    </td>

                    <td className="p-4">
                     {l.itemSnapshot?.name || "Deleted Item"}
                   </td>
                    <td className="p-4 text-center">
                     {l.itemSnapshot?.uom || "Deleted Item"}
                   </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          l.type === "IN"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {l.type}
                      </span>
                    </td>

                    <td className="p-4 pr-10 text-right tabular-nums font-medium">
                      {l.quantity}
                    </td>

                    <td className="p-4 pl-10 text-left">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold ${sourceStyle}`}
                      >
                        {l.source}
                      </span>
                    </td>

                    <td className="p-4 text-left text-gray-600 truncate">
                      {l.reference}
                    </td>
                  </tr>
                );
              })}

              {!ledger.length && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No ledger entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Page {ledgerPage} of {ledgerTotalPages}
            </span>

            <div className="flex gap-2">
              <button
                disabled={ledgerPage === 1}
                onClick={() => setLedgerPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>

              <button
                disabled={ledgerPage === ledgerTotalPages}
                onClick={() =>
                  setLedgerPage((p) => Math.min(p + 1, ledgerTotalPages))
                }
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
              </>)}

      {/* ================= ADJUST MODAL ================= */}
      {showAdjust && (
        <>
          {/* BLUR BACKDROP */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn" />

          {/* MODAL */}
          <div
            className="
        fixed top-10 left-1/2 -translate-x-1/2 z-50
        w-full max-w-xl min-h-[460px]
        bg-white rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        animate-dropFromTop
      "
          >
            {/* HEADER */}
            <div className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white">Adjust Stock</h2>
              <p className="text-indigo-100 text-sm">
                Increase or decrease inventory quantity
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={submitAdjustment} className="p-8 space-y-6">
              {/* ITEM */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200"
                  value={adjustForm.item}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, item: e.target.value })
                  }
                  required
                >
                  <option value="">Select Item</option>
                  {itemsList.map((it) => (
                    <option key={it._id} value={it._id}>
                      {it.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* TYPE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adjustment Type
                </label>
                <select
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200"
                  value={adjustForm.type}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, type: e.target.value })
                  }
                >
                  <option value="Increase">Increase (IN)</option>
                  <option value="Decrease">Decrease (OUT)</option>
                </select>
              </div>

              {/* QUANTITY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200"
                  value={adjustForm.quantity}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, quantity: e.target.value })
                  }
                  required
                />
              </div>

              {/* REASON */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason / Reference
                </label>
                <input
                  placeholder="e.g. Adjustment, GRN, Production Issue"
                  className="w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-200"
                  value={adjustForm.reason}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, reason: e.target.value })
                  }
                />
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowAdjust(false)}
                  className="px-5 py-2.5 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>

              <button
  type="submit"
  className="
    px-6 py-2.5 rounded-lg text-white
    bg-gradient-to-r from-indigo-600 to-blue-600
    hover:from-indigo-700 hover:to-blue-700
    shadow-md hover:shadow-lg transition
    flex items-center justify-center gap-2
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
      Submitting...
    </>
  ) : (
    "Submit Adjustment"
  )}
</button>

              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Stock;
