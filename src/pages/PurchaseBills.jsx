import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus, FaTrash, FaEye , FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import VendorLedger from "./VendorLedger";
const PurchaseBills = () => {
  const [activeTab, setActiveTab] = useState("Purchase_Bills");
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [pos, setPos] = useState([]);
  const [limit,setlimit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [viewBill, setViewBill] = useState(null);
  const [refetch, setRefetch] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  /* ================= LIST CONTROLS ================= */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [billStatus,setbillStatus] =useState("")
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [payBillId, setPayBillId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

const loadAccounts = async () => {
  const res = await api.get("/accounts");
  setAccounts(res.data.accounts.filter(a => a.status === "Active"));
};

useEffect(() => {
  loadAccounts();
}, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1); // reset page on search
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const [form, setForm] = useState({
    vendor: "",
    po: "",
    billDate: "",
    dueDate: "",
    items: [],
    totalAmount: 0,
    note: "",
  });

  /* ================= LOAD DATA ================= */
useEffect(() => {
  loadBills();
}, [page, debouncedSearch, sortBy, sortOrder, refetch,billStatus,limit]);

useEffect(() => {
  loadVendors();
  loadPOs();
}, []);



    const loadBills = async () => {
    try {
      setLoading(true)
      const res = await api.get("/purchase-bills/listPurchaseBillsPage", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          sortBy,
          sortOrder,
          status:billStatus,
        },
      });
      setBills(res.data.bills || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to load purchase bills");
    }
    finally{
      setLoading(false)
    }
  };


  const loadVendors = async () => {
    try {
      setLoading(true)
      const res = await api.get("/vendors/dropdown/vendors");
      setVendors(res.data.vendors || []);
    } catch {
      toast.error("Failed to load vendors");
    }
    finally{
      setLoading(false)
    }
  };

  const loadPOs = async () => {
    try {
      setLoading(true)
      const res = await api.get("/purchase-orders");
      setPos(res.data.po || []);
    } catch {
      toast.error("Failed to load purchase orders");
    }
    finally{
      setLoading(false)
    }
  };

  /* ================= PO SELECT ================= */

  const handlePOSelect = (poId) => {
    const po = pos.find((p) => p._id === poId);
    if (!po) return;

    const poItems = po.items.map((it) => ({
      item: it.item._id,
      name: it.item.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    }));

    const totalAmount = poItems.reduce((s, it) => s + it.total, 0);

    setForm((f) => ({
      ...f,
      po: poId,
      vendor: po.vendor._id,
      items: poItems,
      totalAmount,
    }));
  };

  /* ================= CREATE BILL ================= */

  const submitForm = async (e) => {
    e.preventDefault();

    if (!form.vendor || !form.po || !form.billDate) {
      return toast.error("Vendor, PO and Bill Date are required");
    }

    if (!form.items.length) {
      return toast.error("No items found for this PO");
    }

    const payload = {
      ...form,
      items: form.items.map((it) => ({
        item: it.item,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.total,
      })),
    };

    try {
      setFormLoading(true)
      await api.post("/purchase-bills", payload);
      toast.success("Purchase bill created successfully");

      setShowForm(false);
      resetForm();
      setRefetch((p) => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create bill");
    }
    finally{
      setFormLoading(false)
    }
  };

  const resetForm = () => {
    setForm({
      vendor: "",
      po: "",
      billDate: "",
      dueDate: "",
      items: [],
      totalAmount: 0,
      note: "",
    });
  };
const payPurchaseBill = async () => {
  try {
    setLoading(true)
    await api.patch(`/purchase-bills/pay/${payBillId}`, {
      accounts: selectedAccount
    });

    toast.success("Purchase bill paid successfully");
    setPayBillId(null);
    setSelectedAccount("");
    setRefetch(p => p + 1);
  } catch (err) {
    toast.error(err.response?.data?.message || "Payment failed");
  }
  finally{
    setLoading(false)
  }
};

  /* ================= DELETE ================= */

  const deleteBill = async (id) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;

    try {
      setLoading(true)
      await api.delete(`/purchase-bills/${id}`);
      toast.success("Bill deleted successfully");
      setRefetch((p) => p + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot delete bill");
    }
    finally{
      setLoading(false)
    }
  };

     return (
  <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">
   {/* TABS */}
   
      <div className="flex gap-6 mb-6 border-b">
        {[
          { key: "Purchase_Bills", label: "Purchase Bills" },
          { key: "Vendor_Ledger", label: "Vendor Ledger" },
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
    {activeTab ==="Purchase_Bills" && (<>
    {loading && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
    {/* ================= VIEW BILL MODAL ================= */}
   {viewBill && (
  <>
    {/* BACKDROP */}
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={() => setViewBill(null)}
    />

    {/* MODAL */}
    <div
      className="
        fixed top-10 left-1/2 -translate-x-1/2 z-50
        w-full max-w-3xl
        bg-white rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        flex flex-col
        max-h-[85vh]
      "
    >
      {/* ================= HEADER ================= */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
        <h2 className="text-lg font-semibold text-white">
          Purchase Bill Details
        </h2>
      </div>

      {/* ================= SCROLLABLE BODY ================= */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-sm text-gray-700">

        {/* ---------- BILL INFO ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Bill Number</p>
            <p className="font-semibold">{viewBill.billNumber}</p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Status</p>
            <span
              className="
                inline-block px-3 py-1 rounded-full text-xs font-semibold
                bg-indigo-50 text-indigo-700
              "
            >
              {viewBill.status}
            </span>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Vendor</p>
            <p className="font-medium">
              {viewBill.vendor?.vendorName || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Purchase Order</p>
            <p className="font-medium">
              {viewBill.po?.poNumber || "PO Deleted"}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Bill Date</p>
            <p className="font-medium">
              {viewBill.billDate?.split("T")[0]}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Total Amount</p>
            <p className="font-bold text-lg text-green-700">
              {viewBill.totalAmount}
            </p>
          </div>
        </div>

        {/* ---------- ITEMS ---------- */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Bill Items
          </p>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-center">Rate</th>
                    <th className="p-3 text-center">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {viewBill.items.map((it, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 font-medium">
                        {it.item?.name || it.name || "N/A"}
                      </td>
                      <td className="p-3 text-center">{it.quantity}</td>
                      <td className="p-3 text-center">{it.unitPrice}</td>
                      <td className="p-3 text-center font-semibold">
                        {it.total}
                      </td>
                    </tr>
                  ))}

                  {!viewBill.items.length && (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-4 text-center text-gray-500"
                      >
                        No items found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="px-6 py-4 border-t flex justify-end">
        <button
          onClick={() => setViewBill(null)}
          className="
            px-6 py-2 rounded-lg
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

    {/* ================= CREATE BILL MODAL ================= */}
    {showForm && (
  <>
    {/* BACKDROP */}
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={() => setShowForm(false)}
    />

    {/* MODAL */}
    <div
      className="
        fixed top-10 left-1/2 -translate-x-1/2 z-50
        w-full max-w-4xl
        bg-white rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        flex flex-col
        max-h-[85vh]
      "
    >
      {/* ================= HEADER ================= */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">
          Create Purchase Bill
        </h2>
        <span className="text-white font-semibold">
          Total: {form.totalAmount.toFixed(2)}
        </span>
      </div>

      {/* ================= SCROLLABLE BODY ================= */}
      <form
        onSubmit={submitForm}
        className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
      >
        {/* ---------- BASIC INFO ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Vendor
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 bg-gray-100"
              value={form.vendor}
              disabled
            >
              <option value="">Vendor (Auto)</option>
              {vendors.map(v => (
                <option key={v._id} value={v._id}>
                  {v.vendorName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Purchase Order
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={form.po}
              onChange={(e) => handlePOSelect(e.target.value)}
              required
            >
              <option value="">Select PO</option>
              {pos.map(p => (
                <option key={p._id} value={p._id}>
                  {p.poNumber} — {p.vendor?.vendorName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Bill Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={form.billDate}
              onChange={(e) =>
                setForm({ ...form, billDate: e.target.value })
              }
              required
            />
          </div>
        </div>

        {/* ---------- DUE DATE ---------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Due Date
          </label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2"
            value={form.dueDate}
            onChange={(e) =>
              setForm({ ...form, dueDate: e.target.value })
            }
          />
        </div>

        {/* ---------- ITEMS TABLE ---------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Bill Items
          </label>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-center">Rate</th>
                    <th className="p-3 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((it, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3 font-medium">
                        {it.item?.name || it.name || "N/A"}
                      </td>
                      <td className="p-3 text-center">{it.quantity}</td>
                      <td className="p-3 text-center">{it.unitPrice}</td>
                      <td className="p-3 text-center font-semibold">
                        {it.total}
                      </td>
                    </tr>
                  ))}

                  {!form.items.length && (
                    <tr>
                      <td colSpan="4" className="p-4 text-center text-gray-500">
                        No items found for selected PO
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ---------- NOTE ---------- */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Note
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Optional note for this bill"
            value={form.note}
            onChange={(e) =>
              setForm({ ...form, note: e.target.value })
            }
          />
        </div>
      </form>

      {/* ================= FOOTER ================= */}
      <div className="px-6 py-4 border-t flex justify-end gap-4">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          type="submit"
          onClick={submitForm}
          className="px-5 py-2 rounded-lg text-white
             bg-gradient-to-r from-indigo-600 to-blue-600
             hover:from-indigo-700 hover:to-blue-700
             shadow-md hover:shadow-lg
             transition-all duration-200 flex items-center justify-center gap-2"
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
      {"Saving..."}
    </>
  ) : (
    "Save Bill"
  )}
        </button>
      </div>
    </div>
  </>
)}
    {/* ================= HEADER ================= */}
    <div className="flex justify-between items-center mb-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Purchase Bills</h1>
        <p className="text-sm text-gray-600">Vendor invoices & bill tracking</p>
      </div>

      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-lg shadow-md hover:shadow-lg"
      >
        <FaPlus /> New Bill
      </button>
    </div>
<div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* 🔍 SEARCH */}
    <div className="w-full md:w-1/4">
      <input
        type="text"
        placeholder="Search by Vendor or PO..."
        className="w-full border rounded-lg px-4 py-2"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>

    {/* SORT BY */}
    <div className="w-full sm:w-48">
      <select
        className="w-full border rounded-lg px-4 py-2"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="createdAt">Sort by Date</option>
        <option value="totalAmount">Sort by Amount</option>
      </select>
    </div>

    {/* SORT ORDER */}
    <div className="w-full sm:w-40">
      <select
        className="w-full border rounded-lg px-4 py-2"
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>

    {/* BILL STATUS */}
    <div className="w-full sm:w-44">
      <select
        value={billStatus}
        onChange={(e) => {
          setbillStatus(e.target.value);
          setPage(1);
        }}
        className="w-full border rounded-lg px-4 py-2"
      >
        <option value="">All Bills</option>
        <option value="Paid">Paid</option>
        <option value="Unpaid">Unpaid</option>
        <option value="Partially Paid">Partially Paid</option>
      </select>
    </div>

    {/* LIMIT */}
    <div className="w-full sm:w-24">
      <select
        value={limit}
        onChange={(e) => {
          setlimit(Number(e.target.value));
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
          setSortBy("");
          setSortOrder("");
          setbillStatus("");
          setPage(1);
        }}
        className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-gray-100 transition"
      >
        Clear
      </button>
    </div>

  </div>
</div>

    {/* ================= TABLE ================= */}
    <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
      {/* ================= FILTER BAR ================= */}
      <table className="w-full table-fixed text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left w-[15%]">Bill#</th>
            <th className="p-4 text-left w-[25%]">Vendor</th>
            <th className="p-4 text-left w-[15%]">PO#</th>
            <th className="p-4 text-right w-[15%]">Amount</th>
            <th className="p-4 text-left w-[15%]">Status</th>
            <th className="p-4 text-center w-[15%]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {bills.map(b => (
            <tr key={b._id} className="border-t hover:bg-indigo-50">
              <td className="p-4">{b.billNumber}</td>
              <td className="p-4">{b.vendor?.vendorName}</td>
              <td className="p-4">{b.po?.poNumber || "PO Deleted"}</td>
              <td className="p-4 text-right font-semibold">{b.totalAmount}</td>
              <td className="p-4">{b.status}</td>
              <td className="p-4">
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setViewBill(b)}
                    className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => deleteBill(b._id)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  >
                    <FaTrash />
                  </button>
                  {b.status !== "Paid" && (
  <button
    onClick={() => {
      setPayBillId(b._id);
      setSelectedAccount("");
    }}
    className="
      p-2 rounded-lg
      bg-green-50 text-green-600
      hover:bg-green-100
    "
    title="Pay Bill"
  >
    <FaCheck />
  </button>
)}

                </div>
              </td>
            </tr>
          ))}

          {!bills.length && (
            <tr>
              <td colSpan="6" className="p-6 text-center text-gray-500">
                No bills found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {/* ================= PAGINATION ================= */}

<div className="flex justify-between items-center p-4 border-t">
  <span className="text-sm text-gray-600">
    Page {page} of {page}
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

{payBillId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Pay Purchase Bill</h2>

      <select
        className="border rounded-lg px-3 py-2 w-full"
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
      >
        <option value="">Select Account</option>
        {accounts.map(a => (
          <option key={a._id} value={a._id}>
            {a.name} (Balance: {a.currentBalance.toLocaleString()})
          </option>
        ))}
      </select>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setPayBillId(null)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          disabled={!selectedAccount}
          onClick={payPurchaseBill}
          className="px-5 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Confirm Pay
        </button>
      </div>
    </div>
  </div>
)}
</>
)}
{activeTab==="Vendor_Ledger" &&  (<><VendorLedger/></>)}
</div>
);


};

export default PurchaseBills;

