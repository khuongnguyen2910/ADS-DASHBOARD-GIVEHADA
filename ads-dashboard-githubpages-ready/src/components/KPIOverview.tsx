import React from "react";
import { CampaignData } from "../types";
import { PHARM_MAY_KPI } from "../utils/data";

interface KPIOverviewProps {
  filteredData: CampaignData[];
  allData: CampaignData[];
  isDefaultData: boolean;
}

export const KPIOverview: React.FC<KPIOverviewProps> = ({
  filteredData,
  allData,
  isDefaultData
}) => {
  // Calculate current period metrics
  const activeCampaigns = filteredData.filter(c => c.spent > 0);
  const totalSpent = filteredData.reduce((sum, c) => sum + c.spent, 0);
  const totalResults = filteredData.reduce((sum, c) => sum + c.results, 0);
  const totalReach = filteredData.reduce((sum, c) => sum + c.reach, 0);
  const totalImpressions = filteredData.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = filteredData.reduce((sum, c) => sum + c.clicks, 0);
  
  const cpm = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;
  const cpc = totalClicks > 0 ? totalSpent / totalClicks : 0;
  const cpa = totalResults > 0 ? totalSpent / totalResults : 0;
  const campaignsCount = filteredData.length;

  // Format currency
  const formatNum = (val: number) => {
    return Math.round(val).toLocaleString("vi-VN");
  };

  // Helper to render trend
  const renderTrend = (current: number, previous: number, isLowerBetter: boolean = false) => {
    if (!isDefaultData || previous <= 0) return <div className="h-4 mt-1.5" />;
    
    const pctChange = ((current - previous) / previous) * 100;
    const isUp = pctChange > 0;
    const isPositive = isLowerBetter ? !isUp : isUp;
    
    const arrow = isUp ? "▲" : "▼";
    const colorClass = isPositive ? "text-emerald-700 font-semibold" : "text-rose-700 font-semibold";
    const sign = isUp ? "+" : "";

    return (
      <div className={`text-[10px] sm:text-xs mt-1.5 flex items-center gap-1 ${colorClass} h-4`}>
        <span>{arrow} {sign}{pctChange.toFixed(1)}%</span>
        <span className="text-stone-400 font-normal">so với T5</span>
      </div>
    );
  };

  const getFontSize = (valStr: string) => {
    const len = valStr.length;
    if (len <= 5) return "text-lg xl:text-xl";
    if (len <= 8) return "text-base xl:text-lg";
    return "text-xs sm:text-sm xl:text-base";
  };

  // If there's no data at all
  if (allData.length === 0) {
    return (
      <div className="bg-amber-50/50 border border-gold-subtle rounded-lg p-6 text-center text-stone-600 font-sans">
        Chưa có dữ liệu nào được nạp. Vui lòng tải file quảng cáo hoặc nạp dữ liệu mẫu để bắt đầu.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3" id="kpi-dashboard">
      {/* 1. Tổng Chi Phí */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#c5a880]/40 min-h-[110px] h-full">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase block leading-none">Tổng Chi Phí</span>
          <div className={`font-bold font-serif text-[#111E38] mt-2 block leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(formatNum(totalSpent))}`}>
            {formatNum(totalSpent)}
          </div>
          <span className="text-[10px] text-stone-400 font-mono">VND</span>
        </div>
        {renderTrend(totalSpent, PHARM_MAY_KPI.spent)}
      </div>

      {/* 2. Tổng Kết Quả */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#c5a880]/40 min-h-[110px] h-full">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase block leading-none">Tổng Kết Quả</span>
          <div className={`font-bold font-serif text-[#111E38] mt-2 block leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(formatNum(totalResults))}`}>
            {formatNum(totalResults)}
          </div>
          <span className="text-[10px] text-stone-400 font-mono">Lượt chuyển đổi</span>
        </div>
        {renderTrend(totalResults, PHARM_MAY_KPI.results)}
      </div>

      {/* 3. Tổng Tiếp Cận */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#c5a880]/40 min-h-[110px] h-full">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase block leading-none">Người Tiếp Cận</span>
          <div className={`font-bold font-serif text-[#111E38] mt-2 block leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(formatNum(totalReach))}`}>
            {formatNum(totalReach)}
          </div>
          <span className="text-[10px] text-stone-400 font-mono">Người</span>
        </div>
        {renderTrend(totalReach, PHARM_MAY_KPI.reach)}
      </div>

      {/* 4. Tổng Hiển Thị */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#c5a880]/40 min-h-[110px] h-full">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase block leading-none">Lượt Hiển Thị</span>
          <div className={`font-bold font-serif text-[#111E38] mt-2 block leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(formatNum(totalImpressions))}`}>
            {formatNum(totalImpressions)}
          </div>
          <span className="text-[10px] text-stone-400 font-mono">Lượt</span>
        </div>
        {renderTrend(totalImpressions, PHARM_MAY_KPI.impressions)}
      </div>

      {/* 5. CPM Trung Bình */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#c5a880]/40 min-h-[110px] h-full">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase block leading-none">CPM Trung Bình</span>
          <div className={`font-bold font-serif text-[#111E38] mt-2 block leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(formatNum(cpm))}`}>
            {formatNum(cpm)}
          </div>
          <span className="text-[10px] text-stone-400 font-mono">VND</span>
        </div>
        {renderTrend(cpm, PHARM_MAY_KPI.cpm, true)}
      </div>

      {/* 6. CPC Trung Bình */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#c5a880]/40 min-h-[110px] h-full">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase block leading-none">CPC Trung Bình</span>
          <div className={`font-bold font-serif text-[#111E38] mt-2 block leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(formatNum(cpc))}`}>
            {formatNum(cpc)}
          </div>
          <span className="text-[10px] text-stone-400 font-mono">VND</span>
        </div>
        {renderTrend(cpc, PHARM_MAY_KPI.cpc, true)}
      </div>

      {/* 7. CPA Trung Bình */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#c5a880]/40 min-h-[110px] h-full">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase block leading-none">CPA Trung Bình</span>
          <div className={`font-bold font-serif text-[#111E38] mt-2 block leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(formatNum(cpa))}`}>
            {formatNum(cpa)}
          </div>
          <span className="text-[10px] text-stone-400 font-mono">VND</span>
        </div>
        {renderTrend(cpa, PHARM_MAY_KPI.cpa, true)}
      </div>

      {/* 8. Số CD Đang Xem */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-4 flex flex-col justify-between shadow-xs transition-all hover:border-[#c5a880]/40 min-h-[110px] h-full">
        <div>
          <span className="text-[11px] font-mono tracking-wider text-stone-400 uppercase block leading-none">Chiến Dịch Xem</span>
          <div className={`font-bold font-serif text-[#111E38] mt-2 block leading-none whitespace-nowrap overflow-hidden text-ellipsis ${getFontSize(String(campaignsCount))}`}>
            {campaignsCount}
          </div>
          <span className="text-[10px] text-stone-400 font-mono">Đang lọc / {allData.length}</span>
        </div>
        {renderTrend(campaignsCount, PHARM_MAY_KPI.campaignsCount)}
      </div>
    </div>
  );
};
