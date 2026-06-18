import { PageContext } from "@/src/app/api/lib/types/pagination";

export class Pagination {
  private page_number: number;
  private rows_per_page: number;

  constructor(page_number: string, rows_per_page: string) {
    this.page_number = parseInt(page_number);
    this.rows_per_page = parseInt(rows_per_page);
  }

  getOffsetStart() {
    return (this.page_number - 1) * this.rows_per_page;
  }

  getOffsetEnd() {
    return (this.page_number - 1) * this.rows_per_page + this.rows_per_page - 1;
  }

  getRowsPerPage() {
    return this.rows_per_page;
  }

  getPageNumber() {
    return this.page_number;
  }

  getPageContext(dataLength: number, totalRows: number) {
    return {
      total_rows: totalRows,
      page_number: this.page_number,
      rows_per_page: this.rows_per_page,
      rows_in_data: dataLength,
    };
  }
}
