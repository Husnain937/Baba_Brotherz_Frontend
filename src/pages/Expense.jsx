/** @format */
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaCheck, FaEdit } from "react-icons/fa";

const Expense = () => {
  /* =======================
     STATE
  ======================= */
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [payExpenseId, setPayExpenseId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [editExpense, setEditExpense] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit,setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: "",
    amount: "",
    paymentMethod: "Cash",
    expenseDate: "",
    reference: "",
    note: "",
  });

  /* =======================
     LOAD DATA
  ======================= */
  const loadExpenses = async () => {
    try {
      setLoading(true)
      const res = await api.get("/expenses", {
        params: { page, limit, search, status ,startDate,endDate},
      });
      setExpenses(res.data.expenses || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to load expenses");
    }
    finally{
      setLoading(false)
    }
  };
const loadAccounts = async () => {
  const res = await api.get("/accounts");
  setAccounts(res.data.accounts.filter(a => a.status === "Active"));
};

  const loadCategories = async () => {
    try {
      const res = await api.get("/expense-categories/dropdown/active");
      setCategories(res.data.categories || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };
useEffect(() => {
  loadAccounts();
}, []);

  useEffect(() => {
    loadExpenses();
  }, [page, search, status,startDate,endDate,limit]);

  const loadExpenseSummary = async () => {
  if (!startDate || !endDate) return;

  try {
    setLoading(true)
    const res = await api.get("/expenses/summary", {
      params: { startDate, endDate },
    });
    setSummary(res.data.summary);
  } catch {
    toast.error("Failed to load expense summary");
  }
  finally{
    setLoading(false)
  }
};
useEffect(() => {
  loadExpenseSummary();
}, [startDate, endDate]);

  /* =======================
     CREATE EXPENSE
  ======================= */
  const submitExpense = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount || !form.expenseDate) {
      return toast.error("Category, amount and date are required");
    }

    try {
      setFormLoading(true)
      await api.post("/expenses", form);
      toast.success("Expense created");
      setShowForm(false);
      setForm({
        category: "",
        amount: "",
        paymentMethod: "Cash",
        expenseDate: "",
        reference: "",
        note: "",
      });
      loadExpenses();
            loadExpenseSummary();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create expense");
    }
    finally{
      setFormLoading(false)
    }
  };

  /* =======================
     PAY EXPENSE
  ======================= */
  const payExpense = async () => {
            try {
              setLoading(true)
              await api.patch(`/expenses/pay/${payExpenseId}`, {
                account: selectedAccount,
              });

              toast.success("Expense paid successfully");
              setPayExpenseId(null);
              loadExpenses();
              loadExpenseSummary();
            } catch (err) {
              toast.error(err.response?.data?.message || "Payment failed");
            }
            finally{
              setLoading(false)
            }
  };

  /* =======================
     UPDATE EXPENSE (NOTE)
  ======================= */
  const updateExpense = async (e) => {
    e.preventDefault();
    try {
      setLoading(true)
      await api.patch(`/expenses/${editExpense._id}`, {
        reference: editExpense.reference,
        note: editExpense.note,
      });
      toast.success("Expense updated");
      setEditExpense(null);
      loadExpenseSummary();
      loadExpenses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
    finally{
      setLoading(false)
    }
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <div >
{summary && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-sm text-gray-500">Total Expenses</p>
      <p className="text-2xl font-bold text-gray-800">
        {summary.totalAmount.toLocaleString()}
      </p>
    </div>

    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-sm text-gray-500">Paid</p>
      <p className="text-2xl font-bold text-green-600">
        {summary.paidAmount.toLocaleString()}
      </p>
    </div>

    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-sm text-gray-500">Pending</p>
      <p className="text-2xl font-bold text-orange-600">
        {summary.pendingAmount.toLocaleString()}
      </p>
    </div>

    <div className="bg-white p-5 rounded-xl shadow">
      <p className="text-sm text-gray-500">Entries</p>
      <p className="text-lg font-semibold text-gray-700">
        Paid: {summary.paidCount} / {summary.totalCount}
      </p>
    </div>

  </div>
)}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-sm text-gray-600">
            Track company expenses & payments
          </p>
        </div>

        <button
          onClick={() => {
            loadCategories();
            setShowForm(true);
          }}
          className="
            flex items-center gap-2
            bg-gradient-to-r from-indigo-600 to-blue-600
            text-white px-5 py-2 rounded-lg
          "
        >
          <FaPlus /> Add Expense
        </button>
      </div>

      {/* FILTER BAR */}
 <div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* 🔍 SEARCH */}
    <div className="w-full sm:w-56">
      <input
        placeholder="Search expense..."
        className="w-full border rounded-lg px-3 py-2"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
    </div>

    {/* 📌 STATUS */}
    <div className="w-full sm:w-36">
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        className="w-full border rounded-lg px-3 py-2"
      >
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Paid">Paid</option>
      </select>
    </div>

    {/* 📅 FROM DATE */}
    <div className="w-full sm:w-40">
      <label className="block text-xs text-gray-500 mb-1">
        From
      </label>
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          setPage(1);
        }}
      />
    </div>

    {/* 📅 TO DATE */}
    <div className="w-full sm:w-40">
      <label className="block text-xs text-gray-500 mb-1">
        To
      </label>
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2"
        value={endDate}
        onChange={(e) => {
          setEndDate(e.target.value);
          setPage(1);
        }}
      />
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
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </div>

    {/* CLEAR */}
    <div className="w-full sm:w-auto sm:pb-[2px]">
      <button
        onClick={() => {
          setSearch("");
          setStartDate("");
          setEndDate("");
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



      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
      <table className="w-full table-fixed text-sm">
  <thead className="bg-gray-100 border-b">
    <tr>
      <th className="p-4 text-left font-semibold text-gray-700 w-[15%]">
        Expense #
      </th>
      <th className="p-4 text-left font-semibold text-gray-700 w-[20%]">
        Category
      </th>
      <th className="p-4 text-right font-semibold text-gray-700 w-[15%]">
        Amount
      </th>
      <th className="p-4 text-center font-semibold text-gray-700 w-[15%]">
        Date
      </th>
      <th className="p-4 text-center font-semibold text-gray-700 w-[15%]">
        Status
      </th>
      <th className="p-4 text-center font-semibold text-gray-700 w-[20%]">
        Actions
      </th>
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
  (<tbody>
    {!expenses.length && (
      <tr>
        <td colSpan="6" className="p-8 text-center text-gray-500">
          No expenses found
        </td>
      </tr>
    )}

    {expenses.map((e, idx) => (
      <tr
        key={e._id}
        className={`
          border-b transition
          ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
          hover:bg-indigo-50
        `}
      >
        {/* EXPENSE NUMBER */}
        <td className="p-4 font-medium text-gray-800 truncate">
          {e.expenseNumber}
        </td>

        {/* CATEGORY */}
        <td className="p-4 text-gray-800">
          {e.category?.name || "—"}
        </td>

        {/* AMOUNT */}
        <td className="p-4 text-right font-semibold text-gray-800 tabular-nums">
          {Number(e.amount).toLocaleString()}
        </td>

        {/* DATE */}
        <td className="p-4 text-center text-gray-600">
          {new Date(e.expenseDate).toLocaleDateString()}
        </td>

        {/* STATUS */}
        <td className="p-4 text-center">
          <span
            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold
              ${
                e.status === "Paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }
            `}
          >
            {e.status}
          </span>
        </td>

        {/* ACTIONS */}
        <td className="p-4">
          <div className="flex justify-center items-center gap-3">

            {/* ✏️ EDIT */}
            {!e.isLocked && (
              <button
                onClick={() => setEditExpense(e)}
                title="Edit Expense"
                className="
                  p-2 rounded-lg
                  bg-indigo-50 text-indigo-600
                  hover:bg-indigo-100 hover:text-indigo-800
                  transition
                "
              >
                <FaEdit />
              </button>
            )}

            {/* ✅ PAY */}
            {e.status === "Pending" && (
              <button
                onClick={() => {
                setPayExpenseId(e._id);
                setSelectedAccount("");
              }}

                title="Mark as Paid"
                className="
                  p-2 rounded-lg
                  bg-green-50 text-green-600
                  hover:bg-green-100 hover:text-green-800
                  transition
                "
              >
                <FaCheck />
              </button>
            )}

          </div>
        </td>
      </tr>
    ))}
  </tbody>)}
</table>

         <div className="flex justify-between items-center p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) => Math.min(p + 1, totalPages))
            }
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={submitExpense}
            className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4"
          >
            <h2 className="text-lg font-semibold">Add Expense</h2>

            <select
              className="border rounded-lg px-3 py-2 w-full"
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Amount"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />

            <input
              type="date"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.expenseDate}
              onChange={(e) =>
                setForm({ ...form, expenseDate: e.target.value })
              }
            />

            <input
              placeholder="Reference"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.reference}
              onChange={(e) =>
                setForm({ ...form, reference: e.target.value })
              }
            />

            <textarea
              placeholder="Note"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.note}
              onChange={(e) =>
                setForm({ ...form, note: e.target.value })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg"
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
    "Save Expense"
  )}
        </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT EXPENSE MODAL */}
      {editExpense && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={updateExpense}
            className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4"
          >
            <h2 className="text-lg font-semibold">Edit Expense</h2>

            <input
              disabled
              className="border rounded-lg px-3 py-2 w-full bg-gray-100"
              value={editExpense.category?.name}
            />

            <input
              disabled
              className="border rounded-lg px-3 py-2 w-full bg-gray-100"
              value={`Amount: ${editExpense.amount}`}
            />

            <input
              placeholder="Reference"
              className="border rounded-lg px-3 py-2 w-full"
              value={editExpense.reference || ""}
              onChange={(e) =>
                setEditExpense({
                  ...editExpense,
                  reference: e.target.value,
                })
              }
            />

            <textarea
              placeholder="Note"
              className="border rounded-lg px-3 py-2 w-full"
              value={editExpense.note || ""}
              onChange={(e) =>
                setEditExpense({
                  ...editExpense,
                  note: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditExpense(null)}
                className="px-4 py-2 border rounded-lg"
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
      {"Updating..."}
    </>
  ) : (
    "Update Bill"
  )}
        </button>
            </div>
          </form>
        </div>
      )}
  {payExpenseId && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Pay Expense</h2>

      <select
        className="border rounded-lg px-3 py-2 w-full"
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
          onClick={() => setPayExpenseId(null)}
          className="px-4 py-2 border rounded-lg"
        >
          Cancel
        </button>

        <button
          disabled={!selectedAccount}
          onClick={()=>payExpense()}
          className="px-5 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
        >
          Confirm Pay
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Expense;
