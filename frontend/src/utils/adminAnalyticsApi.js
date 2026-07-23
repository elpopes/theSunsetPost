import { baseURL } from "../config";

export const buildQuery = (values) => {
  const query = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
};

export const adminRequest = async (path, token, options = {}) => {
  const response = await fetch(`${baseURL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const body =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body?.errors?.join(", ") ||
      body?.error ||
      `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return body;
};

const csvCell = (value) => {
  const serialized = Array.isArray(value) ? value.join("; ") : (value ?? "");
  return `"${String(serialized).replaceAll('"', '""')}"`;
};

export const downloadCsv = (filename, rows, columns) => {
  const header = columns.map((column) => csvCell(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => csvCell(row[column.key])).join(","),
  );
  const blob = new Blob([[header, ...body].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
