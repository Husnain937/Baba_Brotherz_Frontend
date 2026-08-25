/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const ProductStock = () => {
const [activeTab, setActiveTab] = useState("master");
const [debouncedLedgerSearch, setDebouncedLedgerSearch] = useState("");
const [ledgerProduct,setledgerProduct] = useState("")
const [stock, setStock] = useState([]);
const [ledger, setLedger] = useState([]);
const [products, setProducts] = useState([]);
// ===== Ledger pagination & search =====
const [ledgerPage, setLedgerPage] = useState(1);
const [ledgerLimit, setLedgerLimit] = useState(10);
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];
const [formLoading, setFormLoading] = useState(false);
const [loading, setLoading] = useState(false);
const [ledgerTotalPages, setLedgerTotalPages] = useState(1);
const [ledgerSearch, setLedgerSearch] = useState("");
const [ledgerStartDate, setLedgerStartDate] = useState("");
const [ledgerEndDate, setLedgerEndDate] = useState("");
// ===== Stock Master pagination & search =====
const [masterPage, setMasterPage] = useState(1);
const [masterLimit, setMasterLimit] = useState(10);
const [masterTotalPages, setMasterTotalPages] = useState(1);
const [masterSearch, setMasterSearch] = useState("");
const [debouncedMasterSearch, setDebouncedMasterSearch] = useState("");
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedMasterSearch(masterSearch);
    setMasterPage(1);
  }, 400);

  return () => clearTimeout(timer);
}, [masterSearch]);

  const [showAdjust, setShowAdjust] = useState(false);
  const [adjustForm, setAdjustForm] = useState({
    product: "",
    type: "Increase",
    quantity: "",
    reason: "",
  });

  /* ============================
     LOAD DATA
  ============================ */
useEffect(() => {
  loadProducts();
}, []);
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedLedgerSearch(ledgerSearch);
    setLedgerPage(1); // reset page when search changes
  }, 400); // 400ms debounce

  return () => clearTimeout(timer);
}, [ledgerSearch]);


useEffect(() => {
  loadLedger();
}, [
  ledgerPage,
  debouncedLedgerSearch,
  ledgerLimit,
  ledgerStartDate,
  ledgerEndDate,
  ledgerProduct
]);

const loadStock = async () => {
  try {
    setLoading(true)
    const res = await api.get("/product-stock/master", {
      params: {
        page: masterPage,
        limit: masterLimit,
        search: debouncedMasterSearch,
      },
    });

    setStock(res.data.data || []);
    setMasterTotalPages(res.data.pagination?.totalPages || 1);
  } catch {
    toast.error("Failed to load product stock");
  }
  finally{
    setLoading(false)
  }
};
useEffect(() => {
  if (activeTab === "master") {
    loadStock();
  }
}, [activeTab, masterPage, masterLimit, debouncedMasterSearch]);


