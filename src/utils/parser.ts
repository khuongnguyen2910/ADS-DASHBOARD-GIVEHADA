import * as XLSX from "xlsx";
import { CampaignData, AccountType } from "../types";

// Business rules for Manager and Segment assignment
export function assignManagerAndSegment(name: string, account: AccountType): { manager: "Khương" | "Đông" | "Nam" | "Lương" | "Vy"; segment: "B2B" | "B2C" } {
  let segment: "B2B" | "B2C" = "B2C";
  const nameUpper = name.toUpperCase();

  // Rule 2: Segment B2B / B2C
  // - Toàn bộ tài khoản TKQC-02 Ecom luôn là B2C
  // - Toàn bộ tài khoản TKQC-04 BD luôn là B2B
  // - Tên chứa "Camud" thì là B2C
  // - Tên chứa "B2B", "Lead", "Form", "SPA", hoặc "LAL" thì là B2B
  // - Còn lại là B2C
  if (account === "TKQC-02 Ecom") {
    segment = "B2C";
  } else if (account === "TKQC-04 BD") {
    segment = "B2B";
  } else if (nameUpper.includes("CAMUD")) {
    segment = "B2C";
  } else if (
    nameUpper.includes("B2B") ||
    nameUpper.includes("LEAD") ||
    nameUpper.includes("FORM") ||
    nameUpper.includes("SPA") ||
    nameUpper.includes("LAL")
  ) {
    segment = "B2B";
  } else {
    segment = "B2C";
  }

  // Rule 1: Manager (Người chạy)
  // - Riêng mọi chiến dịch thuộc tài khoản TKQC-04 BD luôn gán cho Nam
  // - Tên chứa "Đông" hoặc "dong" thì người chạy là Đông
  // - Tên chứa "Nam" thì người chạy là Nam
  // - Tên chứa "Lương" hoặc "luong" thì là Lương
  // - Tên chứa "Vy" thì là Vy
  // - Còn lại (không khớp tên ai) gán mặc định cho Khương
  let manager: "Khương" | "Đông" | "Nam" | "Lương" | "Vy" = "Khương";
  if (account === "TKQC-04 BD") {
    manager = "Nam";
  } else {
    const nameLower = name.toLowerCase();
    const hasDong = nameLower.includes("đông") || nameLower.includes("dong");
    const hasNam = nameLower.includes("nam");
    const hasLuong = nameLower.includes("lương") || nameLower.includes("luong");
    const hasVy = nameLower.includes("vy");

    if (hasDong) {
      manager = "Đông";
    } else if (hasNam) {
      manager = "Nam";
    } else if (hasLuong) {
      manager = "Lương";
    } else if (hasVy) {
      manager = "Vy";
    } else {
      manager = "Khương";
    }
  }

  return { manager, segment };
}

// Case-insensitive column matcher
function findHeaderKey(rowKeys: string[], targets: string[]): string | undefined {
  const normalizedKeys = rowKeys.map(k => k.trim().toLowerCase());
  for (const target of targets) {
    const targetLower = target.toLowerCase();
    // Try exact match
    let idx = normalizedKeys.findIndex(k => k === targetLower);
    if (idx !== -1) return rowKeys[idx];

    // Try substring/includes match
    idx = normalizedKeys.findIndex(k => k.includes(targetLower));
    if (idx !== -1) return rowKeys[idx];
  }
  return undefined;
}

export interface ParseResult {
  campaigns: CampaignData[];
  sheets: string[];
}

