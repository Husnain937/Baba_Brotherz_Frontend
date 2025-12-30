/** @format */
import React from "react";

const ViewUser = ({ user, onClose }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Details</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Name</p>
          <p className="font-medium">{user.name}</p>
        </div>

        <div>
          <p className="text-gray-500">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>

        <div>
          <p className="text-gray-500">Role</p>
          <p className="capitalize font-medium">{user.role}</p>
        </div>

        <div>
          <p className="text-gray-500">Created At</p>
          <p className="font-medium">
            {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <h4 className="mt-6 font-semibold">Permissions</h4>

      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        {Object.entries(user.permissions).map(([key, value]) => (
          <span
            key={key}
            className={`px-3 py-1 rounded-full ${
              value
                ? "bg-green-100 text-green-700"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {key}
          </span>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ViewUser;
