import {
  useEffect,
  useState,
} from "react";

export default function useFetch(fetchFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const execute = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetchFunction();

      setData(response);
    } catch (err) {
      setError(
        err.message || "Failed to load data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: execute,
  };
}