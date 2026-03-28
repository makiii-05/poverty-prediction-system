const BASE_URL = "/api/data";

// -----------------------------
// GET ALL DATA
// -----------------------------
export const getAllData = async () => {
  const res = await fetch(BASE_URL);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch data");
  }

  return data;
};

// -----------------------------
// GET BY ID
// -----------------------------
export const getDataById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch data by ID");
  }

  return data;
};

// -----------------------------
// GET BY REGION
// -----------------------------
export const getByRegion = async (region) => {
  const res = await fetch(`${BASE_URL}/region/${region}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch region data");
  }

  return data;
};

// -----------------------------
// GET BY YEAR
// -----------------------------
export const getByYear = async (year) => {
  const res = await fetch(`${BASE_URL}/year/${year}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch year data");
  }

  return data;
};

// -----------------------------
// FILTER (region + year)
// -----------------------------
export const filterData = async ({ region, year }) => {
  const query = new URLSearchParams();

  if (region) query.append("region", region);
  if (year) query.append("year", year);

  const res = await fetch(`${BASE_URL}/filter/search?${query.toString()}`);

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to filter data");
  }

  return data;
};

// -----------------------------
// CREATE DATA
// -----------------------------
export const createData = async (payload) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to create data");
  }

  return data;
};

// -----------------------------
// DELETE DATA
// -----------------------------
export const deleteData = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to delete data");
  }

  return data;
};