export async function parseAdFile(
  file: File,
  account: AccountType,
  sheetName?: string
): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheets = workbook.SheetNames;
        
        if (sheets.length === 0) {
          reject(new Error("File Excel không có sheet nào."));
          return;
        }

        const targetSheetName = sheetName || sheets[0];
        const worksheet = workbook.Sheets[targetSheetName];
        if (!worksheet) {
          reject(new Error(`Không tìm thấy sheet "${targetSheetName}" trong file.`));
          return;
        }

        // Parse to array of objects
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: "" });
        
        if (rawJson.length === 0) {
          reject(new Error("Không có dữ liệu trong sheet được chọn."));
          return;
        }

        // Get headers from first row keys
        const firstRowKeys = Object.keys(rawJson[0]);

        // Map required columns
        // 1. Campaign Name
        const nameKey = findHeaderKey(firstRowKeys, ["tên chiến dịch", "campaign name", "campaign_name", "campaign"]);
        // 2. Amount Spent
        const spentKey = findHeaderKey(firstRowKeys, [
          "số tiền đã chi tiêu", 
          "amount spent", 
          "amount_spent", 
          "spend", 
          "spent", 
          "chi tiêu", 
          "chi phí"
        ]);

        if (!nameKey || !spentKey) {
          let missing = [];
          if (!nameKey) missing.push("Tên chiến dịch (Campaign Name)");
          if (!spentKey) missing.push("Số tiền đã chi tiêu (Amount Spent)");
          reject(new Error(`Thiếu cột bắt buộc trong file: ${missing.join(", ")}. Vui lòng kiểm tra lại file của bạn.`));
          return;
        }

        // Optional columns mapping
        const resultsKey = findHeaderKey(firstRowKeys, ["kết quả", "results", "result"]);
        const impressionsKey = findHeaderKey(firstRowKeys, ["lượt hiển thị", "impressions", "impression", "hiển thị"]);
        const reachKey = findHeaderKey(firstRowKeys, ["người tiếp cận", "reach", "tiếp cận"]);
        const clicksKey = findHeaderKey(firstRowKeys, ["click", "nhấp", "nhấp chuột", "nhấp vào liên kết", "clicks"]);
        const resultIndicatorKey = findHeaderKey(firstRowKeys, ["chỉ báo kết quả", "result indicator", "result_indicator", "loại kết quả"]);
        const budgetKey = findHeaderKey(firstRowKeys, ["ngân sách", "budget"]);
        const budgetTypeKey = findHeaderKey(firstRowKeys, ["loại ngân sách", "budget type", "budget_type"]);
        const cpaKey = findHeaderKey(firstRowKeys, ["chi phí trên mỗi kết quả", "cost per result", "cost_per_result", "cpa"]);

        const campaigns: CampaignData[] = [];

        rawJson.forEach((row, index) => {
          const campaignName = String(row[nameKey] || "").trim();
          
          // Ignore empty names or summary rows
          if (!campaignName) return;
          if (
            campaignName.toLowerCase().includes("tổng") || 
            campaignName.toLowerCase().includes("total") ||
            campaignName.toLowerCase() === "tổng cộng"
          ) {
            return; // Skip summary rows
          }

          const rawSpent = row[spentKey];
          const spentNum = parseFloat(String(rawSpent).replace(/[^\d.-]/g, "")) || 0;

          // Extra details
          const resultsNum = resultsKey ? (parseInt(String(row[resultsKey]).replace(/[^\d]/g, "")) || 0) : 0;
          const impressionsNum = impressionsKey ? (parseInt(String(row[impressionsKey]).replace(/[^\d]/g, "")) || 0) : 0;
          const reachNum = reachKey ? (parseInt(String(row[reachKey]).replace(/[^\d]/g, "")) || 0) : 0;
          const clicksNum = clicksKey ? (parseInt(String(row[clicksKey]).replace(/[^\d]/g, "")) || 0) : 0;
          
          const resultIndicator = resultIndicatorKey ? String(row[resultIndicatorKey] || "").trim() : "Lượt chuyển đổi";
          const budgetNum = budgetKey ? (parseFloat(String(row[budgetKey]).replace(/[^\d.-]/g, "")) || 0) : 0;
          const budgetType = budgetTypeKey ? String(row[budgetTypeKey] || "").trim() : "Hàng ngày";
          const cpaNum = cpaKey ? (parseFloat(String(row[cpaKey]).replace(/[^\d.-]/g, "")) || 0) : 0;

          const { manager, segment } = assignManagerAndSegment(campaignName, account);

          // Calculate fallback values if not present
          const finalCPA = cpaNum || (resultsNum > 0 ? Math.round(spentNum / resultsNum) : 0);

          campaigns.push({
            id: `${account.replace(/\s+/g, "_")}-${index}-${Date.now()}`,
            name: campaignName,
            spent: spentNum,
            results: resultsNum,
            impressions: impressionsNum,
            reach: reachNum,
            clicks: clicksNum,
            resultIndicator: resultIndicator || (segment === "B2B" ? "Lượt đăng ký trên Form" : "Lượt xem trang đích"),
            budget: budgetNum,
            budgetType: budgetType,
            cpa: finalCPA,
            account,
            manager,
            segment,
            rawRow: row as Record<string, string | number>
          });
        });

        resolve({
          campaigns,
          sheets
        });
      } catch (err: any) {
        reject(new Error(`Có lỗi xảy ra khi đọc file: ${err?.message || "Lỗi định dạng file"}`));
      }
    };
    reader.onerror = () => reject(new Error("Lỗi khi đọc file bằng FileReader."));
    reader.readAsArrayBuffer(file);
  });
}
