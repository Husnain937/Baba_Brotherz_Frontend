import React, { useState, useEffect } from "react";
import axios from "axios";

const AccountForm = ({ editAccount, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    accountName: "",
    accountType: "Asset",
    parentAccount: "",
    openingBalance: "",
    description: "",
  });

  const [allAccounts, setAllAccounts] = useState([]);

  useEffect(() => {
    if (editAccount) {
      setFormData({
        accountName: editAccount.accountName || "",
        accountType: editAccount.accountType || "Asset",
        parentAccount: editAccount.parentAccount || "",
        openingBalance: editAccount.openingBalance || 0,
        description: editAccount.description || "",
      });
    }
  }, [editAccount]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/account/getAccounts",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );
        setAllAccounts(res.data.data || []);
      } catch (err) {
        console.error("Error fetching accounts:", err);
      }
    };
    fetchAccounts();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editAccount) {
        await axios.put(
          `http://localhost:3000/api/account/updateAccount/${editAccount._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/account/createAccounts",
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );
      }
      onSuccess();
    } catch (err) {
      console.error("Error saving account:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold mb-2">
        {editAccount ? "Edit Account" : "Add New Account"}
      </h2>

      <input
        type="text"
        name="accountName"
        value={formData.accountName}
        onChange={handleChange}
        placeholder="Account Name"
        className="border rounded-md p-2 w-full"
        required
      />

      <select
        name="accountType"
        value={formData.accountType}
        onChange={handleChange}
        className="border rounded-md p-2 w-full"
      >
        <option value="Asset">Asset</option>
        <option value="Liability">Liability</option>
        <option value="Income">Income</option>
        <option value="Expense">Expense</option>
        <option value="Equity">Equity</option>
      </select>

      <select
        name="parentAccount"
        value={formData.parentAccount}
        onChange={handleChange}
        className="border rounded-md p-2 w-full"
      >
        <option value="">No Parent (Main Account)</option>
        {allAccounts.map(acc => (
          <option key={acc._id} value={acc._id}>
            {acc.accountName}
          </option>
        ))}
      </select>

      <input
        type="number"
        name="openingBalance"
        value={formData.openingBalance}
        onChange={handleChange}
        placeholder="Opening Balance"
        className="border rounded-md p-2 w-full"
      />

      <input
        type="text"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Description"
        className="border rounded-md p-2 w-full"
      />

      <div className="flex justify-end gap-4 mt-2">
        <button
          type="submit"
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
        >
          {editAccount ? "Update" : "Save"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AccountForm;
