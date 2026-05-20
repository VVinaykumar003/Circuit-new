import { useState } from "react";

 export function usePagination<T>(
  data: T[],
  pageSize: number
) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = data.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return {
    page,
    setPage,
    totalPages,
    paginatedData,
  };
}
