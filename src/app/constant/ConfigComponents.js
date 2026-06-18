import dayjs from "dayjs";

export const Table = {
  pageSizeOptions: [5, 10, 25, 100],
  pageContext: {
    page: 0,
    pageSize: 25,
  },
};

export const DatePicker = {
  minYear: 2022,
  minDate: new Date("1 Jan 2022"),
  maxDate: new Date(dayjs().add(2, "year")?.format("DD MMM YYYY")),
};