const loadLedger = async () => {
  try {
    setLoading(true)
    const res = await api.get("/product-stock/ledger", {
      params: {
        page: ledgerPage,
        limit: ledgerLimit,
        search: debouncedLedgerSearch,
        product: ledgerProduct || undefined,
        startDate: ledgerStartDate || undefined,
        endDate: ledgerEndDate || undefined,
      },
    });
    setLedger(res.data.data || []);
    setLedgerTotalPages(res.data.pagination?.totalPages || 1);
  } catch {
    toast.error("Failed to load product stock ledger");
  }
  finally{
    setLoading(false)
  }
};

  const loadProducts = async () => {
    try {
      setLoading(true)
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch {
      toast.error("Failed to load products");
    }
    finally{
      setLoading(false)
    }
  };
  /* ===========================
     SUBMIT ADJUSTMENT
  ============================ */
  const submitAdjustment = async (e) => {
    e.preventDefault();

    if (!adjustForm.product)
      return toast.error("Please select a product");

    if (!adjustForm.quantity || Number(adjustForm.quantity) <= 0)
      return toast.error("Quantity must be greater than 0");

    if (!adjustForm.reason)
      return toast.error("Reason is required");

    try {
      setFormLoading(true)
      await api.post("/product-stock/adjust", {
        product: adjustForm.product,
        type: adjustForm.type,
        quantity: Number(adjustForm.quantity),
        reason: adjustForm.reason,
      });

      toast.success("Product stock adjusted successfully");

      setAdjustForm({
        product: "",
        type: "Increase",
        quantity: "",
        reason: "",
      });

      setShowAdjust(false);
      loadStock();
      loadLedger();
    } catch (err) {
      toast.error(err.response?.data?.message || "Adjustment failed");
    }
    finally{
      setFormLoading(false)
    }
  };

  /* ============================
     RENDER
  ============================ */
 return (
  <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">
    {/* ================= HEADER ================= */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Product Ready Stock
        </h1>
        <p className="text-sm text-gray-600">
          Track finished goods inventory and movements
        </p>
      </div>

      <button
        onClick={() => setShowAdjust(true)}
        className="
          flex items-center gap-2
          bg-gradient-to-r from-indigo-600 to-blue-600
          text-white px-5 py-2 rounded-lg
          shadow-md hover:shadow-lg transition
        "
      >
        <FaPlus /> Adjust Stock
      </button>
    </div>

    {/* ================= TABS ================= */}
    <div className="flex gap-6 mb-6 border-b">
      {[
        { key: "master", label: "Stock Master" },
        { key: "ledger", label: "Stock Ledger" },
      ].map(tab => (
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
    {activeTab === "master" && (
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
   <div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* 🔍 SEARCH */}
    <div className="w-full sm:w-64">
      <label className="block text-sm text-gray-600 mb-1">
        Search
      </label>
      <input
        type="text"
        placeholder="Product or SKU..."
        className="w-full border rounded-lg px-4 py-2"
        value={masterSearch}
        onChange={(e) => {
          setMasterSearch(e.target.value);
          setMasterPage(1);
        }}
      />
    </div>

    {/* 📄 LIMIT */}
    <div className="w-full sm:w-24">
      <label className="block text-sm text-gray-600 mb-1">
        Limit
      </label>
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={masterLimit}
        onChange={(e) => {
          setMasterLimit(Number(e.target.value));
          setMasterPage(1);
        }}
      >
        {[5, 10, 20, 50].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>

    {/* CLEAR BUTTON */}
    <div className="w-full sm:w-auto sm:pb-[2px]">
      <button
        onClick={() => {
          setMasterSearch("");
          setMasterPage(1);
        }}
        className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-slate-100 transition"
      >
        Clear
      </button>
    </div>

  </div>
</div>

        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left w-[45%]">Product</th>
              <th className="p-4 text-left w-[30%]">SKU</th>
              <th className="p-4 text-right w-[25%]">Quantity</th>
            </tr>
          </thead>
{loading ? (
      <tbody>
        <tr>
          <td colSpan="3" className="h-40">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </td>
        </tr>
      </tbody>
    ) :
         ( <tbody>
            {stock.map((s) => (
              <tr
                key={s._id}
                className="border-t hover:bg-indigo-50 transition"
              >
                <td className="p-4 font-medium truncate">
                  {s.product?.name}
                </td>
                <td className="p-4 text-gray-600">
                  {s.product?.sku}
                </td>
                <td className="p-4 text-right tabular-nums font-semibold">
                  {s.quantity}
                </td>
              </tr>
            ))}

            {!stock.length && (
              <tr>
                <td colSpan="3" className="p-6 text-center text-gray-500">
                  No product stock available
                </td>
              </tr>
            )}
          </tbody>)}
        </table>
        <div className="flex justify-between items-center p-4 border-t">
  <span className="text-sm text-gray-600">
    Page {masterPage} of {masterTotalPages}
  </span>

  <div className="flex gap-2">
    <button
      disabled={masterPage === 1}
      onClick={() => setMasterPage(p => Math.max(p - 1, 1))}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Prev
    </button>

    <button
      disabled={masterPage === masterTotalPages}
      onClick={() =>
        setMasterPage(p => Math.min(p + 1, masterTotalPages))
      }
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

      </div>
    )}

    {/* ================= STOCK LEDGER ================= */}
    {activeTab === "ledger" && (
      
  <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
  <div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* 🔍 TEXT SEARCH */}
    <div className="w-full sm:w-64">
      <label className="block text-sm text-gray-600 mb-1">
        Search
      </label>
      <input
        type="text"
        placeholder="Product, source, reference..."
        className="w-full border rounded-lg px-4 py-2"
        value={ledgerSearch}
        onChange={(e) => {
          setLedgerSearch(e.target.value);
          setLedgerPage(1);
        }}
      />
    </div>

    {/* 📦 PRODUCT FILTER */}
    <div className="w-full sm:w-64">
      <label className="block text-sm text-gray-600 mb-1">
        Product Search
      </label>
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={ledgerProduct}
        onChange={(e) => {
          setledgerProduct(e.target.value);
          setLedgerPage(1);
        }}
      >
        <option value="">All Products</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>

    {/* 📅 START DATE */}
    <div className="w-full sm:w-40">
      <label className="block text-sm text-gray-600 mb-1">
        From Date
      </label>
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2"
        value={ledgerStartDate}
        onChange={(e) => {
          setLedgerStartDate(e.target.value);
          setLedgerPage(1);
        }}
      />
    </div>

    {/* 📅 END DATE */}
    <div className="w-full sm:w-40">
      <label className="block text-sm text-gray-600 mb-1">
        To Date
      </label>
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2"
        value={ledgerEndDate}
        onChange={(e) => {
          setLedgerEndDate(e.target.value);
          setLedgerPage(1);
        }}
      />
    </div>

    {/* 📄 PAGE SIZE */}
    <div className="w-full sm:w-24">
      <label className="block text-sm text-gray-600 mb-1">
        Limit
      </label>
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={ledgerLimit}
        onChange={(e) => {
          setLedgerLimit(Number(e.target.value));
          setLedgerPage(1);
        }}
      >
        {PAGE_SIZE_OPTIONS.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>

    {/* CLEAR FILTERS */}
    <div className="w-full sm:w-auto sm:pb-[2px]">
      <button
        onClick={() => {
          setLedgerSearch("");
          setLedgerStartDate("");
          setLedgerEndDate("");
          setledgerProduct("");
          setLedgerPage(1);
        }}
        className="w-full sm:w-auto px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition"
      >
        Clear
      </button>
    </div>

  </div>
</div>
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-center w-[12%]">Date</th>
              <th className="p-4 text-left w-[28%]">Product</th>
              <th className="p-4 text-center w-[12%]">Type</th>
              <th className="p-4 pr-6 text-right w-[12%]">Qty</th>
              <th className="p-4 pl-6 text-left w-[18%]">Source</th>
              <th className="p-4 text-left w-[18%]">Reference</th>
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
 ( <tbody>
  {ledger.map((l) => {
    const sourceStyle =
      l.source === "GRN"
        ? "bg-blue-100 text-blue-700"
        : l.source === "Adjustment"
        ? "bg-amber-100 text-amber-700"
        : l.source === "Production Completed"
        ? "bg-purple-100 text-purple-700"
        : "bg-gray-100 text-gray-700";

    return (
      <tr key={l._id} className="border-t hover:bg-indigo-50 transition">
        <td className="p-4 text-center tabular-nums">
          {l.createdAt.split("T")[0]}
        </td>

        <td className="p-4 truncate font-medium">
          {l.product?.name}
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

        <td className="p-4 pr-6 text-right tabular-nums font-medium">
          {l.quantity}
        </td>

        <td className="p-4 pl-6 text-left">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${sourceStyle}`}>
            {l.source}
          </span>
        </td>

        <td className="p-4 truncate text-gray-600">
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
</tbody>)}

        </table>
        <div className="flex justify-between items-center p-4 border-t">
  <span className="text-sm text-gray-600">
    Page {ledgerPage} of {ledgerTotalPages}
  </span>

  <div className="flex gap-2">
    <button
      disabled={ledgerPage === 1}
      onClick={() => setLedgerPage(p => Math.max(p - 1, 1))}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Prev
    </button>

    <button
      disabled={ledgerPage === ledgerTotalPages}
      onClick={() =>
        setLedgerPage(p => Math.min(p + 1, ledgerTotalPages))
      }
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

      </div>
    )}

    {/* ================= ADJUST MODAL ================= */}
    {showAdjust && (
      <>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-fadeIn" />

        <div
          className="
            fixed top-24 left-1/2 -translate-x-1/2 z-50
            w-full max-w-xl min-h-[460px]
            bg-white rounded-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            animate-dropFromTop
          "
        >
          <div className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
            <h2 className="text-lg font-semibold text-white">
              Adjust Product Stock
            </h2>
            <p className="text-indigo-100 text-sm">
              Increase or decrease finished goods
            </p>
          </div>

          <form onSubmit={submitAdjustment} className="p-8 space-y-6">
            <select
              className="w-full border rounded-lg px-4 py-2.5"
              value={adjustForm.product}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, product: e.target.value })
              }
              required
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              className="w-full border rounded-lg px-4 py-2.5"
              value={adjustForm.type}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, type: e.target.value })
              }
            >
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
            </select>

            <input
              type="number"
              min="1"
              placeholder="Quantity"
              className="w-full border rounded-lg px-4 py-2.5"
              value={adjustForm.quantity}
              onChange={(e) =>
                setAdjustForm({
                  ...adjustForm,
                  quantity: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Reason / Reference"
              className="w-full border rounded-lg px-4 py-2.5"
              value={adjustForm.reason}
              onChange={(e) =>
                setAdjustForm({
                  ...adjustForm,
                  reason: e.target.value,
                })
              }
            />

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
                      { "Saving..."}
                    </>
                  ) : 
                    "Save Adjustment"
                  }
                </button>
            </div>
          </form>
        </div>
      </>
    )}
  </div>
);

};

export default ProductStock;
