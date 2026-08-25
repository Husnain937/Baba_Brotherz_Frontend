/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import ProductionOrder from "./ProductionOrder";
import { FaEye } from "react-icons/fa";


const ProductionPreparation = () => {
  const [plannedOrders, setPlannedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preparations, setPreparations] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState("Planned");
  const [status, setStatus] = useState("");
  const [viewPrep, setViewPrep] = useState(null);

    /* ============================
     LIST CONTROLS (Production)
  ============================ */
  const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortOrder, setSortOrder] = useState("desc");
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search.trim());
    setPage(1);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  if (activeTab === "Planned") {
    loadPlannedOrders();
  }
}, [activeTab]);

useEffect(() => {
  if (activeTab === "Production") {
    loadPreparations();
  }
}, [activeTab, page, debouncedSearch, sortOrder,limit,status]);


  /* ============================
     LOAD DATA
  ============================ */
  const loadPlannedOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get("/production-orders");
      setPlannedOrders(
        (res.data.orders || []).filter(o => o.status === "Planned")
      );
    } catch {
      toast.error("Failed to load production orders");
    }
    finally{
      setLoading(false)
    }
  };
 const loadPreparations = async () => {
  try {
    setLoading(true)
    const res = await api.get("/production-preparation", {
      params: {
        page,
        limit,
        search: debouncedSearch,
        sortBy: "createdAt",
        sortOrder,
        status
      },
    });

    setPreparations(res.data.preparations || []);
    setTotalPages(res.data.totalPages || 1);
  } catch {
    toast.error("Failed to load production preparations");
  }
  finally{
      setLoading(false)
    }
};

  /* ============================
     ACTIONS
  ============================ */
  const completeProduction = async (prepId) => {
    try {
      setLoading(true)
      setLoadingId(prepId);
      await api.post(`/production-preparation/complete/${prepId}`);

      toast.success("Production completed");
      loadPlannedOrders();
      loadPreparations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to complete production");
    } finally {
      setLoadingId(null);
      setLoading(false)
    }
  };
