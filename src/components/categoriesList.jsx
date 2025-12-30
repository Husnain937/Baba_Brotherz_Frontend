// CategoryList.jsx (or embedded within Categories.js, but a separate file is cleaner)
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const CategoryList = ({ refetchToggle }) => { // refetchToggle is for manual refresh
  const searchInputRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset page on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch categories when page, debounced search, or refetchToggle changes
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3000/api/category/get?page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearch}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
            },
          }
        );
        const { categories, totalPages } = response.data;
        setCategories(categories);
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [debouncedSearch, currentPage, refetchToggle]); // Add refetchToggle here

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading && categories.length === 0) return <div className="text-center text-xl mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">Error: {error}</div>;

  return (
    <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl p-6 border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">📋 Categories List</h2>
      
      {/* Search Input */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="🔍 Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          ref={searchInputRef}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden">
          {/* Table Head */}
          <thead className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <tr>
              <th className="border border-gray-200 p-3 text-left">Category Name</th>
              <th className="border border-gray-200 p-3 text-left">Description</th>
              <th className="border border-gray-200 p-3 text-left">Quantity Type</th>
              <th className="border border-gray-200 p-3 text-center">Actions</th>
            </tr>
          </thead>
          
          {/* Table Body - This is the primary part that changes */}
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="text-center p-4 text-gray-500 italic">Loading data...</td></tr>
            ) : categories.length > 0 ? (
              categories.map((item) => (
                <tr key={item._id} className="hover:bg-indigo-50 transition">
                  <td className="border border-gray-200 p-3">{item.categoryName}</td>
                  <td className="border border-gray-200 p-3">{item.categoryDescription}</td>
                  <td className="border border-gray-200 p-3">{item.categoryQuantityType}</td>
                  <td className="border border-gray-200 p-3 text-center">
                    <button className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition mt-1 sm:mt-0">
                      <FaEdit className="inline mr-1" /> Edit
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-lg ml-2 hover:bg-red-600 transition mt-1 sm:mt-0">
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="text-center p-4 text-gray-500 italic">No categories found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${currentPage === page ? "bg-indigo-500 text-white" : "bg-gray-200 hover:bg-gray-300"} transition`}
              >
                {page}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default CategoryList;