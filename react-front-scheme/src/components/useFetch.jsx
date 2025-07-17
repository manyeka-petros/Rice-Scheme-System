// src/hooks/useFetch.js
import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8000/"; // adjust if needed

export default function useFetch(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    axios
      .get(BASE_URL + endpoint)
      .then((res) => {
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        if (isMounted) {
          setData([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [endpoint]);

  return { data, loading };
}
