import { useQuery } from "@tanstack/react-query";
import { commercialApi } from "../services/commercialApi";

export interface InquiryStats {
  total: number;
  pending: number;
  read: number;
}

export const useInquiryStats = (token: string | null) =>
  useQuery<InquiryStats>({
    queryKey: ["inquiryStats"],
    enabled: !!token,
    queryFn: () => {
      if (!token) throw new Error("No autenticado");
      return commercialApi.getInquiryStats(token);
    },
  });
