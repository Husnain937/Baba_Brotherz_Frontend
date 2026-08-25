import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaEdit, FaTrash, FaEye, FaPlus,FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";

const Invoice = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [createInvoice, setCreateInvoice] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [receivePaymentId, setReceivePaymentId] = useState(null);
const [paymentAmount, setPaymentAmount] = useState("");
const [accounts, setAccounts] = useState([]);
const [selectedAccount, setSelectedAccount] = useState("");


// Load customers for dropdown
const loadCustomers = async () => {
  try {
    const res = await api.get("/customers/dropdown");
    setCustomers(res.data.customers || []);
  } catch {
    toast.error("Failed to load customers");
  }
};
const loadAccounts = async () => {
  const res = await api.get("/accounts");
  setAccounts(res.data.accounts.filter(a => a.status === "Active"));
};

useEffect(() => {
  loadAccounts();
}, []);

useEffect(() => {
  loadCustomers();
}, []);

  const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

  const [form, setForm] = useState({
    customer: "",
    items: [],
    taxTotal: 0,
    additionalCharges: 0,
    note: "",
    dueDate: "",
  });

  // ================== LOAD PRODUCTS ==================
  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ================== LOAD INVOICES ==================
  const loadInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/invoices", {
        params: { page, limit, search, status: statusFilter },
      });
      setInvoices(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [page, limit, search, statusFilter]);

  // ================== EDIT ==================
  const openEdit = (invoice) => {
    setEditInvoice(invoice);
    setForm({
      customer: invoice.customer?._id || "",
      items: invoice.items?.map((i) => ({
        product: i.product?._id || null,
        productName: i.product?.name || "Product",
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total,
      })) || [],
      taxTotal: invoice.taxTotal || 0,
      additionalCharges: invoice.additionalCharges || 0,
      note: invoice.note || "",
      dueDate: invoice.dueDate ? invoice.dueDate.split("T")[0] : "",
    });
  };

  // ================== SUBMIT ==================
  const submitForm = async (e, type = "edit") => {
    e.preventDefault();
    try {
      setFormLoading(true);

      const itemsToSend = form.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        total: i.total,
      }));

      const subTotal = itemsToSend.reduce((acc, i) => acc + i.total, 0);
      const totalAmount = subTotal + (form.taxTotal || 0) + (form.additionalCharges || 0);

      if (type === "edit") {
        await api.put(`/invoices/${editInvoice._id}`, {
          customer: form.customer,
          items: itemsToSend,
          taxTotal: form.taxTotal,
          additionalCharges: form.additionalCharges,
          note: form.note,
          dueDate: form.dueDate,
          totalAmount,
        });
        toast.success("Invoice updated successfully");
        setEditInvoice(null);
      } else {
        await api.post(`/invoices`, {
          customer: form.customer,
          items: itemsToSend,
          taxTotal: form.taxTotal,
          additionalCharges: form.additionalCharges,
          note: form.note,
          dueDate: form.dueDate,
          totalAmount,
        });
        toast.success("Invoice created successfully");
        setCreateInvoice(false);
      }

      setForm({
        customer: "",
        items: [],
        taxTotal: 0,
        additionalCharges: 0,
        note: "",
        dueDate: "",
      });

      loadInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save invoice.");
    } finally {
      setFormLoading(false);
    }
  };

  // ================== DELETE ==================
  const deleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this invoice?")) return;
    try {
      setLoading(true);
      await api.delete(`/invoices/${id}`);
      toast.success("Invoice cancelled successfully");
      loadInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to cancel invoice.");
    } finally {
      setLoading(false);
    }
  };
const receivePayment = async () => {
  if (!receivePaymentId || !paymentAmount || !selectedAccount) return;

  try {
    setLoading(true);

    await api.post("/invoices/payments/receive", {
      customer: typeof receivePaymentId.customer === "object" 
                  ? receivePaymentId.customer._id 
                  : receivePaymentId.customer,
      invoiceId: receivePaymentId._id,
      amount: Number(paymentAmount) || 0,
      account: selectedAccount,
    });

    toast.success("Payment received successfully");
    setReceivePaymentId(null);
    setPaymentAmount("");
    setSelectedAccount("");
    loadInvoices();

  } catch (err) {
    toast.error(err.response?.data?.message || "Payment failed");
  } finally {
    setLoading(false);
  }
};


  // ================== JSX ==================
  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* ====== CREATE / EDIT MODAL ====== */}
      {(editInvoice || createInvoice) && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => { setEditInvoice(null); setCreateInvoice(false); }}
          />
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {editInvoice ? "Edit Invoice" : "Create Invoice"}
            </h2>
            <form onSubmit={(e) => submitForm(e, editInvoice ? "edit" : "create")} className="space-y-4">

              {/* Customer */}
            {/* Customer */}
<div>
  <label className="block mb-1 text-sm">Customer</label>
  <select
    className="w-full border px-3 py-2 rounded"
    value={form.customer || ""}
    onChange={(e) => setForm({ ...form, customer: e.target.value })}
    required
  >
    <option value="">Select Customer</option>
    {customers.map((c) => (
      <option key={c._id} value={c._id}>
        {c.customerName}
      </option>
    ))}
  </select>
