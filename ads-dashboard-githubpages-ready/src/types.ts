export interface CampaignData {
  id: string;
  name: string;
  spent: number;
  results: number;
  impressions: number;
  reach: number;
  clicks: number;
  resultIndicator: string;
  budget: number;
  budgetType: string;
  cpa: number;
  account: "TKQC chính" | "TKQC-02 Ecom" | "TKQC-04 BD";
  manager: "Khương" | "Đông" | "Nam" | "Lương" | "Vy";
  segment: "B2B" | "B2C";
  rawRow?: Record<string, string | number>;
}

export interface UploadedFileMeta {
  id: string;
  fileName: string;
  account: "TKQC chính" | "TKQC-02 Ecom" | "TKQC-04 BD";
  campaignCount: number;
  totalSpent: number;
  campaignNames: string[];
}

export type AccountType = "TKQC chính" | "TKQC-02 Ecom" | "TKQC-04 BD";
export type ManagerType = "Khương" | "Đông" | "Nam" | "Lương" | "Vy";
export type SegmentType = "B2B" | "B2C";