// 🎨 Production Preparation Status Badge
const getPrepStatusBadge = (status) => {
  switch (status) {
    case "Planned":
      return "bg-gray-100 text-gray-700"

    case "InProgress":
      return "bg-blue-100 text-blue-700"

    case "Completed":
      return "bg-green-100 text-green-700"

    default:
      return "bg-gray-100 text-gray-700"
  }
};

  /* ============================
     RENDER
  ============================ */
 return (
  <div className="p-6 bg-gray-100 min-h-screen">
 <div className="flex gap-6 mb-2 border-b mt-4">
      {[
        { key: "Planned", label: "Production Order"},
        { key: "Production", label: "In Production"},
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
    {activeTab==="Planned" && (<>
    
    {/* ================= HEADER ================= */}
   <ProductionOrder></ProductionOrder>
    </>
)}
{activeTab==="Production" && (
  <>
  {/* ================= VIEW ISSUED MATERIALS MODAL ================= */}
{viewPrep && (
  <>
    {/* BACKDROP */}
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={() => setViewPrep(null)}
    />

    {/* MODAL */}
    <div
      className="
        fixed top-10 left-1/2 -translate-x-1/2 z-50
        w-full max-w-2xl
        bg-white rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        flex flex-col
        max-h-[85vh]
      "
    >
      {/* HEADER */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
        <h2 className="text-lg font-semibold text-white">
          Issued Raw Materials
        </h2>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-4 overflow-y-auto">

        {/* INFO */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Production Order</p>
            <p className="font-medium">
              {viewPrep.productionOrder?.orderNumber}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Product</p>
            <p className="font-medium">
              {viewPrep.product?.name}
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-center">Qty Issued</th>
              </tr>
            </thead>

            <tbody>
              {viewPrep.rawMaterialsIssued.map((rm, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-3">
                    {rm.item?.name || rm.item}
                  </td>
                  <td className="p-3 text-center font-medium">
                    {rm.quantityIssued}
                  </td>
                </tr>
              ))}

              {!viewPrep.rawMaterialsIssued.length && (
                <tr>
                  <td colSpan="2" className="p-4 text-center text-gray-500">
                    No materials issued
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-4 border-t flex justify-end">
        <button
          onClick={() => setViewPrep(null)}
          className="
            px-5 py-2 rounded-lg
            bg-indigo-600 text-white
            hover:bg-indigo-700 transition
          "
        >
          Close
        </button>
      </div>
    </div>
  </>
)}

    {/* ================= IN PRODUCTION ================= */}
    <div>
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
 <div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* 🔍 SEARCH */}
    <div className="w-full sm:w-72">
      <input
        type="text"
        placeholder="Search order or product..."
        className="w-full border rounded-lg px-4 py-2"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
    </div>

    {/* 🔀 SORT ORDER */}
    <div className="w-full sm:w-40">
      <select
        className="w-full border rounded-lg px-4 py-2"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="desc">Newest First</option>
        <option value="asc">Oldest First</option>
      </select>
    </div>

    {/* 📌 STATUS FILTER */}
    <div className="w-full sm:w-44">
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        className="w-full border rounded-lg px-3 py-2"
      >
        <option value="">All Status</option>
        <option value="Planned">Planned</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Cancelled">Cancelled</option>
      </select>
    </div>

    {/* 📄 LIMIT */}
    <div className="w-full sm:w-24">
      <select
        value={limit}
        onChange={(e) => {
          setLimit(Number(e.target.value));
          setPage(1);
        }}
        className="w-full border rounded-lg px-3 py-2"
      >
        {[5, 10, 20, 50].map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>
    </div>

    {/* CLEAR BUTTON */}
    <div className="w-full sm:w-auto sm:pb-[2px]">
      <button
        onClick={() => {
          setSearch("");
          setSortOrder("");
          setStatus("");
          setPage(1);
        }}
        className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-slate-100 transition"
      >
        Clear
      </button>
    </div>

  </div>
</div>

        <table className="w-full text-sm">
          {/* ================= FILTER BAR ================= */}


          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Order</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-center">Qty</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
{loading ? (
      <tbody>
        <tr>
          <td colSpan="4" className="h-40">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </td>
        </tr>
      </tbody>
    ) :
         ( <tbody>
            {!preparations.length && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No active production
                </td>
              </tr>
            )}

            {preparations.map(p => (
              <tr
                key={p._id}
                className="border-t hover:bg-green-50 transition"
              >
                <td className="p-4 font-medium">
                  {p.productionOrder?.orderNumber}
                </td>

                <td className="p-4">
                  {p.product?.name}
                </td>

                <td className="p-4 text-center tabular-nums">
                  {p.quantityPlanned}
                </td>

                {/* STATUS BADGE */}
                <td className="p-4 text-center">
                  <span
                    className={`
                      px-3 py-1 rounded-full text-sm font-medium
                      ${getPrepStatusBadge(p.status)}
                    `}
                  >
                    {p.status === "InProgress"
                      ? "In Progress"
                      : p.status}
                  </span>
                </td>

                {/* ACTION */}
                <td className="p-4 text-center">
  <div className="flex items-center justify-center gap-3">

    {/* 👁 VIEW ISSUED ITEMS */}
    <button
      onClick={() => setViewPrep(p)}
      title="View Issued Materials"
      className="
        p-2 rounded-lg
        bg-indigo-50 text-indigo-600
        hover:bg-indigo-100 hover:text-indigo-800
        focus:outline-none focus:ring-2 focus:ring-indigo-300
        transition
      "
    >
      <FaEye className="text-sm" />
    </button>

    {/* ✅ COMPLETE */}
    {p.status === "InProgress" && (
      <button
        onClick={() => completeProduction(p._id)}
        disabled={loadingId === p._id}
        className="
          px-4 py-2 rounded-lg text-sm font-medium text-white
          bg-gradient-to-r from-green-600 to-emerald-600
          hover:from-green-700 hover:to-emerald-700
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-green-300
          transition
        "
      >
        {loadingId === p._id ? "Completing..." : "Complete"}
      </button>
    )}

  </div>
</td>

              </tr>
            ))}
          </tbody>)}
        </table>
         <div className="flex justify-between items-center p-4 border-t bg-white">
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
      onClick={() =>
        setPage((p) => Math.min(p + 1, totalPages))
      }
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>
      </div>
    </div>
    </>)}

  </div>
);

};

export default ProductionPreparation;
