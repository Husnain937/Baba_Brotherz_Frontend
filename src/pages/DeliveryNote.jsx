import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";

const DeliveryNote = () => {
  const [deliveryNotes, setDeliveryNotes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    customer: "",
    invoice: "",
    note: "",
    items: [{ product: "", productName: "Product", quantity: 1 }],
  });

  // ========== LOAD DATA ==========
  const loadDeliveryNotes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/delivery-notes", {
        params: { page, limit, search },
      });
      setDeliveryNotes(res.data.data || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load delivery notes.");
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers/dropdown");
      setCustomers(res.data.customers || []);
    } catch {
      toast.error("Failed to load customers");
    }
  };

  const loadInvoices = async () => {
    try {
      const res = await api.get("/invoices", { params: { limit: 1000 } });
      setInvoices(res.data.data || []);
    } catch {
      toast.error("Failed to load invoices");
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    loadDeliveryNotes();
    loadCustomers();
    loadInvoices();
    loadProducts();
  }, [page, limit]);

  // ========== EDIT NOTE ==========
  const openEdit = (note) => {
    setEditNote(note);
    setForm({
      customer: note.customer?._id || "",
      invoice: note.invoice?._id || "",
      note: note.note || "",
      items: note.items?.map((i) => ({
        product: i.product._id,
        productName: i.productSnapshot?.name || "Product",
        quantity: i.quantity,
      })) || [{ product: "", productName: "Product", quantity: 1 }],
    });
  };

  // ========== SUBMIT ==========
  const submitForm = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);

      const itemsToSend = form.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
      }));

      if (!form.customer) {
        toast.error("Customer is required");
        return;
      }
      if (itemsToSend.length === 0 || itemsToSend.some(i => !i.product || i.quantity <= 0)) {
        toast.error("Please add valid products and quantities");
        return;
      }

      // Update existing note
      if (editNote && editNote._id) {
        await api.put(`/delivery-notes/${editNote._id}`, {
          customer: form.customer,
          invoice: form.invoice,
          note: form.note,
          items: itemsToSend,
        });
        toast.success("Delivery note updated!");
      } else {
        // Create new note
        await api.post("/delivery-notes", {
          customer: form.customer,
          invoice: form.invoice,
          note: form.note,
          items: itemsToSend,
        });
        toast.success("Delivery note created!");
      }

      // Reset form
      setEditNote(null);
      setForm({
        customer: "",
        invoice: "",
        note: "",
        items: [{ product: "", productName: "Product", quantity: 1 }],
      });
      loadDeliveryNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save delivery note.");
    } finally {
      setFormLoading(false);
    }
  };

  const cancelNote = async (id) => {
    if (!window.confirm("Are you sure to cancel this delivery note?")) return;
    try {
      setLoading(true);
      await api.put(`/delivery-notes/${id}/cancel`);
      toast.success("Delivery note cancelled!");
      loadDeliveryNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || "Unable to cancel.");
    } finally {
      setLoading(false);
    }
  };

  // ========== JSX ==========
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-100 to-gray-200 relative">
      {loading && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* ========== CREATE / EDIT MODAL ========== */}
      {editNote !== null && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setEditNote(null)} />
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl bg-white rounded-2xl shadow-xl">
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-white">Delivery Note</h2>
            </div>
            <form onSubmit={submitForm} className="p-6 space-y-4">

              {/* Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg"
                  value={form.customer || ""}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.customerName}</option>
                  ))}
                </select>
              </div>

              {/* Invoice */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice</label>
                <select
                  className="w-full border px-3 py-2 rounded-lg"
                  value={form.invoice || ""}
                  onChange={(e) => {
                    const invoiceId = e.target.value;
                    setForm({ ...form, invoice: invoiceId });

                    const selectedInvoice = invoices.find(i => i._id === invoiceId);

                    if (selectedInvoice && selectedInvoice.items) {
                      const customerId = selectedInvoice.customer?._id || "";
                      const itemsFromInvoice = selectedInvoice.items.map(i => ({
                        product: i.product._id,
                        productName: i.productSnapshot?.name || "Product",
                        quantity: i.quantity
                      }));
                      setForm(prev => ({ ...prev, customer: customerId, items: itemsFromInvoice }));
                    } else {
                      setForm(prev => ({ ...prev, customer: "", items: [{ product: "", productName: "Product", quantity: 1 }] }));
                    }
                  }}
                >
                  <option value="">Select Invoice</option>
                  {invoices.map((i) => (
                    <option key={i._id} value={i._id}>
                      {i.customer?.customerName || "Invoice"} - {i.totalAmount.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                <textarea
                  className="w-full border rounded-lg px-4 py-2.5"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />
              </div>

              {/* Items */}
              <div className="overflow-x-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Items</h3>
                <table className="w-full text-sm border rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Product</th>
                      <th className="p-2 text-left">Quantity</th>
                      <th className="p-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.items.map((item, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="p-2">
                          <select
                            className="w-full border rounded px-2 py-1"
                            value={item.product || ""}
                            onChange={(e) => {
                              const selectedProduct = products.find(p => p._id === e.target.value);
                              const newItems = [...form.items];
                              newItems[idx].product = e.target.value;
                              newItems[idx].productName = selectedProduct?.name || "Product";
                              setForm({ ...form, items: newItems });
                            }}
                          >
                            <option value="">Select Product</option>
                            {products.map(p => (
                              <option key={p._id} value={p._id}>{p.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            min="1"
                            className="w-20 border rounded px-2 py-1"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...form.items];
                              newItems[idx].quantity = Number(e.target.value);
                              setForm({ ...form, items: newItems });
                            }}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            className="px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800"
                            onClick={() => {
                              const newItems = form.items.filter((_, i) => i !== idx);
                              setForm({ ...form, items: newItems });
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="mt-2 px-3 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800"
                  onClick={() => setForm({ ...form, items: [...form.items, { product: "", productName: "Product", quantity: 1 }] })}
                >
                  <FaPlus /> Add Item
                </button>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setEditNote(null)} className="px-5 py-2 rounded-lg border text-gray-600 hover:bg-gray-100">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-5 py-2 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
                  {formLoading ? "Saving..." : "Save Delivery Note"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Delivery Notes</h1>
        <button onClick={() => setEditNote({})} className="px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700">
          New Delivery Note
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Delivery #</th>
              <th className="p-4 text-left">Customer</th>
              <th className="p-4 text-left">Invoice</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveryNotes.map((dn) => (
              <tr key={dn._id} className="border-t hover:bg-indigo-50 transition">
                <td className="p-4 font-medium">{dn.deliveryNumber}</td>
                <td className="p-4">{dn.customer?.customerName || "-"}</td>
                <td className="p-4">{dn.invoice?.totalAmount || "-"}</td>
                <td className="p-4 capitalize">
                  <span className={`px-2 py-1 rounded-md text-sm ${
                    dn.status === "Delivered" ? "bg-green-100 text-green-700" :
                    dn.status === "Draft" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-200 text-gray-700"
                  }`}>{dn.status}</span>
                </td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => openEdit(dn)} className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800"><FaEdit /></button>
                  {dn.status !== "Cancelled" && (
                    <button onClick={() => cancelNote(dn._id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800"><FaTrash /></button>
                  )}
                  <button onClick={() => toast.info("View detail coming soon!")} className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800"><FaEye /></button>
                </td>
              </tr>
            ))}
            {!deliveryNotes.length && (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">No delivery notes found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4 border-t">
          <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(p-1,1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(p+1,totalPages))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryNote;
