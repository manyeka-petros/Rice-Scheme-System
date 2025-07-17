import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext"; // Adjust path if needed

export default function BlockSectionManager() {
  const { authToken, user } = useAuth(); // user should contain a `role` field
  const isAdminOrSecretary = user?.role === "admin" || user?.role === "secretary";

  const [blocks, setBlocks] = useState([]);
  const [sections, setSections] = useState([]);
  const [locations, setLocations] = useState([]);

  const [newLocation, setNewLocation] = useState({ name: "" });
  const [newBlock, setNewBlock] = useState({ name: "" });
  const [newSection, setNewSection] = useState({ name: "", block: "" });

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  };

  useEffect(() => {
    if (authToken) {
      fetchAllData();
    }
  }, [authToken]);

  const fetchAllData = async () => {
    try {
      const [blocksRes, sectionsRes, locationsRes] = await Promise.all([
        axios.get("http://localhost:8000/farmers/blocks/", axiosConfig),
        axios.get("http://localhost:8000/farmers/sections/", axiosConfig),
        axios.get("http://localhost:8000/farmers/locations/", axiosConfig),
      ]);
      setBlocks(blocksRes.data);
      setSections(sectionsRes.data);
      setLocations(locationsRes.data);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to fetch data", "error");
    }
  };

  const createLocation = async () => {
    if (!newLocation.name.trim()) {
      Swal.fire("Validation", "Location name is required", "warning");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8000/farmers/locations/",
        newLocation,
        axiosConfig
      );
      setNewLocation({ name: "" });
      Swal.fire("Success", "Location created", "success");
      fetchAllData();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.detail || "Failed to create location",
        "error"
      );
    }
  };

  const createBlock = async () => {
    if (!newBlock.name.trim()) {
      Swal.fire("Validation", "Block name is required", "warning");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8000/farmers/blocks/",
        newBlock,
        axiosConfig
      );
      setNewBlock({ name: "" });
      Swal.fire("Success", "Block created", "success");
      fetchAllData();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.detail || "Failed to create block",
        "error"
      );
    }
  };

  const createSection = async () => {
    if (!newSection.name.trim() || !newSection.block) {
      Swal.fire("Validation", "Section name and block are required", "warning");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8000/farmers/sections/",
        newSection,
        axiosConfig
      );
      setNewSection({ name: "", block: "" });
      Swal.fire("Success", "Section created", "success");
      fetchAllData();
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.detail || "Failed to create section",
        "error"
      );
    }
  };

  return (
    <div className="container my-4">
      <div className="row">
        {/* Locations */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Locations</h5>
            </div>
            <div className="card-body">
              <ul className="list-group mb-3">
                {locations.map((l) => (
                  <li key={l.id} className="list-group-item">
                    {l.name} {l.gps_coordinates && `(${l.gps_coordinates})`}
                  </li>
                ))}
              </ul>
              {isAdminOrSecretary && (
                <>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="New Location Name"
                    value={newLocation.name}
                    onChange={(e) => setNewLocation({ name: e.target.value })}
                  />
                  <button className="btn btn-info w-100" onClick={createLocation}>
                    Add Location
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Blocks */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Blocks</h5>
            </div>
            <div className="card-body">
              <ul className="list-group mb-3">
                {blocks.map((b) => (
                  <li key={b.id} className="list-group-item">
                    {b.name}
                  </li>
                ))}
              </ul>
              {isAdminOrSecretary && (
                <>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Block Name"
                    value={newBlock.name}
                    onChange={(e) => setNewBlock({ name: e.target.value })}
                  />
                  <button className="btn btn-success w-100" onClick={createBlock}>
                    Add Block
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Sections</h5>
            </div>
            <div className="card-body">
              <ul className="list-group mb-3">
                {sections.map((s) => (
                  <li key={s.id} className="list-group-item">
                    {s.name}{" "}
                    <small className="text-muted">
                      ({blocks.find((b) => b.id === s.block)?.name || "No block"})
                    </small>
                  </li>
                ))}
              </ul>
              {isAdminOrSecretary && (
                <>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Section Name"
                    value={newSection.name}
                    onChange={(e) =>
                      setNewSection({ ...newSection, name: e.target.value })
                    }
                  />
                  <select
                    className="form-select mb-2"
                    value={newSection.block}
                    onChange={(e) =>
                      setNewSection({ ...newSection, block: e.target.value })
                    }
                  >
                    <option value="">Select Block</option>
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-primary w-100" onClick={createSection}>
                    Add Section
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
