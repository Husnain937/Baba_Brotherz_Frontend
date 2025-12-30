/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";

const emptyLine = () => ({ item: "", quantity: 1, unitPrice: 0, total: 0 });

const PurchaseOrders = () => {
  // === STATE ===
  const [pos, setPos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [editPO, setEditPO] = useState(null);
  const [refetch, setRefetch] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchPO, setSearchPO] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchPO.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchPO]);

  const [itemsList, setItemsList] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [viewPO, setViewPO] = useState(null);
  const [receivePO, setReceivePO] = useState(null);

  const [form, setForm] = useState({
    vendor: "",
    expectedDate: "",
    note: "",
    items: [emptyLine()],
    totalAmount: 0,
  });

  // === LOAD INITIAL DATA ===
   useEffect(() => {
    loadVendors();
    loadItems();
  }, []);

  // 🔧 FIX: Only PO list refetch depends on filters
  useEffect(() => {
    loadPOs();
  }, [page, limit, debouncedSearch, selectedVendor, selectedStatus, refetch]);

  const loadPOs = async () => {
    try {
      setLoading(true); //
      const res = await api.get("/purchase-orders/listPO", {
        params: {
          page,
          limit,
          search: debouncedSearch || undefined,
          vendor: selectedVendor || undefined,
          status: selectedStatus || undefined,
        },
      });

      setPos(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load purchase orders.");
    }
    finally {
    setLoading(false); // 🔥 stop loading
  }
  };

  const loadVendors = async () => {
    try {
      const res = await api.get("/vendors/dropdown/vendors");
      setVendors(res.data.vendors || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load vendors.");
    }
  };

  const loadItems = async () => {
    try {
      const res = await api.get("/items/dropdown/items");
      setItemsList(res.data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load items.");
    }
  };

  // === UTILS ===
  const recalcTotals = (items) => {
    const newItems = items.map((it) => {
      const q = Number(it.quantity) || 0;
      const p = Number(it.unitPrice) || 0;
      return { ...it, total: parseFloat((q * p).toFixed(2)) };
    });
    const totalAmount = newItems.reduce((s, it) => s + it.total, 0);
    return { newItems, totalAmount: parseFloat(totalAmount.toFixed(2)) };
  };

  // === OPEN ADD ===
  const openAdd = () => {
    setEditPO(null);
    setForm({
      vendor: "",
      expectedDate: "",
      note: "",
      items: [emptyLine()],
      totalAmount: 0,
    });
    setShowForm(true);
  };

  // === OPEN EDIT ===
  const openEdit = (po) => {
    const items = po.items.map((it) => ({
      item: it.item?._id || it.item || "",
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    }));
    setEditPO(po);
    setForm({
      vendor: po.vendor._id || po.vendor,
      expectedDate: po.expectedDate ? po.expectedDate.split("T")[0] : "",
      note: po.note || "",
      items,
      totalAmount: po.totalAmount || 0,
    });
    setShowForm(true);
  };

  // === OPEN VIEW ===
  const openView = (po) => {
    setViewPO(po);
  };

  // === OPEN RECEIVE MODAL ===
const openReceive = (po) => {
  if(po.status === "Completed") return;
  const rItems = po.items
    .map((it) => {
      const pendingQty = it.quantity - (it.receivedQty || 0);
      return {
        item: it.item?._id,
        name: it.item?.name || "Unknown Item",
        ordered: it?.quantity,
        received: it?.receivedQty || 0,
        pending: pendingQty,
        unitPrice: it?.unitPrice,
        receiveNow: 0,
      };
    })
    .filter((it) => it.pending > 0); // ✅ only keep items with pending > 0

  setReceivePO({ ...po, receiveItems: rItems });
};
const receiveItems = async () => {
  const payload = {
    poId: receivePO._id,
    items: receivePO.receiveItems
      .filter((it) => Number(it.receiveNow) > 0)
      .map((i) => ({
        item: i.item, // ✅ matches backend
        receivedQty: Number(i.receiveNow),
        unitPrice: i.unitPrice,
      })),
  };

  if (!payload.items.length) {
    return toast.error("Please enter quantities to receive.");
  }

  try {
    setFormLoading(true); // 🔥 use global loading
    await api.post("/grn", payload);
    toast.success("Stock updated & GRN created successfully");
    setReceivePO(null);
    setRefetch((p) => p + 1);
  } catch (err) {
    toast.error("Failed to receive items.");
  } finally {
    setFormLoading(false);
  }
};


  // === HANDLE ROW ADD/REMOVE ===
  const addRow = () => {
    setForm((f) => {
      const items = [...f.items, emptyLine()];
      const { newItems, totalAmount } = recalcTotals(items);
      return { ...f, items: newItems, totalAmount };
    });
  };

  const removeRow = (index) => {
    setForm((f) => {
      const items = f.items.filter((_, i) => i !== index);
      const { newItems, totalAmount } = recalcTotals(
        items.length ? items : [emptyLine()]
      );
      return { ...f, items: newItems, totalAmount };
    });
  };

  const onLineChange = (index, field, value) => {
    setForm((f) => {
      const items = f.items.map((it, i) =>
        i === index ? { ...it, [field]: value } : it
      );
      const { newItems, totalAmount } = recalcTotals(items);
      return { ...f, items: newItems, totalAmount };
    });
  };

  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.vendor) return toast.error("Please select a vendor.");

    for (const it of form.items) {
      if (!it.item) return toast.error("Please select an item.");
      if (!it.quantity || it.quantity <= 0)
        return toast.error("Quantity must be greater than 0.");
    }

    const payload = {
      vendor: form.vendor,
      expectedDate: form.expectedDate || null,
      note: form.note,
      items: form.items.map((it) => ({
        item: it.item,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice || 0),
        total: Number(it.total || 0),
      })),
    };

    try {
      setFormLoading(true)
      if (editPO) {
        await api.put(`/purchase-orders/${editPO._id}`, payload);
        toast.success("Purchase Order updated successfully");
      } else {
        await api.post("/purchase-orders", payload);
        toast.success("Purchase Order created successfully");
      }

      setTimeout(() => {
        setShowForm(false);
        setEditPO(null);
        setRefetch((p) => p + 1);
      }, 100);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to save purchase order."
      );
    }
    finally {
  setFormLoading(false);
} 
  };

  // === DELETE ===
  const deletePO = async (id) => {
    if (!window.confirm("Delete PO? Only pending allowed")) return;
    try {
      await api.delete(`/purchase-orders/${id}`);
      toast.success("Purchase Order deleted successfully");
      setRefetch((p) => p + 1);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete purchase order."
      );
    }
  };
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Partially Received":
        return "bg-indigo-100 text-indigo-800";
        default:
  return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">
      {loading && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
      
      {viewPO && (
  <>
    {/* BACKDROP */}
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={() => setViewPO(null)}
    />

    {/* MODAL */}
    <div
      className="
        fixed top-16 left-1/2 -translate-x-1/2 z-50
        w-full max-w-4xl
        bg-white rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
      "
    >
      {/* HEADER */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Purchase Order Details
            </h2>
            <p className="text-sm text-indigo-100 mt-1">
              {viewPO.poNumber}
            </p>
          </div>

          {/* STATUS BADGE */}
          <span
            className={`px-4 py-1 rounded-full text-xs font-semibold
              ${
                viewPO.status === "Completed"
                  ? "bg-green-100 text-green-800"
                  : viewPO.status === "Partially Received"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }
            `}
          >
            {viewPO.status}
          </span>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-6">

        {/* PO META INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Vendor</p>
            <p className="font-semibold text-gray-800">
              {viewPO.vendor?.vendorName}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Expected Date</p>
            <p className="font-semibold text-gray-800">
              {viewPO.expectedDate?.split("T")[0]}
            </p>
          </div>

          <div>
            <p className="text-gray-500">Total Items</p>
            <p className="font-semibold text-gray-800">
              {viewPO.items.length}
            </p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[320px] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-3 text-left">Item</th>
                  <th className="p-3 text-center">Ordered</th>
                  <th className="p-3 text-center">Received</th>
                  <th className="p-3 text-center">Pending</th>
                </tr>
              </thead>

              <tbody>
                {viewPO.items.map((it, idx) => {
                  const pending =
                    it.quantity - (it.receivedQty || 0);

                  return (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {it.item?.name}
                      </td>

                      <td className="p-3 text-center font-semibold">
                        {it.quantity}
                      </td>
                      <td className="p-3 text-center text-green-700 font-semibold">
                        {it.receivedQty || 0}
                      </td>

                      <td
                        className={`p-3 text-center font-semibold ${
                          pending > 0
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {pending}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end px-6 py-4 border-t">
        <button
          onClick={() => setViewPO(null)}
          className="
            px-6 py-2 rounded-lg
            bg-gray-200 text-gray-700
            hover:bg-gray-300 transition
          "
        >
          Close
        </button>
      </div>
    </div>
  </>
)}

      {receivePO && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setReceivePO(null)}
          />

          <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-white z-50 p-6 rounded-xl w-full max-w-4xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">Receive Items (GRN)</h2>

            <table className="w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">Item</th>
                  <th>Ordered</th>
                  <th>Received</th>
                  <th>Pending</th>
                  <th>Receive Now</th>
                </tr>
              </thead>

              <tbody>
                {receivePO.receiveItems.map((it, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{it.name}</td>
                    <td className="text-center">{it.ordered}</td>
                    <td className="text-center">{it.received}</td>
                    <td className="text-center text-red-600 font-semibold">
                      {it.pending}
                    </td>
                    <td className="text-center">
  <input
    type="number"
    min={0}
    max={it.pending}
    value={it.receiveNow}
    className="border p-1 w-24"
    onChange={(e) => {
      const raw = e.target.value;

      setReceivePO((prev) => {
        const items = [...prev.receiveItems];

        // 🔥 ALLOW EMPTY INPUT (important)
        if (raw === "") {
          items[idx] = { ...items[idx], receiveNow: "" };
          return { ...prev, receiveItems: items };
        }

        let value = Number(raw);

        // 🔒 SAFETY CHECKS
        if (isNaN(value)) value = 0;
        if (value < 0) value = 0;
        if (value > it.pending) value = it.pending;

        items[idx] = { ...items[idx], receiveNow: value };
        return { ...prev, receiveItems: items };
      });
    }}
  />
</td>

                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end gap-4 mt-4">
              <button
                className="bg-gray-400 px-4 py-2 text-white rounded"
                onClick={() => setReceivePO(null)}
              >
                Cancel
              </button>

              {/* <button
                className="bg-green-600 px-4 py-2 text-white rounded"
                onClick={async () => {
                  const payload = {
                    poId: receivePO._id,
                    items: receivePO.receiveItems
                      .filter((it) => Number(it.receiveNow) > 0)
                      .map((i) => ({
                        item: i.item, // ✅ matches backend
                        receivedQty: Number(i.receiveNow),
                        unitPrice: i.unitPrice,
                      })),
                  };

                  if (!payload.items.length)
                    return toast.error("Please enter quantities to receive.");

                  try {
                    await api.post("/grn", payload);
                    toast.success("Stock updated & GRN created successfully");
                    setReceivePO(null);
                    setRefetch((p) => p + 1);
                  } catch (err) {
                    toast.error("Failed to receive items.");
                  }
                }}
              >
                Receive Items
              </button> */}

              <button
  className="bg-green-600 px-4 py-2 text-white rounded flex items-center justify-center gap-2"
  onClick={receiveItems}
  disabled={formLoading} // prevent double click while loading
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
      Receiving...
    </>
  ) : (
    "Receive Items"
  )}
</button>

            </div>
          </div>
        </>
      )}

      {/* ================= PO FORM MODAL ================= */}
      {showForm && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowForm(false)}
          />

          <div
            className="
    fixed top-10 left-1/2 -translate-x-1/2 z-50
    w-full max-w-4xl
    bg-white rounded-xl shadow-xl
    max-h-[85vh]        /* 🔥 LIMIT HEIGHT */
    flex flex-col       /* 🔥 REQUIRED */
  "
          >
            <form
              onSubmit={submitForm}
              className="flex-1 overflow-y-auto flex flex-col gap-4 p-6"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {editPO ? "Edit Purchase Order" : "Create Purchase Order"}
                </h2>
                <div className="text-sm text-gray-500">
                  Total:
                  <span className="font-bold ml-2">
                    {form.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* VENDOR + DATE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select
                  className="border p-2 rounded"
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
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
                  value={form.expectedDate}
                  onChange={(e) =>
                    setForm({ ...form, expectedDate: e.target.value })
                  }
                />

                <input
                  className="border p-2 rounded"
                  placeholder="Note"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              {/* ITEMS TABLE */}
              <div
                className="
                overflow-x-auto
                max-h-[300px]     
                overflow-y-auto
                border rounded-lg"
              >
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Item</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {form.items.map((line, idx) => (
                      <tr key={idx}>
                        <td className="p-2">
                          <select
                            className="border p-2 w-full"
                            value={line.item}
                            onChange={(e) =>
                              onLineChange(idx, "item", e.target.value)
                            }
                          >
                            <option value="">Select item</option>
                            {itemsList.map((it) => (
                              <option key={it._id} value={it._id}>
                                {it.name}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td>
                          <input
                            type="number"
                            min="1"
                            value={line.quantity}
                            onChange={(e) =>
                              onLineChange(idx, "quantity", e.target.value)
                            }
                            className="border p-2 w-20"
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            value={line.unitPrice}
                            onChange={(e) =>
                              onLineChange(idx, "unitPrice", e.target.value)
                            }
                            className="border p-2 w-24"
                          />
                        </td>

                        <td className="p-2 font-bold">
                          {line.total.toFixed(2)}
                        </td>

                        <td>
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-start ml-3 mt-3 mb-3">
                 <button
                   type="button"
                   onClick={addRow}
                   className="
                     bg-blue-600 text-white
                     px-3 py-1 rounded
                     flex items-center
                   "
                 >
                   <FaPlus className="mr-2" /> Add Row
                 </button>
               </div>
              </div>

              {/* FOOTER BUTTONS */}
              <div className="text-right mt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>

                <button
  type="submit"
  className="bg-green-600 text-white px-4 py-2 rounded"
  disabled={formLoading}
>
  {formLoading ? "Loading..." : editPO ? "Update" : "Save"}
</button>



              </div>
            </form>
          </div>
        </>
      )}

      {/* ================= PAGE HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
          <p className="text-sm text-gray-600">
            Manage vendor purchase requests & deliveries
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
          <FaPlus /> New PO
        </button>
      </div>
      <div className="flex flex-wrap gap-4 mb-6">
        {/* 🔍 PO NUMBER SEARCH */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">PO Number</label>
          <input
            type="text"
            placeholder="Search PO..."
            value={searchPO}
            onChange={(e) => setSearchPO(e.target.value)}
            className="border rounded-lg px-4 py-2 w-56"
          />
        </div>

        {/* 🧑‍💼 VENDOR DROPDOWN */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Vendor</label>
          <select
            value={selectedVendor}
            onChange={(e) => {setSelectedVendor(e.target.value)
              setPage(1); 
            }}
            className="border rounded-lg px-4 py-2 w-56"
          >
            <option value="">All Vendors</option>
            {vendors.map((v) => (
              <option key={v._id} value={v._id}>
                {v.vendorName}
              </option>
            ))}
          </select>
        </div>

        {/* 🟡 STATUS */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => {setSelectedStatus(e.target.value)
              setPage(1);
            }}
            className="border rounded-lg px-4 py-2 w-40"
          >
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Partially Received">Partially Recieved</option>
          </select>
        </div>
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

        {/* 🔄 CLEAR */}
        <button
          onClick={() => {
            setSearchPO("");
            setSelectedVendor("");
            setSelectedStatus("");
            setDebouncedSearch("")
            setPage(1)
          }}
          className="px-4 py-2 border rounded-lg mt-6"
        >
          Clear
        </button>
      </div>

      {/* ================= PO TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left w-[25%]">PO #</th>
              <th className="p-4 text-left w-[25%]">Vendor</th>
              <th className="p-4 text-right w-[25%]">Items</th>
              <th className="p-4 text-right w-[25%]">Total</th>
              <th className="p-5 pl-11 text-left w-[25%]">Status</th>
              <th className="p-4 text-center w-[25%]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {pos.map((p) => (
              <tr
                key={p._id}
                className="border-t hover:bg-indigo-50 transition"
              >
                <td className="p-4 font-medium">{p.poNumber}</td>
                <td className="p-4 truncate">{p.vendor?.vendorName}</td>
                <td className="p-4 text-right tabular-nums">
                  {p.items?.length || 0}
                </td>
                <td className="p-4 text-right tabular-nums font-semibold">
                  {(p.totalAmount ?? 0).toFixed(2)}
                </td>
                <td className="p-4 pl-9 ">
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-semibold ${getStatusClass(
                      p.status
                    )}`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center items-center gap-3">
                    {/* VIEW */}
                    <button
                      type="button"
                      onClick={() => openView(p)}
                      title="View PO"
                      className="
        p-2 rounded-lg
        bg-green-50 text-green-600
        hover:bg-green-100 hover:text-green-800
        transition
      "
                    >
                      <FaEye size={16} />
                    </button>

                    {/* RECEIVE / GRN */}
                    {p.status !== "Completed" && (
                      <button
                        onClick={() => openReceive(p)}
                        title="Receive (GRN)"
                        className="
          p-2 rounded-lg
          bg-purple-50 text-purple-600
          hover:bg-purple-100 hover:text-purple-800
          transition
        "
                      >
                        <FaPlus size={16} />
                      </button>
                    )}

                    {/* EDIT */}
                    <button
                      onClick={() => openEdit(p)}
                      title="Edit PO"
                      className="
                      p-2 rounded-lg
                      bg-indigo-50 text-indigo-600
                      hover:bg-indigo-100 hover:text-indigo-800
                      transition
                    "
                    >
                      <FaEdit size={16} />
                    </button>

                    {/* DELETE */}
                    {p.status === "Pending" && (
                      <button
                        onClick={() => deletePO(p._id)}
                        title="Delete PO"
                        className="
          p-2 rounded-lg
          bg-red-50 text-red-600
          hover:bg-red-100 hover:text-red-800
          transition
        "
                      >
                        <FaTrash size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {!pos.length && (
              <tr>
                <td colSpan="6" className="p-6 text-center text-gray-500">
                  No Purchase Orders found
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

export default PurchaseOrders;
