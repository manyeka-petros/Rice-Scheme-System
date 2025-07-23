import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../components/AuthContext";

export default function UserManagement() {
  const { authToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [formStates, setFormStates] = useState({});
  const [userSections, setUserSections] = useState({}); // Store sections per user

  // Load users and blocks
  useEffect(() => {
    if (!authToken) return;

    axios
      .get("https://rice-scheme-system-1.onrender.com/accounts/users/", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => {
        setUsers(res.data);
        const initialStates = {};
        res.data.forEach((user) => {
          initialStates[user.id] = {
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            role: user.role || "",
            is_approved: user.is_approved || false,
            block: user.block || "",
            section: user.section || "",
          };
        });
        setFormStates(initialStates);
      });

    axios
      .get("https://rice-scheme-system-1.onrender.com/farmers/blocks/", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((res) => setBlocks(res.data));
  }, [authToken]);

  const fetchSectionsForUser = async (userId, blockId) => {
    if (!blockId) return;
    try {
      const res = await axios.get(`https://rice-scheme-system-1.onrender.com/accounts/filtered-sections/?block_id=${blockId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setUserSections((prev) => ({ ...prev, [userId]: res.data }));
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    }
  };

  const handleChange = (userId, field, value) => {
    setFormStates((prev) => {
      const updated = {
        ...prev[userId],
        [field]: value,
      };

      // If block changes, reset section and fetch new sections
      if (field === "block") {
        updated.section = "";
        fetchSectionsForUser(userId, value);
      }

      return {
        ...prev,
        [userId]: updated,
      };
    });
  };

  const handleSubmit = (userId) => {
    const data = formStates[userId];

    axios
      .patch(`https://rice-scheme-system-1.onrender.com/accounts/users/${userId}/`, data, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: `${res.data.username} updated successfully!`,
          timer: 2500,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Update failed. Please check the inputs or try again.",
        });
        console.error(err);
      });
  };

  return (
    <div>
      <h2>Admin: Manage Users</h2>

      {users.map((user) => {
        const form = formStates[user.id] || {};
        const sections = userSections[user.id] || [];

        return (
          <div
            key={user.id}
            style={{
              border: "1px solid #ccc",
              padding: 15,
              marginBottom: 10,
              borderRadius: 6,
            }}
          >
            <h4>
              {user.username} ({user.role})
            </h4>

            <label>
              First Name:
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => handleChange(user.id, "first_name", e.target.value)}
              />
            </label>
            <br />

            <label>
              Last Name:
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => handleChange(user.id, "last_name", e.target.value)}
              />
            </label>
            <br />

            <label>
              Role:
              <select
                value={form.role}
                onChange={(e) => handleChange(user.id, "role", e.target.value)}
              >
                <option value="">-- Select Role --</option>
                <option value="farmer">Farmer</option>
                <option value="block_chair">Block Chair</option>
                <option value="president">President</option>
                <option value="treasurer">Treasurer</option>
                <option value="secretary">Secretary</option>
              </select>
            </label>
            <br />

            {form.role === "block_chair" && (
              <>
                <label>
                  Block:
                  <select
                    value={form.block}
                    onChange={(e) => handleChange(user.id, "block", e.target.value)}
                  >
                    <option value="">-- Select Block --</option>
                    {blocks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <br />

                <label>
                  Section:
                  <select
                    value={form.section}
                    onChange={(e) => handleChange(user.id, "section", e.target.value)}
                  >
                    <option value="">-- Select Section --</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <br />
              </>
            )}

            <label>
              Approved:
              <input
                type="checkbox"
                checked={form.is_approved}
                onChange={(e) => handleChange(user.id, "is_approved", e.target.checked)}
              />
            </label>
            <br />

            <button onClick={() => handleSubmit(user.id)}>Update</button>
          </div>
        );
      })}
    </div>
  );
}
