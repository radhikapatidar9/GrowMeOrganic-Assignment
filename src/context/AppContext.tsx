import { createContext, useState } from "react";
import type { ReactNode } from "react";
import { baseUrl } from "../baseUrl.ts";

/** API response types */
interface Pagination {
  total: number;
  total_page: number;
  current_page: number;
}

interface ApiResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface TableRow {
  id: number;
  title?: string;
  place_of_origin?: string;
  artist_display?: string;
  inscriptions?: string;
  date_start?: string;
  date_end?: string;
}

// Context shape 
interface AppContextType {
  pageData: TableRow[];
  setPageData: React.Dispatch<React.SetStateAction<TableRow[]>>;

  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;

  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;

  totalPage: number | null;
  total: number | null;

  setTotal: React.Dispatch<React.SetStateAction<number | null>>;
  setTotalPage: React.Dispatch<React.SetStateAction<number | null>>;
  fetchPageData: (page?: number) => Promise<void>;
  handlerPageChange: (page: number) => void;
}

export const AppContext = createContext<AppContextType>(
  {} as AppContextType
);

// tags/components inside appContextProvider in App Component - children
interface Props {
  children: ReactNode;
}

function AppContextProvider({ children }: Props) {

  const [loading, setLoading] = useState<boolean>(false);
  const [pageData, setPageData] = useState<TableRow[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  // data filling
  async function fetchPageData(page: number = 1): Promise<void> {
    setLoading(true);

    try {
      const url = `${baseUrl}?page=${page}`;
      const result = await fetch(url);
      const finalData: ApiResponse<TableRow> = await result.json();
      console.log(finalData);

      const pagination = finalData.pagination;

      setPageData(finalData.data);
      setTotal(pagination.total);
      setTotalPage(pagination.total_page);
      setPage(pagination.current_page);
    } catch (error) {

      console.log("error in fetching data", error);
      setPage(1);
      setPageData([]);
      setTotalPage(null);
    }

    setLoading(false);
  }

  function handlerPageChange(page: number): void {
    setPage(page);
    fetchPageData(page);
  }

  const value: AppContextType = {
    pageData,
    setPageData,
    loading,
    setLoading,
    page,
    setPage,
    totalPage,
    total,
    setTotal,
    setTotalPage,
    fetchPageData,
    handlerPageChange
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export default AppContextProvider;