</div>


              {/* Items */}
              <div className="overflow-x-auto">
                <h3 className="mb-2 font-medium">Items</h3>
                <table className="w-full border rounded text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2">Product</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Unit Price</th>
                      <th className="p-2">Total</th>
                      <th className="p-2">
                        <button
                          type="button"
                          className="text-green-600"
                          onClick={() => setForm({ ...form, items: [...form.items, { product: "", productName: "Product", quantity: 1, unitPrice: 0, total: 0 }] })}
                        >
                          <FaPlus />
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        {/* Product Dropdown */}
                        <td className="p-2">
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={item.product || ""}
                            onChange={(e) => {
                              const selectedProduct = products.find(p => p._id === e.target.value);
                              const newItems = [...form.items];
                              newItems[idx].product = selectedProduct?._id || null;
                              newItems[idx].productName = selectedProduct?.name || "Product";
                              newItems[idx].unitPrice = selectedProduct?.price || 0;
                              newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
                              setForm({ ...form, items: newItems });
                            }}
                          >
                            <option value="">Select Product</option>
                            {products.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.name} ({p.sku})
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Quantity */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            className="w-20 border rounded px-2 py-1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].quantity = Number(e.target.value);
                              newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
                              setForm({ ...form, items: newItems });
                            }}
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="p-2">
                          <input
                            type="number"
                            min="0"
                            className="w-24 border rounded px-2 py-1"
                            value={item.unitPrice}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].unitPrice = Number(e.target.value);
                              newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
                              setForm({ ...form, items: newItems });
                            }}
                          />
                        </td>

                        {/* Total */}
                        <td className="p-2">{item.total.toFixed(2)}</td>

                        {/* Remove */}
                        <td className="p-2">
                          <button
                            type="button"
                            className="text-red-600"
                            onClick={() => {
                              const newItems = form.items.filter((_, i) => i !== idx);
                              setForm({ ...form, items: newItems });
                            }}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Charges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm">Tax</label>
                  <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    value={form.taxTotal}
                    onChange={(e) => setForm({ ...form, taxTotal: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Additional Charges</label>
                  <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    value={form.additionalCharges}
                    onChange={(e) => setForm({ ...form, additionalCharges: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm">Due Date</label>
                  <input
                    type="date"
                    className="w-full border px-3 py-2 rounded"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => { setEditInvoice(null); setCreateInvoice(false); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={formLoading}
                >
                  {formLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ========== HEADER + CREATE BUTTON ========== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search invoices..."
            className="border rounded px-3 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => setCreateInvoice(true)}
            className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"
          >
            <FaPlus /> Create
          </button>
        </div>
      </div>

      {/* ========== TABLE ========== */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Invoice ID</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Total</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
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
         ( <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id} className="border-t hover:bg-indigo-50 transition">
                <td className="p-4">{inv._id.slice(-6)}</td>
                <td className="p-4">{inv.customer?.customerName || "-"}</td>
                <td className="p-4">{inv.totalAmount.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      inv.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : inv.status === "Unpaid"
                        ? "bg-red-100 text-red-700"
                        : inv.status === "Partially Paid"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center gap-2">
                  <button onClick={() => openEdit(inv)} className="p-2 bg-indigo-50 text-indigo-600 rounded">
                    <FaEdit />
                  </button>
                  {inv.status !== "Cancelled" && (
                    <button onClick={() => deleteInvoice(inv._id)} className="p-2 bg-red-50 text-red-600 rounded">
                      <FaTrash />
                    </button>
                  )}
                  <button className="p-2 bg-blue-50 text-blue-600 rounded">
                    <FaEye />
                  </button>
                  {inv.status !== "Paid" && inv.status !== "Cancelled" && (
  <button
    onClick={() => {
      setReceivePaymentId(inv);
      setPaymentAmount("");
      setSelectedAccount("");
    }}
    className="p-2 bg-green-50 text-green-600 rounded"
    title="Receive Payment"
  >
    <FaCheck />
  </button>
)}

                </td>
              </tr>
            ))}
            {!invoices.length && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No invoices found
                </td>
              </tr>
            )}
          </tbody>)}
        </table>
        {receivePaymentId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
      <h2 className="text-lg font-semibold">
        Receive Payment
      </h2>

      <p className="text-sm text-gray-600">
        Invoice: #{receivePaymentId._id.slice(-6)}
      </p>

      <input
        type="number"
        placeholder="Enter amount"
        className="w-full border rounded px-3 py-2"
        value={paymentAmount}
        onChange={(e) => setPaymentAmount(e.target.value)}
      />

      <select
        className="w-full border rounded px-3 py-2"
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
      >
        <option value="">Select Account</option>
        {accounts.map((a) => (
          <option key={a._id} value={a._id}>
            {a.name} (Balance: {a.currentBalance.toLocaleString()})
          </option>
        ))}
      </select>

      <div className="flex justify-end gap-3">
        <button
          onClick={() => setReceivePaymentId(null)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>

        <button
          disabled={!paymentAmount || !selectedAccount}
          onClick={receivePayment}
          className="px-5 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          Confirm Receive
        </button>
      </div>
    </div>
  </div>
)}


        {/* Pagination */}
        <div className="flex justify-between items-center p-4">
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

export default Invoice;
