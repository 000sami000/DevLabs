import React from "react";
import ReactPaginate from "react-paginate";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function AppPagination({
  pageCount = 1,
  currentPage = 0,
  onPageChange,
  className = "",
  showWhenSingle = false,
}) {
  const safePageCount = Math.max(Number(pageCount) || 1, 1);

  if (!showWhenSingle && safePageCount <= 1) {
    return null;
  }

  return (
    <ReactPaginate
      forcePage={Math.min(Math.max(currentPage, 0), safePageCount - 1)}
      breakLabel="..."
      nextLabel={<FiChevronRight />}
      previousLabel={<FiChevronLeft />}
      onPageChange={onPageChange}
      pageRangeDisplayed={3}
      marginPagesDisplayed={1}
      pageCount={safePageCount}
      className={`app-paginate ${className}`.trim()}
      pageLinkClassName="app-page-btn"
      activeLinkClassName="app-page-btn"
      activeClassName="app-page-active"
      previousLinkClassName="app-page-btn"
      nextLinkClassName="app-page-btn"
      disabledClassName="app-page-disabled"
      breakClassName="app-page-break"
      breakLinkClassName="app-page-btn"
    />
  );
}

export default AppPagination;
