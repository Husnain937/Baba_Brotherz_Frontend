import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FaPlus , FaEye  } from "react-icons/fa";
import { toast } from "react-toastify";

const ProductionOrder = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [viewOrder, setViewOrder] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [totalPages, setTotalPages] = useState(1);

const [search, setSearch] = useState("");
const [status, setStatus] = useState("");
const [productFilter, setProductFilter] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [refetch, setRefetch] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    product: "",
    quantityPlanned: "",
    note: "",
  });

  useEffect(() => {
    loadProducts();
  }, [refetch]);
  useEffect(() => {
  loadOrders();
}, [page, limit, search, status, productFilter, refetch]);


const loadOrders = async () => {
  try {
    setLoading(true)
    const res = await api.get(
      "/production-orders/listProductionOrdersPage",
      {
        params: {
          page,
          limit,
          search: search || undefined,
          status: status || undefined,
          product: productFilter || undefined,
        },
      }
    );
    setOrders(res.data.orders || []);
    setTotalPages(res.data.pagination?.totalPages || 1);
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      "Failed to load production orders."
    );
  }
  finally{
    setLoading(false)
  }
};

const startProduction = async (orderId) => {
    try {
      setLoading(true)
      setLoadingId(orderId);
      await api.post("/production-preparation/start", {
        productionOrderId: orderId,
      });
      toast.success("Production started");
      loadOrders()
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to start production");
    } finally {
      setLoadingId(null);
      setLoading(false)
    }
  };
