import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RegionSelect({ blockId, sectionId, locationId, onChange }) {
  const [blocks, setBlocks] = useState([]);
  const [sections, setSections] = useState([]);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchBlocks();
    fetchSections();
    fetchLocations();
  }, []);

  const fetchBlocks = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/blocks/");
      setBlocks(res.data);
    } catch (err) {
      console.error("Failed to fetch blocks", err);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/sections/");
      setSections(res.data);
    } catch (err) {
      console.error("Failed to fetch sections", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/locations/");
      setLocations(res.data);
    } catch (err) {
      console.error("Failed to fetch locations", err);
    }
  };

  return (
    <div className="region-select grid gap-2 sm:grid-cols-3">
      <select
        name="block_id"
        value={blockId || ""}
        onChange={(e) => onChange("block_id", e.target.value)}
        required
      >
        <option value="">Select Block</option>
        {blocks.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>

      <select
        name="section_id"
        value={sectionId || ""}
        onChange={(e) => onChange("section_id", e.target.value)}
        required
      >
        <option value="">Select Section</option>
        {sections.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        name="location_id"
        value={locationId || ""}
        onChange={(e) => onChange("location_id", e.target.value)}
      >
        <option value="">Select Location</option>
        {locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
    </div>
  );
}
