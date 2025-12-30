import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaToggleOn, FaToggleOff } from "react-icons/fa";
import Expense from "./Expense";

const ExpenseCategories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("Expensive_Category");
  const [limit,setLimit] = useState(10);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");

  const loadCategories = async () => {
    try {
      const res = await api.get("/expense-categories", {
        params: { page, search , limit },
      });
      setCategories(res.data.categories || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadCategories();
  }, [page, search , limit]);

  const createCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expense-categories", { name, code, note });
      toast.success("Category created successfully");
      setShowForm(false);
      setName("");
      setCode("");
      setNote("");
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.patch(`/expense-categories/toggle/${id}`);
      loadCategories();
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
     <div className="flex gap-6 mb-6 border-b">
      {[
        { key: "Expensive_Category", label: "Expensive Category" },
        { key: "Expenses", label: "Expenses" },
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
    {activeTab==="Expensive_Category" && (<>
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Expense Categories
          </h1>
          <p className="text-sm text-gray-600">
            Manage expense heads for accounting & reports
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="
            flex items-center gap-2
            bg-gradient-to-r from-indigo-600 to-blue-600
            text-white px-5 py-2 rounded-lg shadow
            hover:shadow-md transition
          "
        >
          <FaPlus /> Add Category
        </button>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex gap-4">
        <input
          placeholder="Search category..."
          className="border rounded-lg px-4 py-2 w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
         <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
          className="border rounded-lg px-3 py-2">
          {[5, 10, 20, 50].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-700 w-[35%]">
                Name
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 w-[25%]">
                Code
              </th>
              <th className="p-4 text-center font-semibold text-gray-700 w-[20%]">
                Status
              </th>
              <th className="p-4 text-center font-semibold text-gray-700 w-[20%]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {!categories.length && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  No expense categories found
                </td>
              </tr>
            )}

            {categories.map((c, idx) => (
              <tr
                key={c._id}
                className={`
                  border-b transition
                  ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  hover:bg-indigo-50
                `}
              >
                <td className="p-4 font-medium text-gray-800">
                  {c.name}
                </td>

                <td className="p-4 text-gray-600">
                  {c.code || "—"}
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`
                      inline-flex px-3 py-1 rounded-full
                      text-xs font-semibold
                      ${c.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"}
                    `}
                  >
                    {c.status}
                  </span>
                </td>

                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleStatus(c._id)}
                    title="Toggle Status"
                    className="transition"
                  >
                    {c.status === "Active" ? (
                      <FaToggleOn className="text-green-600 text-2xl" />
                    ) : (
                      <FaToggleOff className="text-gray-500 text-2xl" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
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

      {/* ================= CREATE MODAL ================= */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={createCategory}
            className="bg-white rounded-xl p-6 w-full max-w-md space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Add Expense Category
            </h2>

            <input
              placeholder="Category Name"
              required
              className="border rounded-lg px-3 py-2 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Code (optional)"
              className="border rounded-lg px-3 py-2 w-full"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <textarea
              placeholder="Note (optional)"
              className="border rounded-lg px-3 py-2 w-full"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-green-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
</>)}
{activeTab==="Expenses" && (<>
  <Expense/>
</>)}
    </div>
  );
};

export default ExpenseCategories;
