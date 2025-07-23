import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";
import "./FarmerTable.css";

export default function FarmerTable({ refreshFlag, onEdit, onDeleted }) {
  const { authToken } = useAuth();
  const [farmers, setFarmers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(""); // new
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBlocks();
  }, [authToken]);

  useEffect(() => {
    fetchFarmers();
  }, [refreshFlag, currentPage, selectedBlock]);

  const fetchBlocks = async () => {
    try {
      const res = await axios.get("https://rice-scheme-system-1.onrender.com/farmers/blocks/", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBlocks(res.data);
    } catch (err) {
      console.error("Failed to fetch blocks", err);
    }
  };

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        ...(searchTerm ? { search: searchTerm } : {}),
        ...(selectedBlock ? { block: selectedBlock } : {}),
      });

      const res = await axios.get(
        `https://rice-scheme-system-1.onrender.com/farmers/farmers/?${queryParams}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      setFarmers(res.data.results);
      setTotalPages(Math.ceil(res.data.count / 10));
    } catch (err) {
      Swal.fire("Error", "Failed to fetch farmers", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`https://rice-scheme-system-1.onrender.com/farmers/farmers/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      Swal.fire("Deleted!", "Farmer has been deleted.", "success");
      onDeleted?.();
      fetchFarmers();
    } catch (error) {
      Swal.fire("Error", "Delete failed.", "error");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFarmers();
  };

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return (
    <div className="farmer-table-container">
      <div className="farmer-table-card">
        <div className="farmer-table-header">
          <h2>Registered Farmers</h2>
        </div>

        {/* Filter by Block - Radio Buttons */}
        <div className="block-filter">
          <strong>Filter by Block:</strong>
          {blocks.map((block) => (
            <label key={block.id} className="block-radio">
              <input
                type="radio"
                name="block"
                value={block.id}
                checked={selectedBlock === String(block.id)}
                onChange={(e) => {
                  setSelectedBlock(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {block.name}
            </label>
          ))}
          <label className="block-radio">
            <input
              type="radio"
              name="block"
              value=""
              checked={selectedBlock === ""}
              onChange={() => {
                setSelectedBlock("");
                setCurrentPage(1);
              }}
            />
            All
          </label>
        </div>

        <div className="farmer-table-body">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, phone or registration number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="search-button">
              Search
            </button>
            <button
              type="button"
              className="clear-button"
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
                fetchFarmers();
              }}
              disabled={!searchTerm}
            >
              Clear
            </button>
          </form>

          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            <table className="farmer-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Block</th>
                  <th>Section</th>
                  <th>Plots</th>
                  <th>Amount/Plot</th>
                  <th>Total Amount</th>
                  <th>Reg No</th>
                  <th>Next of Kin</th>
                  <th>Role</th>
                  <th>Date Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {farmers.length > 0 ? (
                  farmers.map((f, i) => (
                    <tr key={f.id}>
                      <td>{(currentPage - 1) * 10 + i + 1}</td>
                      <td>
                        {f.image && (
                          <img
                            src={`https://rice-scheme-system-1.onrender.com${f.image}`}
                            alt="Farmer"
                            className="farmer-photo"
                          />
                        )}
                      </td>
                      <td>{`${f.first_name} ${f.middle_name || ""} ${f.last_name}`.trim()}</td>
                      <td>{f.gender}</td>
                      <td>{f.phone_number}</td>
                      <td>{f.email || "-"}</td>
                      <td>{f.location_name || "-"}</td>
                      <td>{f.block_name || "-"}</td>
                      <td>{f.section_name || "-"}</td>
                      <td>{f.number_of_plots}</td>
                      <td>{f.amount_per_plot}</td>
                      <td>{f.total_amount?.toFixed(2)}</td>
                      <td>{f.registration_number}</td>
                      <td>{f.next_of_kin || "-"}</td>
                      <td>
                        <span
                          className={`role-badge ${
                            f.role === "chairperson"
                              ? "role-chairperson"
                              : f.role === "president"
                              ? "role-president"
                              : "role-farmer"
                          }`}
                        >
                          {f.role}
                        </span>
                      </td>
                      <td>{f.date_registered}</td>
                      <td>
                        <button
                          onClick={() => onEdit(f)}
                          className="action-button edit-button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="action-button delete-button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="17" className="empty-table-message">
                      No farmers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* Pagination Controls */}
          <div className="pagination-controls">
            <button
              className="page-button"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange("prev")}
            >
              Previous
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="page-button"
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange("next")}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
