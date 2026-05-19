type IOptions = {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

type IPaginationSortingResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
};

const paginationSortingHelper = (
  options: IOptions,
): IPaginationSortingResult => {
  const { page, limit, sortBy, sortOrder } = options;

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  const sortByParam = typeof sortBy === "string" ? sortBy : "createdAt";
  const sortOrderParam =
    typeof sortOrder === "string" &&
    ["asc", "desc"].includes(sortOrder.toLowerCase())
      ? (sortOrder.toLowerCase() as "asc" | "desc")
      : "desc";

  return {
    page: pageNum,
    limit: limitNum,
    skip: skip,
    sortBy: sortByParam,
    sortOrder: sortOrderParam,
  };
};

export default paginationSortingHelper;
