export type PageRequest = {
  page_number: string;
  rows_per_page: string;
};

export type PageParams = {
  page_number: boolean;
  rows_per_page: boolean;
};

export type PageContext = {
  total_rows: number;
  page_number: number;
  rows_per_page: number;
  rows_in_data: number;
};
