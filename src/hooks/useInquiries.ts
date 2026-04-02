import { useQuery } from "@tanstack/react-query";
import { commercialApi } from "../services/commercialApi";
import type { Inquiry } from "../types/commercial";
import type { Pagination } from "../types/commercial";

export const useInquiries = (token: string | null, page: number, limit: number, status?: "pending" | "read") =>
  useQuery<{ data: Inquiry[]; meta: Pagination }>({
    queryKey: ["inquiries", { page, limit, status }],
    enabled: !!token,
    queryFn: () => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.listInquiries(token, { page, limit, status });
    },
  });
