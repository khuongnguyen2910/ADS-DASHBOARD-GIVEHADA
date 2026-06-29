import React, { useState } from "react";
import { CampaignData } from "../types";
import { ArrowUpDown, Info } from "lucide-react";

interface ReportTablesProps {
  filteredData: CampaignData[];
  allLoadedData: CampaignData[];
}

type SortField = "spent" | "results" | "reach" | "impressions" | "cpc" | "cpm" | "cpa";
type SortOrder = "asc" | "desc";

export const ReportTables: React.FC<ReportTablesProps> = ({
  filteredData,
  allLoadedData
}) => {
  // Tabs state
  const [activeTab, setActiveTab] = useState<"summary" | "segments" | "runners" | "all" | "raw">("summary");
  
  // Segment subtab state
  const [segmentSubTab, setSegmentSubTab] = useState<"B2B" | "B2C">("B2B");
  
  // Runner subtab state
  const [runnerSubTab, setRunnerSubTab] = useState<"Khương" | "Đông" | "Nam" | "Lương" | "Vy">("Khương");
  
  // Raw subtab state
  const [rawSubTab, setRawSubTab] = useState<"TKQC chính" | "TKQC-02 Ecom" | "TKQC-04 BD">("TKQC chính");

  // Sorting state for detail lists
  const [sortField, setSortField] = useState<SortField>("spent");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const formatVND = (num: number) => {
    return `${Math.round(num).toLocaleString("vi-VN")}đ`;
  };

  const formatNum = (num: number) => {
    return Math.round(num).toLocaleString("vi-VN");
  };

  // Safe division helpers
  const calcCPM = (spent: number, impressions: number) => {
    return impressions > 0 ? (spent / impressions) * 1000 : 0;
  };

  const calcCPC = (spent: number, clicks: number) => {
    return clicks > 0 ? spent / clicks : 0;
  };

  const calcCPA = (spent: number, results: number) => {
    return results > 0 ? spent / results : 0;
  };

  // Sorting Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Sort Array helper
  const sortData = (data: CampaignData[]) => {
    return [...data].sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortField === "cpc") {
        valA = calcCPC(a.spent, a.clicks);
        valB = calcCPC(b.spent, b.clicks);
      } else if (sortField === "cpm") {
        valA = calcCPM(a.spent, a.impressions);
        valB = calcCPM(b.spent, b.impressions);
      } else if (sortField === "cpa") {
        valA = calcCPA(a.spent, a.results);
        valB = calcCPA(b.spent, b.results);
      } else {
        valA = a[sortField] || 0;
        valB = b[sortField] || 0;
      }

      if (sortOrder === "asc") {
        return valA - valB;
      } else {
        return valB - valA;
      }
    });
  };

  // --- TAB 1: SUMMARY DATA PREPARATION ---

  // A. Summary by Account
  const accounts: ("TKQC chính" | "TKQC-02 Ecom" | "TKQC-04 BD")[] = ["TKQC chính", "TKQC-02 Ecom", "TKQC-04 BD"];
  const accountRows = accounts.map(acc => {
    const campaigns = filteredData.filter(c => c.account === acc);
    const count = campaigns.length;
    const spent = campaigns.reduce((s, c) => s + c.spent, 0);
    const reach = campaigns.reduce((s, c) => s + c.reach, 0);
    const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const results = campaigns.reduce((s, c) => s + c.results, 0);
    return {
      name: acc,
      count,
      spent,
      reach,
      impressions,
      clicks,
      results,
      cpc: calcCPC(spent, clicks),
      cpm: calcCPM(spent, impressions),
      cpa: calcCPA(spent, results)
    };
  });

  const accountTotal = {
    count: filteredData.length,
    spent: filteredData.reduce((s, c) => s + c.spent, 0),
    reach: filteredData.reduce((s, c) => s + c.reach, 0),
    impressions: filteredData.reduce((s, c) => s + c.impressions, 0),
    clicks: filteredData.reduce((s, c) => s + c.clicks, 0),
    results: filteredData.reduce((s, c) => s + c.results, 0)
  };

  // B. Summary by Segment
  const segments: ("B2B" | "B2C")[] = ["B2B", "B2C"];
  const segmentRows = segments.map(seg => {
    const campaigns = filteredData.filter(c => c.segment === seg);
    const count = campaigns.length;
    const spent = campaigns.reduce((s, c) => s + c.spent, 0);
    const reach = campaigns.reduce((s, c) => s + c.reach, 0);
    const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const results = campaigns.reduce((s, c) => s + c.results, 0);
    return {
      name: seg,
      count,
      spent,
      reach,
      impressions,
      clicks,
      results,
      cpc: calcCPC(spent, clicks),
      cpm: calcCPM(spent, impressions),
      cpa: calcCPA(spent, results)
    };
  });

  // C. Summary by Manager
  const managers: ("Khương" | "Đông" | "Nam" | "Lương" | "Vy")[] = ["Khương", "Đông", "Nam", "Lương", "Vy"];
  const managerRows = managers.map(mgr => {
    const campaigns = filteredData.filter(c => c.manager === mgr);
    const count = campaigns.length;
    const spent = campaigns.reduce((s, c) => s + c.spent, 0);
    const reach = campaigns.reduce((s, c) => s + c.reach, 0);
    const impressions = campaigns.reduce((s, c) => s + c.impressions, 0);
    const clicks = campaigns.reduce((s, c) => s + c.clicks, 0);
    const results = campaigns.reduce((s, c) => s + c.results, 0);
    return {
      name: mgr,
      count,
      spent,
      reach,
      impressions,
      clicks,
      results,
      cpc: calcCPC(spent, clicks),
      cpm: calcCPM(spent, impressions),
      cpa: calcCPA(spent, results)
    };
  });

  // Sort arrow renderer
  const renderSortArrow = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-stone-300 inline ml-1" />;
    return sortOrder === "asc" ? (
      <span className="text-[#B89047] font-semibold text-xs ml-1">▲</span>
    ) : (
      <span className="text-[#B89047] font-semibold text-xs ml-1">▼</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-stone-200 overflow-x-auto bg-stone-100/50 p-1 rounded gap-1">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap rounded ${
            activeTab === "summary"
              ? "bg-[#111E38] text-stone-100 font-semibold"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
          }`}
        >
          Báo Cáo Tổng Hợp
        </button>
        <button
          onClick={() => setActiveTab("segments")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap rounded ${
            activeTab === "segments"
              ? "bg-[#111E38] text-stone-100 font-semibold"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
          }`}
        >
          Phân Khúc Chi Tiết
        </button>
        <button
          onClick={() => setActiveTab("runners")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap rounded ${
            activeTab === "runners"
              ? "bg-[#111E38] text-stone-100 font-semibold"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
          }`}
        >
          Theo Người Chạy
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap rounded ${
            activeTab === "all"
              ? "bg-[#111E38] text-stone-100 font-semibold"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
          }`}
        >
          Toàn Bộ Chiến Dịch
        </button>
        <button
          onClick={() => setActiveTab("raw")}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap rounded ${
            activeTab === "raw"
              ? "bg-[#111E38] text-stone-100 font-semibold"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
          }`}
        >
          Dữ Liệu Gốc (Raw)
        </button>
      </div>

      {/* --- TAB 1: SUMMARY TAB --- */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {/* Table A: Account Summary */}
          <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
            <h4 className="font-serif text-sm text-[#111E38] font-bold tracking-tight mb-3 uppercase font-mono">
              1. Tổng Hợp Theo Tài Khoản Quảng Cáo
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111E38] text-stone-100 font-mono text-[10px] tracking-wider uppercase">
                    <th className="p-2.5">Tài Khoản</th>
                    <th className="p-2.5 text-center">Số Chiến Dịch</th>
                    <th className="p-2.5 text-right">Chi Phí (VND)</th>
                    <th className="p-2.5 text-right">Tiếp Cận</th>
                    <th className="p-2.5 text-right">Lượt Hiển Thị</th>
                    <th className="p-2.5 text-right">Lượt Kết Quả</th>
                    <th className="p-2.5 text-right">CPC Trung Bình</th>
                    <th className="p-2.5 text-right">CPM Trung Bình</th>
                    <th className="p-2.5 text-right">CPA Trung Bình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {accountRows.map(row => (
                    <tr key={row.name} className="hover:bg-stone-100/50">
                      <td className="p-2.5 font-medium text-stone-800">{row.name}</td>
                      <td className="p-2.5 text-center font-mono">{row.count}</td>
                      <td className="p-2.5 text-right font-mono">{formatVND(row.spent)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.reach)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.impressions)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.results)}</td>
                      <td className="p-2.5 text-right font-mono text-stone-500">{row.spent > 0 && row.clicks > 0 ? formatVND(row.cpc) : "-"}</td>
                      <td className="p-2.5 text-right font-mono text-stone-500">{row.spent > 0 && row.impressions > 0 ? formatVND(row.cpm) : "-"}</td>
                      <td className="p-2.5 text-right font-mono text-stone-600 font-semibold">{row.spent > 0 && row.results > 0 ? formatVND(row.cpa) : "-"}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-stone-100 font-semibold border-t-2 border-stone-300">
                    <td className="p-2.5 text-[#111E38] font-bold">TỔNG CỘNG</td>
                    <td className="p-2.5 text-center font-mono">{accountTotal.count}</td>
                    <td className="p-2.5 text-right font-mono">{formatVND(accountTotal.spent)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNum(accountTotal.reach)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNum(accountTotal.impressions)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNum(accountTotal.results)}</td>
                    <td className="p-2.5 text-right font-mono">{formatVND(calcCPC(accountTotal.spent, accountTotal.clicks))}</td>
                    <td className="p-2.5 text-right font-mono">{formatVND(calcCPM(accountTotal.spent, accountTotal.impressions))}</td>
                    <td className="p-2.5 text-right font-mono text-[#111E38] font-bold">{formatVND(calcCPA(accountTotal.spent, accountTotal.results))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table B: Segment Summary */}
          <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
            <h4 className="font-serif text-sm text-[#111E38] font-bold tracking-tight mb-3 uppercase font-mono">
              2. Tổng Hợp Theo Phân Khúc Sản Phẩm
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111E38] text-stone-100 font-mono text-[10px] tracking-wider uppercase">
                    <th className="p-2.5">Phân Khúc</th>
                    <th className="p-2.5 text-center">Số Chiến Dịch</th>
                    <th className="p-2.5 text-right">Chi Phí (VND)</th>
                    <th className="p-2.5 text-right">Tiếp Cận</th>
                    <th className="p-2.5 text-right">Lượt Hiển Thị</th>
                    <th className="p-2.5 text-right">Lượt Kết Quả</th>
                    <th className="p-2.5 text-right">CPC Trung Bình</th>
                    <th className="p-2.5 text-right">CPM Trung Bình</th>
                    <th className="p-2.5 text-right">CPA Trung Bình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {segmentRows.map(row => (
                    <tr key={row.name} className="hover:bg-stone-100/50">
                      <td className="p-2.5 font-medium text-stone-800">
                        {row.name} 
                        <span className="text-[10px] text-stone-400 font-normal ml-1">
                          ({row.name === "B2B" ? "Lead/Form/Conv" : "Landing View"})
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-mono">{row.count}</td>
                      <td className="p-2.5 text-right font-mono">{formatVND(row.spent)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.reach)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.impressions)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.results)}</td>
                      <td className="p-2.5 text-right font-mono text-stone-500">{row.spent > 0 && row.clicks > 0 ? formatVND(row.cpc) : "-"}</td>
                      <td className="p-2.5 text-right font-mono text-stone-500">{row.spent > 0 && row.impressions > 0 ? formatVND(row.cpm) : "-"}</td>
                      <td className="p-2.5 text-right font-mono text-stone-600 font-semibold">{row.spent > 0 && row.results > 0 ? formatVND(row.cpa) : "-"}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-stone-100 font-semibold border-t-2 border-stone-300">
                    <td className="p-2.5 text-[#111E38] font-bold">TỔNG CỘNG</td>
                    <td className="p-2.5 text-center font-mono">{accountTotal.count}</td>
                    <td className="p-2.5 text-right font-mono">{formatVND(accountTotal.spent)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNum(accountTotal.reach)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNum(accountTotal.impressions)}</td>
                    <td className="p-2.5 text-right font-mono">
                      {formatNum(accountTotal.results)}
                      <span className="text-[9px] text-stone-400 font-normal block">hỗn hợp không cộng gộp trực tiếp</span>
                    </td>
                    <td className="p-2.5 text-right font-mono">{formatVND(calcCPC(accountTotal.spent, accountTotal.clicks))}</td>
                    <td className="p-2.5 text-right font-mono">{formatVND(calcCPM(accountTotal.spent, accountTotal.impressions))}</td>
                    <td className="p-2.5 text-right font-mono text-[#111E38] font-bold">{formatVND(calcCPA(accountTotal.spent, accountTotal.results))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table C: Manager Summary */}
          <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
            <h4 className="font-serif text-sm text-[#111E38] font-bold tracking-tight mb-3 uppercase font-mono">
              3. Tổng Hợp Theo Người Chạy (Nhân Viên)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="bg-[#111E38] text-stone-100 font-mono text-[10px] tracking-wider uppercase">
                    <th className="p-2.5">Nhân Viên</th>
                    <th className="p-2.5 text-center">Số Chiến Dịch</th>
                    <th className="p-2.5 text-right">Chi Phí (VND)</th>
                    <th className="p-2.5 text-right">Tiếp Cận</th>
                    <th className="p-2.5 text-right">Lượt Hiển Thị</th>
                    <th className="p-2.5 text-right">Lượt Kết Quả</th>
                    <th className="p-2.5 text-right">CPC Trung Bình</th>
                    <th className="p-2.5 text-right">CPM Trung Bình</th>
                    <th className="p-2.5 text-right">CPA Trung Bình</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {managerRows.map(row => (
                    <tr key={row.name} className="hover:bg-stone-100/50">
                      <td className="p-2.5 font-medium text-stone-800">{row.name}</td>
                      <td className="p-2.5 text-center font-mono">{row.count}</td>
                      <td className="p-2.5 text-right font-mono">{formatVND(row.spent)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.reach)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.impressions)}</td>
                      <td className="p-2.5 text-right font-mono">{formatNum(row.results)}</td>
                      <td className="p-2.5 text-right font-mono text-stone-500">{row.spent > 0 && row.clicks > 0 ? formatVND(row.cpc) : "-"}</td>
                      <td className="p-2.5 text-right font-mono text-stone-500">{row.spent > 0 && row.impressions > 0 ? formatVND(row.cpm) : "-"}</td>
                      <td className="p-2.5 text-right font-mono text-stone-600 font-semibold">{row.spent > 0 && row.results > 0 ? formatVND(row.cpa) : "-"}</td>
                    </tr>
                  ))}
                  {/* Total row */}
                  <tr className="bg-stone-100 font-semibold border-t-2 border-stone-300">
                    <td className="p-2.5 text-[#111E38] font-bold">TỔNG CỘNG</td>
                    <td className="p-2.5 text-center font-mono">{accountTotal.count}</td>
                    <td className="p-2.5 text-right font-mono">{formatVND(accountTotal.spent)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNum(accountTotal.reach)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNum(accountTotal.impressions)}</td>
                    <td className="p-2.5 text-right font-mono">{formatNum(accountTotal.results)}</td>
                    <td className="p-2.5 text-right font-mono">{formatVND(calcCPC(accountTotal.spent, accountTotal.clicks))}</td>
                    <td className="p-2.5 text-right font-mono">{formatVND(calcCPM(accountTotal.spent, accountTotal.impressions))}</td>
                    <td className="p-2.5 text-right font-mono text-[#111E38] font-bold">{formatVND(calcCPA(accountTotal.spent, accountTotal.results))}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: DETAILED SEGMENT REPORTS --- */}
      {activeTab === "segments" && (
        <div className="bg-stone-50 border border-stone-200/80 rounded p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <h4 className="font-serif text-sm text-[#111E38] font-bold tracking-tight uppercase font-mono">
              Báo Cáo Chi Tiết Theo Phân Khúc (B2B / B2C)
            </h4>
            <div className="flex bg-stone-200/60 p-0.5 rounded border border-stone-300/40 text-xs">
              <button
                onClick={() => setSegmentSubTab("B2B")}
                className={`px-3 py-1.5 rounded font-medium ${
                  segmentSubTab === "B2B" ? "bg-[#111E38] text-stone-100" : "text-stone-600"
                }`}
              >
                Khối B2B (Leads / Conversation)
              </button>
              <button
                onClick={() => setSegmentSubTab("B2C")}
                className={`px-3 py-1.5 rounded font-medium ${
                  segmentSubTab === "B2C" ? "bg-[#B89047] text-stone-100" : "text-stone-600"
                }`}
              >
                Khối B2C (Landing Page View)
              </button>
            </div>
          </div>

          {/* Table display */}
          {(() => {
            const campaigns = filteredData.filter(c => c.segment === segmentSubTab);
            const sortedCampaigns = sortData(campaigns);

            const total = {
              spent: campaigns.reduce((s, c) => s + c.spent, 0),
              reach: campaigns.reduce((s, c) => s + c.reach, 0),
              impressions: campaigns.reduce((s, c) => s + c.impressions, 0),
              clicks: campaigns.reduce((s, c) => s + c.clicks, 0),
              results: campaigns.reduce((s, c) => s + c.results, 0)
            };

            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#111E38] text-stone-100 font-mono text-[10px] tracking-wider uppercase">
                      <th className="p-2.5">Tên Chiến Dịch</th>
                      <th className="p-2.5">Tài Khoản</th>
                      <th className="p-2.5">Người Chạy</th>
                      <th className="p-2.5 text-right cursor-pointer" onClick={() => handleSort("spent")}>
                        Chi Phí {renderSortArrow("spent")}
                      </th>
                      <th className="p-2.5 text-right cursor-pointer" onClick={() => handleSort("reach")}>
                        Tiếp Cận {renderSortArrow("reach")}
                      </th>
                      <th className="p-2.5 text-right cursor-pointer" onClick={() => handleSort("impressions")}>
                        Hiển Thị {renderSortArrow("impressions")}
                      </th>
                      <th className="p-2.5 text-right cursor-pointer" onClick={() => handleSort("results")}>
                        Kết Quả {renderSortArrow("results")}
                      </th>
                      <th className="p-2.5 text-right cursor-pointer" onClick={() => handleSort("cpc")}>
                        CPC {renderSortArrow("cpc")}
                      </th>
                      <th className="p-2.5 text-right cursor-pointer" onClick={() => handleSort("cpm")}>
                        CPM {renderSortArrow("cpm")}
                      </th>
                      <th className="p-2.5 text-right cursor-pointer" onClick={() => handleSort("cpa")}>
                        CPA {renderSortArrow("cpa")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {sortedCampaigns.length > 0 ? (
                      sortedCampaigns.map(c => (
                        <tr key={c.name} className="hover:bg-stone-100/50">
                          <td className="p-2.5 font-medium text-stone-800 break-words max-w-xs">{c.name}</td>
                          <td className="p-2.5 text-stone-500">{c.account}</td>
                          <td className="p-2.5 text-stone-600">{c.manager}</td>
                          <td className="p-2.5 text-right font-mono">{formatVND(c.spent)}</td>
                          <td className="p-2.5 text-right font-mono text-stone-500">{formatNum(c.reach)}</td>
                          <td className="p-2.5 text-right font-mono text-stone-500">{formatNum(c.impressions)}</td>
                          <td className="p-2.5 text-right font-mono">{formatNum(c.results)}</td>
                          <td className="p-2.5 text-right font-mono text-stone-500">{c.spent > 0 && c.clicks > 0 ? formatVND(calcCPC(c.spent, c.clicks)) : "-"}</td>
                          <td className="p-2.5 text-right font-mono text-stone-500">{c.spent > 0 && c.impressions > 0 ? formatVND(calcCPM(c.spent, c.impressions)) : "-"}</td>
                          <td className="p-2.5 text-right font-mono text-[#111E38] font-semibold">{c.spent > 0 && c.results > 0 ? formatVND(calcCPA(c.spent, c.results)) : "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-stone-400 font-sans italic">
                          Không tìm thấy chiến dịch nào tương ứng trong bộ lọc.
                        </td>
                      </tr>
                    )}
                    {/* Total row */}
                    {sortedCampaigns.length > 0 && (
                      <tr className="bg-stone-100 font-semibold border-t-2 border-stone-300">
                        <td colSpan={3} className="p-2.5 text-[#111E38] font-bold">TỔNG CỘNG ({segmentSubTab})</td>
                        <td className="p-2.5 text-right font-mono">{formatVND(total.spent)}</td>
                        <td className="p-2.5 text-right font-mono">{formatNum(total.reach)}</td>
                        <td className="p-2.5 text-right font-mono">{formatNum(total.impressions)}</td>
                        <td className="p-2.5 text-right font-mono">{formatNum(total.results)}</td>
                        <td className="p-2.5 text-right font-mono">{formatVND(calcCPC(total.spent, total.clicks))}</td>
                        <td className="p-2.5 text-right font-mono">{formatVND(calcCPM(total.spent, total.impressions))}</td>
                        <td className="p-2.5 text-right font-mono text-[#111E38] font-bold">{formatVND(calcCPA(total.spent, total.results))}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* --- TAB 3: RUNNER DETAILED TABS --- */}
      {activeTab === "runners" && (
        <div className="space-y-4">
          {/* Sub-navigation for runners */}
          <div className="flex border-b border-stone-200 gap-1 pb-1 overflow-x-auto">
            {managers.map(mgr => {
              const mgrSpent = filteredData.filter(c => c.manager === mgr).reduce((sum, c) => sum + c.spent, 0);
              return (
                <button
                  key={mgr}
                  onClick={() => setRawSubTab("TKQC chính") /* Reset or maintain subtab */}
                  onClickCapture={() => setRunnerSubTab(mgr)}
                  className={`px-3.5 py-2 text-xs font-mono transition-all rounded ${
                    runnerSubTab === mgr
                      ? "bg-[#111E38] text-stone-100 font-semibold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  {mgr} <span className="text-[10px] text-stone-400 font-normal">({formatVND(mgrSpent)})</span>
                </button>
              );
            })}
          </div>

          {/* Dual tables inside each manager: B2B Table and B2C Table */}
          <div className="space-y-6">
            
            {/* 1. B2B Campaigns for selected runner */}
            <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase font-mono text-[#111E38] tracking-wider">
                  Chiến dịch B2B (Leads/Form) của {runnerSubTab}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Đo lường bằng: Lead / Conversation</span>
              </div>
              {(() => {
                const b2bCampaigns = filteredData.filter(c => c.manager === runnerSubTab && c.segment === "B2B");
                const sortedB2B = sortData(b2bCampaigns);
                const spent = b2bCampaigns.reduce((s, c) => s + c.spent, 0);
                const reach = b2bCampaigns.reduce((s, c) => s + c.reach, 0);
                const impressions = b2bCampaigns.reduce((s, c) => s + c.impressions, 0);
                const clicks = b2bCampaigns.reduce((s, c) => s + c.clicks, 0);
                const results = b2bCampaigns.reduce((s, c) => s + c.results, 0);

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#111E38] text-stone-100 font-mono text-[9px] uppercase">
                          <th className="p-2">Tên Chiến Dịch</th>
                          <th className="p-2">Tài Khoản</th>
                          <th className="p-2 text-right">Chi Phí</th>
                          <th className="p-2 text-right">Tiếp Cận</th>
                          <th className="p-2 text-right">Hiển Thị</th>
                          <th className="p-2 text-right">Kết Quả</th>
                          <th className="p-2 text-right">CPC</th>
                          <th className="p-2 text-right">CPM</th>
                          <th className="p-2 text-right">CPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {sortedB2B.length > 0 ? (
                          sortedB2B.map(c => (
                            <tr key={c.name} className="hover:bg-stone-100/50">
                              <td className="p-2 font-medium text-stone-800 break-words max-w-xs">{c.name}</td>
                              <td className="p-2 text-stone-400 text-[10px]">{c.account}</td>
                              <td className="p-2 text-right font-mono">{formatVND(c.spent)}</td>
                              <td className="p-2 text-right font-mono text-stone-500">{formatNum(c.reach)}</td>
                              <td className="p-2 text-right font-mono text-stone-500">{formatNum(c.impressions)}</td>
                              <td className="p-2 text-right font-mono font-medium">{formatNum(c.results)}</td>
                              <td className="p-2 text-right font-mono text-stone-500">{c.spent > 0 && c.clicks > 0 ? formatVND(calcCPC(c.spent, c.clicks)) : "-"}</td>
                              <td className="p-2 text-right font-mono text-stone-500">{c.spent > 0 && c.impressions > 0 ? formatVND(calcCPM(c.spent, c.impressions)) : "-"}</td>
                              <td className="p-2 text-right font-mono text-[#111E38] font-semibold">{c.spent > 0 && c.results > 0 ? formatVND(calcCPA(c.spent, c.results)) : "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="p-4 text-center text-stone-400 italic">Không có chiến dịch B2B.</td>
                          </tr>
                        )}
                        {sortedB2B.length > 0 && (
                          <tr className="bg-stone-100 font-semibold border-t border-stone-200">
                            <td colSpan={2} className="p-2 text-[#111E38] font-bold">TỔNG CỘNG B2B</td>
                            <td className="p-2 text-right font-mono">{formatVND(spent)}</td>
                            <td className="p-2 text-right font-mono">{formatNum(reach)}</td>
                            <td className="p-2 text-right font-mono">{formatNum(impressions)}</td>
                            <td className="p-2 text-right font-mono">{formatNum(results)}</td>
                            <td className="p-2 text-right font-mono">{formatVND(calcCPC(spent, clicks))}</td>
                            <td className="p-2 text-right font-mono">{formatVND(calcCPM(spent, impressions))}</td>
                            <td className="p-2 text-right font-mono text-[#111E38] font-bold">{formatVND(calcCPA(spent, results))}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* 2. B2C Campaigns for selected runner */}
            <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase font-mono text-[#B89047] tracking-wider">
                  Chiến dịch B2C (Landing Page View) của {runnerSubTab}
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Đo lường bằng: Landing Page View</span>
              </div>
              {(() => {
                const b2cCampaigns = filteredData.filter(c => c.manager === runnerSubTab && c.segment === "B2C");
                const sortedB2C = sortData(b2cCampaigns);
                const spent = b2cCampaigns.reduce((s, c) => s + c.spent, 0);
                const reach = b2cCampaigns.reduce((s, c) => s + c.reach, 0);
                const impressions = b2cCampaigns.reduce((s, c) => s + c.impressions, 0);
                const clicks = b2cCampaigns.reduce((s, c) => s + c.clicks, 0);
                const results = b2cCampaigns.reduce((s, c) => s + c.results, 0);

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#B89047] text-stone-100 font-mono text-[9px] uppercase">
                          <th className="p-2">Tên Chiến Dịch</th>
                          <th className="p-2">Tài Khoản</th>
                          <th className="p-2 text-right">Chi Phí</th>
                          <th className="p-2 text-right">Tiếp Cận</th>
                          <th className="p-2 text-right">Hiển Thị</th>
                          <th className="p-2 text-right">Kết Quả</th>
                          <th className="p-2 text-right">CPC</th>
                          <th className="p-2 text-right">CPM</th>
                          <th className="p-2 text-right">CPA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-200">
                        {sortedB2C.length > 0 ? (
                          sortedB2C.map(c => (
                            <tr key={c.name} className="hover:bg-stone-100/50">
                              <td className="p-2 font-medium text-stone-800 break-words max-w-xs">{c.name}</td>
                              <td className="p-2 text-stone-400 text-[10px]">{c.account}</td>
                              <td className="p-2 text-right font-mono">{formatVND(c.spent)}</td>
                              <td className="p-2 text-right font-mono text-stone-500">{formatNum(c.reach)}</td>
                              <td className="p-2 text-right font-mono text-stone-500">{formatNum(c.impressions)}</td>
                              <td className="p-2 text-right font-mono font-medium">{formatNum(c.results)}</td>
                              <td className="p-2 text-right font-mono text-stone-500">{c.spent > 0 && c.clicks > 0 ? formatVND(calcCPC(c.spent, c.clicks)) : "-"}</td>
                              <td className="p-2 text-right font-mono text-stone-500">{c.spent > 0 && c.impressions > 0 ? formatVND(calcCPM(c.spent, c.impressions)) : "-"}</td>
                              <td className="p-2 text-right font-mono text-[#111E38] font-semibold">{c.spent > 0 && c.results > 0 ? formatVND(calcCPA(c.spent, c.results)) : "-"}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} className="p-4 text-center text-stone-400 italic">Không có chiến dịch B2C.</td>
                          </tr>
                        )}
                        {sortedB2C.length > 0 && (
                          <tr className="bg-stone-100 font-semibold border-t border-stone-200">
                            <td colSpan={2} className="p-2 text-[#111E38] font-bold">TỔNG CỘNG B2C</td>
                            <td className="p-2 text-right font-mono">{formatVND(spent)}</td>
                            <td className="p-2 text-right font-mono">{formatNum(reach)}</td>
                            <td className="p-2 text-right font-mono">{formatNum(impressions)}</td>
                            <td className="p-2 text-right font-mono">{formatNum(results)}</td>
                            <td className="p-2 text-right font-mono">{formatVND(calcCPC(spent, clicks))}</td>
                            <td className="p-2 text-right font-mono">{formatVND(calcCPM(spent, impressions))}</td>
                            <td className="p-2 text-right font-mono text-[#111E38] font-bold">{formatVND(calcCPA(spent, results))}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: ALL CAMPAIGNS TAB WITH EXPLICIT RESULT TYPE --- */}
      {activeTab === "all" && (
        <div className="bg-stone-50 border border-stone-200/80 rounded p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <h4 className="font-serif text-sm text-[#111E38] font-bold tracking-tight uppercase font-mono">
              Báo Cáo Chi Tiết Toàn Bộ Chiến Dịch
            </h4>
            <div className="text-[10px] text-stone-400 font-mono flex items-center gap-1.5 bg-stone-100 p-2 rounded">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              <span>Cột kết quả hiển thị kèm đơn vị đo lường tương ứng để chống so sánh sai lệch.</span>
            </div>
          </div>

          {(() => {
            const sorted = sortData(filteredData);
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#111E38] text-stone-100 font-mono text-[9px] uppercase tracking-wider">
                      <th className="p-2">Tên Chiến Dịch</th>
                      <th className="p-2">Tài Khoản</th>
                      <th className="p-2">Người Chạy</th>
                      <th className="p-2">Khối</th>
                      <th className="p-2 text-right cursor-pointer" onClick={() => handleSort("spent")}>
                        Chi Phí {renderSortArrow("spent")}
                      </th>
                      <th className="p-2 text-right cursor-pointer" onClick={() => handleSort("reach")}>
                        Tiếp Cận {renderSortArrow("reach")}
                      </th>
                      <th className="p-2 text-right cursor-pointer" onClick={() => handleSort("impressions")}>
                        Hiển Thị {renderSortArrow("impressions")}
                      </th>
                      <th className="p-2 text-right cursor-pointer" onClick={() => handleSort("results")}>
                        Kết Quả {renderSortArrow("results")}
                      </th>
                      <th className="p-2 text-right cursor-pointer" onClick={() => handleSort("cpc")}>
                        CPC {renderSortArrow("cpc")}
                      </th>
                      <th className="p-2 text-right cursor-pointer" onClick={() => handleSort("cpm")}>
                        CPM {renderSortArrow("cpm")}
                      </th>
                      <th className="p-2 text-right cursor-pointer" onClick={() => handleSort("cpa")}>
                        CPA {renderSortArrow("cpa")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {sorted.length > 0 ? (
                      sorted.map(c => (
                        <tr key={c.name} className="hover:bg-stone-100/50">
                          <td className="p-2 font-medium text-stone-800 break-words max-w-xs">{c.name}</td>
                          <td className="p-2 text-stone-500 text-[10px]">{c.account}</td>
                          <td className="p-2 text-stone-600">{c.manager}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                              c.segment === "B2B" ? "bg-stone-200 text-[#111E38]" : "bg-[#c5a880]/20 text-[#B89047]"
                            }`}>
                              {c.segment}
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono">{formatVND(c.spent)}</td>
                          <td className="p-2 text-right font-mono text-stone-500">{formatNum(c.reach)}</td>
                          <td className="p-2 text-right font-mono text-stone-500">{formatNum(c.impressions)}</td>
                          <td className="p-2 text-right font-mono font-medium text-stone-800">
                            {formatNum(c.results)}{" "}
                            <span className="text-[9px] text-stone-400 font-normal">
                              ({c.resultIndicator})
                            </span>
                          </td>
                          <td className="p-2 text-right font-mono text-stone-500">{c.spent > 0 && c.clicks > 0 ? formatVND(calcCPC(c.spent, c.clicks)) : "-"}</td>
                          <td className="p-2 text-right font-mono text-stone-500">{c.spent > 0 && c.impressions > 0 ? formatVND(calcCPM(c.spent, c.impressions)) : "-"}</td>
                          <td className="p-2 text-right font-mono text-[#111E38] font-semibold">{c.spent > 0 && c.results > 0 ? formatVND(calcCPA(c.spent, c.results)) : "-"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="p-6 text-center text-stone-400 font-sans italic">
                          Không tìm thấy chiến dịch nào tương ứng trong bộ lọc.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* --- TAB 5: UNPROCESSED RAW DATA FROM FACEBOOK --- */}
      {activeTab === "raw" && (
        <div className="bg-stone-50 border border-stone-200/80 rounded p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <div>
              <h4 className="font-serif text-sm text-[#111E38] font-bold tracking-tight uppercase font-mono">
                Dữ Liệu Nguyên Bản (Unprocessed Facebook Ads Columns)
              </h4>
              <p className="text-[10px] text-stone-400 font-sans mt-0.5">
                Xem đối chiếu trực tiếp dữ liệu thô kết quả, tiếp cận, và chi tiêu phát sinh nguyên bản từ các file báo cáo.
              </p>
            </div>
            <div className="flex bg-stone-200/60 p-0.5 rounded border border-stone-300/40 text-xs">
              {accounts.map(acc => (
                <button
                  key={acc}
                  onClick={() => setRawSubTab(acc)}
                  className={`px-3 py-1.5 rounded font-medium ${
                    rawSubTab === acc ? "bg-[#111E38] text-stone-100" : "text-stone-600"
                  }`}
                >
                  {acc}
                </button>
              ))}
            </div>
          </div>

          {(() => {
            const rawCampaigns = allLoadedData.filter(c => c.account === rawSubTab);
            return (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-200 text-stone-700 font-mono text-[9px] uppercase">
                      <th className="p-2">Tên chiến dịch</th>
                      <th className="p-2">Lượt phân phối</th>
                      <th className="p-2">Ngân sách nhóm</th>
                      <th className="p-2">Loại ngân sách</th>
                      <th className="p-2 text-right">Chi tiêu (VND)</th>
                      <th className="p-2 text-right">Lượt hiển thị</th>
                      <th className="p-2 text-right">Lượt tiếp cận</th>
                      <th className="p-2 text-right">Kết quả</th>
                      <th className="p-2">Chỉ báo kết quả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {rawCampaigns.length > 0 ? (
                      rawCampaigns.map((c, idx) => (
                        <tr key={idx} className="hover:bg-stone-100/40">
                          <td className="p-2 font-mono text-[10px] text-stone-800 break-all max-w-xs">{c.name}</td>
                          <td className="p-2 text-stone-500">{c.status}</td>
                          <td className="p-2 font-mono text-stone-600">{formatNum(c.budget)}</td>
                          <td className="p-2 text-stone-400 text-[10px]">Hàng ngày</td>
                          <td className="p-2 text-right font-mono">{formatVND(c.spent)}</td>
                          <td className="p-2 text-right font-mono text-stone-500">{formatNum(c.impressions)}</td>
                          <td className="p-2 text-right font-mono text-stone-500">{formatNum(c.reach)}</td>
                          <td className="p-2 text-right font-mono text-stone-800 font-medium">{formatNum(c.results)}</td>
                          <td className="p-2 font-medium text-stone-500">{c.resultIndicator}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-stone-400 font-sans italic">
                          Chưa nạp tệp dữ liệu thô nào cho tài khoản này. Vui lòng kéo thả hoặc chọn file ở trên.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