const loadProducts = async () => {
  try {
    setLoading(true)
    const res = await api.get("/products");
    setProducts(res.data.items || res.data.products || []);
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      "Failed to load products."
    );
  }
  finally{
    setLoading(false)
  }
};


 const submitForm = async (e) => {
  e.preventDefault();

  // Frontend validation
  if (!form.product) {
    return toast.error("Please select a product.");
  }

  if (!form.quantityPlanned || Number(form.quantityPlanned) <= 0) {
    return toast.error("Planned quantity must be greater than 0.");
  }

  try {
    setFormLoading(true)
    await api.post("/production-orders", {
      product: form.product,
      quantityPlanned: Number(form.quantityPlanned),
      note: form.note,
    });

    toast.success("Production order created successfully");

    setTimeout(() => {
      setShowForm(false);
      setForm({ product: "", quantityPlanned: "", note: "" });
      setRefetch((p) => p + 1);
    }, 100);

  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      "Failed to create production order."
    );
  }
  finally{
    setFormLoading(false)
  }
};
// 🎨 Production Order Status Badge Colors
const getProductionStatusBadge = (status) => {
  switch (status) {
    case "Planned":
      return "bg-gray-100 text-gray-700"

    case "In Progress":
      return "bg-blue-100 text-blue-700"

    case "Completed":
      return "bg-green-100 text-green-700"

    case "Cancelled":
      return "bg-red-100 text-red-700"

    default:
      return "bg-gray-100 text-gray-700"
  }
};



 return (
  <div>

    {/* ================= HEADER ================= */}
    <div className="flex justify-between items-center mb-2">    
    </div>
    {/* ================= CREATE MODAL ================= */}
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
            fixed top-20 left-1/2 -translate-x-1/2 z-50
            w-full max-w-lg
            bg-white rounded-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
          "
        >
          {/* MODAL HEADER */}
          <div className="px-6 py-4 rounded-t-2xl bg-gradient-to-r from-indigo-600 to-blue-600">
            <h2 className="text-lg font-semibold text-white">
              Create Production Order
            </h2>
            <p className="text-sm text-indigo-100">
              Define product & planned quantity
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={submitForm} className="p-6 space-y-4">

            {/* PRODUCT */}
            <select
              className="w-full border rounded-lg px-4 py-2.5"
              value={form.product}
              onChange={(e) =>
                setForm({ ...form, product: e.target.value })
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

            {/* QUANTITY */}
            <input
              type="number"
              min="1"
              placeholder="Planned Quantity"
              className="w-full border rounded-lg px-4 py-2.5"
              value={form.quantityPlanned}
              onChange={(e) =>
                setForm({ ...form, quantityPlanned: e.target.value })
              }
              required
            />

            {/* NOTE */}
            <textarea
              placeholder="Note (optional)"
              className="w-full border rounded-lg px-4 py-2.5"
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
            />

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="
                  px-4 py-2 rounded-lg border
                  text-gray-600 hover:bg-gray-100
                "
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
                    "Create Order"
                  }
                </button>
            </div>
          </form>
        </div>
      </>
    )}
{viewOrder && (
  <>
    {/* BACKDROP */}
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      onClick={() => setViewOrder(null)}
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
          Production Order Details
        </h2>
        <p className="text-sm text-indigo-100 mt-1">
          {viewOrder.product?.name}
        </p>
      </div>

      {/* ================= BODY ================= */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">

        {/* INFO GRID */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-xs">Order Number</p>
            <p className="font-semibold">{viewOrder.orderNumber}</p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Status</p>
            <span
              className={`
                inline-block px-3 py-1 rounded-full text-xs font-semibold
                ${getProductionStatusBadge(viewOrder.status)}
              `}
            >
              {viewOrder.status}
            </span>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Planned Quantity</p>
            <p className="font-semibold">
              {viewOrder.quantityPlanned}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-xs">Created On</p>
            <p className="font-medium">
              {new Date(viewOrder.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div> */}

        {/* MATERIALS */}
        <div>
          <p className="font-semibold text-gray-800 mb-2">
            Required Materials
          </p>

          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 text-left">Item</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="p-3 text-center">UOM</th>
                  </tr>
                </thead>
                <tbody>
                  {viewOrder.requiredMaterials.map((m) => (
                    <tr key={m._id} className="border-t">
                      <td className="p-3 font-medium">
                        {m.item?.name}
                      </td>
                      <td className="p-3 text-center font-semibold">
                        {m.quantityRequired}
                      </td>
                      <td className="p-3 text-center text-gray-600">
                        {m.item?.uom}
                      </td>
                    </tr>
                  ))}

                  {!viewOrder.requiredMaterials.length && (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-gray-500">
                        No materials found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* NOTE */}
        {/* {viewOrder.note && (
          <div>
            <p className="text-gray-500 text-xs mb-1">Note</p>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
              {viewOrder.note}
            </div>
          </div>
        )} */}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="px-6 py-4 border-t flex justify-end">
        <button
          onClick={() => setViewOrder(null)}
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

    {/* ================= LIST TABLE ================= */}
    <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
  <div className="bg-gray-50 p-4 border-b rounded-t-xl">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">

    {/* ================= LEFT FILTERS ================= */}
    <div className="flex flex-wrap gap-4 flex-1">

      {/* 🔍 SEARCH ORDER NUMBER */}
      <div className="w-full sm:w-56">
        <label className="block text-xs text-gray-600 mb-1">
          Search Order #
        </label>
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="PO-1766..."
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>

      {/* 📦 PRODUCT FILTER */}
      <div className="w-full sm:w-56">
        <label className="block text-xs text-gray-600 mb-1">
          Product
        </label>
        <select
          value={productFilter}
          onChange={(e) => {
            setProductFilter(e.target.value);
            setPage(1);
          }}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">All Products</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* 📌 STATUS FILTER */}
      <div className="w-full sm:w-44">
        <label className="block text-xs text-gray-600 mb-1">
          Status
        </label>
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
        <label className="block text-xs text-gray-600 mb-1">
          Rows
        </label>
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
        <label className="block text-xs text-gray-600 mb-1">
          Clear 
        </label>
        <button
          onClick={() => {
            setSearch("");
            setProductFilter("");
            setStatus("");
            setPage(1);
          }}
          className="w-full sm:w-auto px-4 py-2 border rounded-lg hover:bg-slate-100 transition"
        >
          Clear
        </button>
      </div>

    </div>

    {/* ================= RIGHT ACTION ================= */}
    <div className="flex-shrink-0">
      <button
        onClick={() => setShowForm(true)}
        className="
          flex items-center gap-2
          bg-gradient-to-r from-indigo-600 to-blue-600
          text-white px-5 py-2.5 rounded-lg
          shadow-md hover:shadow-lg transition
          whitespace-nowrap
        "
      >
        <FaPlus /> New Production Order
      </button>
    </div>

  </div>
</div>



      <table className="w-full table-fixed text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-4 text-left w-[25%]">Order #</th>
            <th className="p-4 text-left w-[20%]">Product</th>
            <th className="p-4 text-right w-[20%]">Quantity</th>
            <th className="p-4 text-right w-[20%]">Total Amount</th>
            <th className="p-4 text-left w-[20%]">Status</th>
            <th className="p-4 text-left w-[20%]">Date</th>
            <th className="p-4 text-center w-[20%]">Actions</th>
          </tr>
        </thead>
{loading ? (
      <tbody>
        <tr>
          <td colSpan="7" className="h-40">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </td>
        </tr>
      </tbody>
    ) :
    (    <tbody>
          {orders.map((o) => (
            <tr
              key={o._id}
              className="border-t hover:bg-indigo-50 transition"
            >
              <td className="p-4 font-medium">
                {o.orderNumber}
              </td>

              <td className="p-4">
                {o.product?.name}
              </td>

              <td className="p-4 text-right tabular-nums">
                {o.quantityPlanned}
              </td>
               <td className="p-4 text-right tabular-nums">
                {o.totalAmount}
              </td>
              <td className="p-1">
  <span
    className={`
      px-3 py-1 rounded-full text-sm font-medium
      ${getProductionStatusBadge(o.status)}
    `}
  >
    {o.status}
  </span>
</td>


              <td className="p-4 text-sm text-gray-600">
                {new Date(o.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4">
  <div className="flex justify-center">
    <button
      onClick={() => setViewOrder(o)}
      className="
        p-2 rounded-lg
        bg-green-50 text-green-600
        hover:bg-green-100 hover:text-green-800
        transition
      "
      title="View Production Order"
    >
      <FaEye />
    </button>
  </div>
</td>
                <td className="p-4 text-center">
                  {o.status==="Planned" && (
                  <button
                    onClick={() => startProduction(o._id)}
                    disabled={loadingId === o._id}
                    className="
                      px-2 py-2 rounded-lg text-white
                      bg-gradient-to-r from-blue-600 to-indigo-600
                      hover:from-blue-700 hover:to-indigo-700
                      disabled:opacity-50 transition
                    "
                  >
                    {loadingId === o._id
                      ? "Starting..."
                      : "Start Production"}
                  </button> )}
                </td> 

            </tr>
          ))}

          {!orders.length && (
            <tr>
              <td colSpan="6" className="p-6 text-center text-gray-500">
                No production orders found
              </td>
            </tr>
          )}
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
);

};

export default ProductionOrder;
