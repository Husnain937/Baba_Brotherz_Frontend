/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa";

const Employees = () => {
  /* ============================
     STATE
  ============================ */
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  // List controls
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
const [showForm, setShowForm] = useState(false);
const [editingEmployee, setEditingEmployee] = useState(null);

const [form, setForm] = useState({
  name: "",
  employeeCode: "",
  designation: "",
  department: "",
  monthlySalary: "",
  joinDate: "",
  contactNumber: "",
  email: "",
  note: "",
});
const toggleStatus = async (id) => {
  if (!window.confirm("Are you sure you want to change employee status?")) return;

  try {
    setLoading(true)
    await api.patch(`/employees/toggle-status/${id}`);
    toast.success("Employee status updated");
    loadEmployees();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to update status");
  }
  finally{
    setLoading(false)
  }
};

  /* ============================
     SEARCH DEBOUNCE
  ============================ */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ============================
     LOAD EMPLOYEES
  ============================ */
  const loadEmployees = async () => {
    try {
      setLoading(true);

      const res = await api.get("/employees", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          status,
          sortBy,
          sortOrder,
        },
      });

      setEmployees(res.data.employees || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };
const submitForm = async (e) => {
  e.preventDefault();

  if (!form.name || !form.employeeCode || !form.monthlySalary || !form.joinDate) {
    return toast.error("Please fill all required fields");
  }

  try {
    setFormLoading(true)
    if (editingEmployee) {
      await api.put(`/employees/${editingEmployee._id}`, form);
      toast.success("Employee updated successfully");
    } else {
      await api.post("/employees", form);
      toast.success("Employee created successfully");
    }

    setShowForm(false);
    setForm({
      name: "",
      employeeCode: "",
      designation: "",
      department: "",
      monthlySalary: "",
      joinDate: "",
      contactNumber: "",
      email: "",
      note: "",
    });

    loadEmployees();
  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to save employee");
  }
  finally{
    setFormLoading(false)
  }
};

  useEffect(() => {
    loadEmployees();
  }, [page, limit, debouncedSearch, status, sortBy, sortOrder]);

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
        {/* ================= CREATE / EDIT EMPLOYEE MODAL ================= */}
      
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
        fixed top-25 left-1/2 -translate-x-1/2 z-50
        w-full max-w-3xl
        bg-white rounded-2xl
        shadow-[0_20px_60px_rgba(0,0,0,0.25)]
        max-h-[85vh] overflow-y-auto
      "
    >
      {/* HEADER */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-t-2xl">
        <h2 className="text-lg font-semibold text-white">
          {editingEmployee ? "Edit Employee" : "Add Employee"}
        </h2>
      </div>

      {/* FORM */}
      <form onSubmit={submitForm} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Employee Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Employee Code *"
            value={form.employeeCode}
            onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
            disabled={!!editingEmployee}
          />

          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => setForm({ ...form, designation: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
          />

          <input
            type="number"
            className="border rounded-lg px-3 py-2"
            placeholder="Monthly Salary *"
            value={form.monthlySalary}
            onChange={(e) => setForm({ ...form, monthlySalary: e.target.value })}
          />

          <input
            type="date"
            className="border rounded-lg px-3 py-2"
            value={form.joinDate}
            onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Contact Number"
            value={form.contactNumber}
            onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
          />

          <input
            className="border rounded-lg px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <textarea
          className="border rounded-lg px-3 py-2 w-full"
          placeholder="Note"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />

        {/* FOOTER */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-5 py-2 rounded-lg border"
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
                    "Save"
                  }
                </button>
        </div>
      </form>
    </div>
  </>
)}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
  <div>
    <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
    <p className="text-sm text-gray-600">
      Manage employee records & salaries
    </p>
  </div>

  <button
    onClick={() => {
      setEditingEmployee(null);
      setShowForm(true);
    }}
    className="
      flex items-center gap-2
      bg-gradient-to-r from-indigo-600 to-blue-600
      text-white px-5 py-2 rounded-lg
      hover:shadow-lg transition
    "
  >
    + Add Employee
  </button>
</div>


      {/* ================= FILTER BAR ================= */}
     <div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* 🔍 SEARCH */}
    <div className="w-full sm:w-72">
      <input
        type="text"
        placeholder="Search name, code or email..."
        className="w-full border rounded-lg px-4 py-2"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
    </div>

    {/* 📌 STATUS */}
    <div className="w-full sm:w-40">
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          setPage(1);
        }}
        className="w-full border rounded-lg px-3 py-2"
      >
        <option value="">All Status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
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
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>
    </div>

    {/* CLEAR */}
    <div className="w-full sm:w-auto">
      <button
        onClick={() => {
          setSearch("");
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


      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-700 w-[20%]">
                Name
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 w-[15%]">
                Code
              </th>
              <th className="p-4 text-left font-semibold text-gray-700 w-[20%]">
                Designation
              </th>
              <th className="p-4 text-right font-semibold text-gray-700 w-[15%]">
                Salary
              </th>
              <th className="p-4 text-center font-semibold text-gray-700 w-[15%]">
                Status
              </th>
              <th className="p-4 text-center font-semibold text-gray-700 w-[15%]">
                Action
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
         ( <tbody>
            {!employees.length && !loading && (
              <tr>
                <td
                  colSpan="6"
                  className="p-8 text-center text-gray-500"
                >
                  No employees found
                </td>
              </tr>
            )}

            {employees.map((e, idx) => (
              <tr
                key={e._id}
                className={`
                  border-b transition
                  ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  hover:bg-indigo-50
                `}
              >
                <td className="p-4 font-medium text-gray-800 truncate">
                  {e.name}
                </td>

                <td className="p-4">{e.employeeCode}</td>

                <td className="p-4">{e.designation || "—"}</td>

                <td className="p-4 text-right font-medium">
                  {e.monthlySalary?.toLocaleString()}
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      e.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>

                <td className="p-4 text-center">
  <div className="flex items-center justify-center gap-3">

    {/* ✏️ EDIT */}
    <button
      onClick={() => {
        setEditingEmployee(e);
        setForm({
          ...e,
          joinDate: e.joinDate?.split("T")[0],
        });
        setShowForm(true);
      }}
      title="Edit Employee"
      className="
        p-2 rounded-lg
        bg-indigo-50 text-indigo-600
        hover:bg-indigo-100 hover:text-indigo-800
        transition
      "
    >
      <FaEdit />
    </button>

    {/* 🔁 TOGGLE STATUS */}
    <button
      onClick={() => toggleStatus(e._id)}
      title={e.status === "Active" ? "Deactivate Employee" : "Activate Employee"}
      className={`
        p-2 rounded-lg transition
        ${
          e.status === "Active"
            ? "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800"
            : "bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800"
        }
      `}
    >
      {e.status === "Active" ? "Disable" : "Enable"}
    </button>

  </div>
</td>

              </tr>
            ))}
          </tbody>)}
        </table>

        {/* ================= PAGINATION ================= */}
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
    </div>
  );
};

export default Employees;
