import React, { useState } from "react";
import { CampaignData } from "../types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  LabelList
} from "recharts";

interface ReportChartsProps {
  filteredData: CampaignData[];
}

const COLORS = ["#111E38", "#B89047", "#C5A880", "#5C6B73", "#D4AF37"];

export const ReportCharts: React.FC<ReportChartsProps> = ({ filteredData }) => {
  const activeData = filteredData.filter((c) => c.spent > 0);
  const [efficiencySegment, setEfficiencySegment] = useState<"B2B" | "B2C">("B2B");

  // Helper to format currency/numbers
  const formatValue = (value: number) => {
    return Math.round(value).toLocaleString("vi-VN");
  };

  const formatVND = (value: number) => {
    return `${formatValue(value)}đ`;
  };

  // 1. Cost B2B vs B2C
  const segmentCostData = [
    {
      name: "B2B",
      "Chi phí (VND)": activeData.filter((c) => c.segment === "B2B").reduce((sum, c) => sum + c.spent, 0)
    },
    {
      name: "B2C",
      "Chi phí (VND)": activeData.filter((c) => c.segment === "B2C").reduce((sum, c) => sum + c.spent, 0)
    }
  ];

  // 2. Cost by Manager
  const managers: ("Khương" | "Đông" | "Nam" | "Lương" | "Vy")[] = ["Khương", "Đông", "Nam", "Lương", "Vy"];
  const managerCostData = managers.map((mgr) => ({
    name: mgr,
    "Chi phí (VND)": activeData.filter((c) => c.manager === mgr).reduce((sum, c) => sum + c.spent, 0)
  }));

  // 3. Stacked B2B/B2C by Manager
  const stackedManagerData = managers.map((mgr) => {
    const mgrCampaigns = activeData.filter((c) => c.manager === mgr);
    return {
      name: mgr,
      "B2B (VND)": mgrCampaigns.filter((c) => c.segment === "B2B").reduce((sum, c) => sum + c.spent, 0),
      "B2C (VND)": mgrCampaigns.filter((c) => c.segment === "B2C").reduce((sum, c) => sum + c.spent, 0)
    };
  });

  // 4. Cost by Account (Pie Chart)
  const accounts: ("TKQC chính" | "TKQC-02 Ecom" | "TKQC-04 BD")[] = ["TKQC chính", "TKQC-02 Ecom", "TKQC-04 BD"];
  const accountPieData = accounts
    .map((acc) => ({
      name: acc,
      value: activeData.filter((c) => c.account === acc).reduce((sum, c) => sum + c.spent, 0)
    }))
    .filter((item) => item.value > 0);

  // 5. Top 10 Spending Campaigns
  const top10Campaigns = [...activeData]
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 10)
    .map((c) => ({
      name: c.name.length > 25 ? c.name.substring(0, 25) + "..." : c.name,
      fullName: c.name,
      "Chi phí (VND)": c.spent,
      "Kết quả": c.results,
      segment: c.segment
    }));

  // 6. Efficiency Scatter / Dual Data
  const efficiencyData = activeData
    .filter((c) => c.segment === efficiencySegment)
    .map((c) => ({
      name: c.name,
      "Chi phí": c.spent,
      "Kết quả": c.results,
      cpa: c.cpa,
      manager: c.manager
    }));

  // Custom Tooltip component for top 10
  const CustomCampaignTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111E38] text-stone-100 p-3 rounded shadow border border-gold-subtle text-xs font-sans max-w-xs">
          <p className="font-semibold mb-1 border-b border-stone-700 pb-1">{data.fullName}</p>
          <p>Phân khúc: <span className="font-mono font-medium text-[#B89047]">{data.segment}</span></p>
          <p>Chi phí: <span className="font-mono">{formatVND(data["Chi phí (VND)"])}</span></p>
          <p>Kết quả: <span className="font-mono">{formatValue(data["Kết quả"])}</span></p>
        </div>
      );
    }
    return null;
  };

  const CustomScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#111E38] text-stone-100 p-3 rounded shadow border border-gold-subtle text-xs font-sans max-w-xs">
          <p className="font-semibold mb-1 border-b border-stone-700 pb-1">{data.name}</p>
          <p>Người chạy: <span className="font-medium text-[#B89047]">{data.manager}</span></p>
          <p>Chi phí: <span className="font-mono">{formatVND(data["Chi phí"])}</span></p>
          <p>Kết quả: <span className="font-mono">{formatValue(data["Kết quả"])} ({efficiencySegment === "B2B" ? "Lead" : "View"})</span></p>
          <p>CPA: <span className="font-mono">{formatVND(data.cpa)} / kết quả</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Visual Charts Grid 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: B2B vs B2C Cost */}
        <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
          <h4 className="font-serif text-md text-[#111E38] font-bold tracking-tight mb-4 border-b border-stone-200/50 pb-2">
            Phân Khúc Chi Phí (B2B vs B2C)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={segmentCostData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E0" />
                <XAxis dataKey="name" stroke="#5C6B73" fontSize={11} tickLine={false} />
                <YAxis stroke="#5C6B73" fontSize={11} tickLine={false} tickFormatter={formatVND} />
                <Tooltip formatter={(value) => [formatVND(Number(value)), "Chi phí"]} cursor={{ fill: "rgba(197,168,128,0.05)" }} />
                <Bar dataKey="Chi phí (VND)" radius={[2, 2, 0, 0]}>
                  <Cell fill="#111E38" />
                  <Cell fill="#B89047" />
                  <LabelList
                    dataKey="Chi phí (VND)"
                    position="top"
                    formatter={(value: number) => formatVND(value)}
                    style={{ fontSize: 10, fill: "#111e38", fontWeight: 600, fontFamily: "sans-serif" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cost by Manager */}
        <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
          <h4 className="font-serif text-md text-[#111E38] font-bold tracking-tight mb-4 border-b border-stone-200/50 pb-2">
            Phân Bổ Chi Phí Theo Người Chạy (Nhân Viên)
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={managerCostData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E0" />
                <XAxis dataKey="name" stroke="#5C6B73" fontSize={11} tickLine={false} />
                <YAxis stroke="#5C6B73" fontSize={11} tickLine={false} tickFormatter={formatVND} />
                <Tooltip formatter={(value) => [formatVND(Number(value)), "Chi phí"]} cursor={{ fill: "rgba(197,168,128,0.05)" }} />
                <Bar dataKey="Chi phí (VND)" fill="#111E38" radius={[2, 2, 0, 0]}>
                  {managerCostData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList
                    dataKey="Chi phí (VND)"
                    position="top"
                    formatter={(value: number) => value > 0 ? formatVND(value) : ""}
                    style={{ fontSize: 9, fill: "#44403c", fontWeight: 600, fontFamily: "sans-serif" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 3: Stacked B2B vs B2C by Manager */}
        <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
          <h4 className="font-serif text-md text-[#111E38] font-bold tracking-tight mb-4 border-b border-stone-200/50 pb-2">
            Tỷ Trọng B2B / B2C Của Từng Người Chạy
          </h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedManagerData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E0" />
                <XAxis dataKey="name" stroke="#5C6B73" fontSize={11} tickLine={false} />
                <YAxis stroke="#5C6B73" fontSize={11} tickLine={false} tickFormatter={formatVND} />
                <Tooltip formatter={(value) => formatVND(Number(value))} cursor={{ fill: "rgba(197,168,128,0.05)" }} />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, fontFamily: "sans-serif" }} />
                <Bar dataKey="B2B (VND)" stackId="a" fill="#111E38" radius={[0, 0, 0, 0]}>
                  <LabelList
                    dataKey="B2B (VND)"
                    position="center"
                    formatter={(value: number) => value > 0 ? formatVND(value) : ""}
                    style={{ fontSize: 9, fill: "#ffffff", fontWeight: 600, fontFamily: "sans-serif" }}
                  />
                </Bar>
                <Bar dataKey="B2C (VND)" stackId="a" fill="#B89047" radius={[2, 2, 0, 0]}>
                  <LabelList
                    dataKey="B2C (VND)"
                    position="top"
                    formatter={(value: number) => value > 0 ? formatVND(value) : ""}
                    style={{ fontSize: 9, fill: "#44403c", fontWeight: 600, fontFamily: "sans-serif" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Share by Ad Account (Pie Chart) */}
        <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
          <h4 className="font-serif text-md text-[#111E38] font-bold tracking-tight mb-4 border-b border-stone-200/50 pb-2">
            Tỷ Trọng Chi Phí Theo Tài Khoản Quảng Cáo
          </h4>
          <div className="h-64 flex flex-col md:flex-row items-center justify-center">
            {accountPieData.length > 0 ? (
              <>
                <div className="w-full md:w-3/5 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={accountPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {accountPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatVND(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-2/5 flex flex-col gap-2 font-sans text-xs">
                  {accountPieData.map((entry, index) => {
                    const totalVal = accountPieData.reduce((sum, item) => sum + item.value, 0);
                    const pct = totalVal > 0 ? ((entry.value / totalVal) * 100).toFixed(1) : "0";
                    return (
                      <div key={entry.name} className="flex items-center justify-between border-b border-stone-200/50 pb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          <span className="text-stone-700 font-medium">{entry.name}</span>
                        </div>
                        <span className="font-mono text-stone-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-stone-400 text-xs font-sans">Chưa có dữ liệu chi phí.</p>
            )}
          </div>
        </div>
      </div>

      {/* Chart 5: Top 10 Spending Campaigns */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
        <h4 className="font-serif text-md text-[#111E38] font-bold tracking-tight mb-4 border-b border-stone-200/50 pb-2">
          Top 10 Chiến Dịch Có Chi Phí Cao Nhất
        </h4>
        <div className="h-80">
          {top10Campaigns.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10Campaigns} layout="vertical" margin={{ top: 10, right: 55, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E5E0" />
                <XAxis type="number" stroke="#5C6B73" fontSize={11} tickLine={false} tickFormatter={formatVND} />
                <YAxis dataKey="name" type="category" stroke="#5C6B73" fontSize={11} tickLine={false} width={150} />
                <Tooltip content={<CustomCampaignTooltip />} />
                <Bar dataKey="Chi phí (VND)" radius={[0, 2, 2, 0]}>
                  {top10Campaigns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.segment === "B2B" ? "#111E38" : "#B89047"} />
                  ))}
                  <LabelList
                    dataKey="Chi phí (VND)"
                    position="right"
                    formatter={(value: number) => formatVND(value)}
                    style={{ fontSize: 9, fill: "#44403c", fontWeight: 600, fontFamily: "sans-serif" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-stone-400 text-xs font-sans flex items-center justify-center h-full">Không có dữ liệu chi tiêu.</p>
          )}
        </div>
      </div>

      {/* Chart 6: Efficiency Scatter Plot with Custom Segment Switcher */}
      <div className="bg-stone-50 border border-stone-200/80 rounded p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-stone-200/50 pb-2 mb-4">
          <h4 className="font-serif text-md text-[#111E38] font-bold tracking-tight">
            Ma Trận Hiệu Quả Chi Phí vs Kết Quả
          </h4>
          <div className="flex bg-stone-200/60 p-0.5 rounded border border-stone-300/40 font-sans text-xs">
            <button
              onClick={() => setEfficiencySegment("B2B")}
              className={`px-3 py-1.5 rounded transition-all ${
                efficiencySegment === "B2B"
                  ? "bg-[#111E38] text-stone-100 font-medium"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Phân khúc B2B (Form/Lead)
            </button>
            <button
              onClick={() => setEfficiencySegment("B2C")}
              className={`px-3 py-1.5 rounded transition-all ${
                efficiencySegment === "B2C"
                  ? "bg-[#B89047] text-stone-100 font-medium"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Phân khúc B2C (Landing Page)
            </button>
          </div>
        </div>

        {/* CẢNH BÁO TRỰC QUAN */}
        <div className="bg-amber-50/70 border border-amber-200 rounded p-3 mb-4 font-sans text-[11px] text-amber-900 flex flex-col gap-1">
          <span className="font-semibold block uppercase tracking-wider text-amber-950 text-xs">CẢNH BÁO PHÂN TÍCH:</span>
          <span>B2B đo lường bằng Leads/Form hoặc Conversation, trong khi B2C đo lường bằng Landing Page Views. Hai đơn vị hoàn toàn khác nhau về giá trị và tỷ lệ chuyển đổi, tuyệt đối không được so sánh tuyệt đối kết quả giữa 2 khối này với nhau.</span>
        </div>

        <div className="h-72">
          {efficiencyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E0" />
                <XAxis type="number" dataKey="Chi phí" name="Chi phí" stroke="#5C6B73" fontSize={11} tickFormatter={formatVND} />
                <YAxis type="number" dataKey="Kết quả" name="Kết quả" stroke="#5C6B73" fontSize={11} tickFormatter={(v) => `${v}`} />
                <ZAxis range={[60, 60]} />
                <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                <Scatter
                  name="Chiến dịch"
                  data={efficiencyData}
                  fill={efficiencySegment === "B2B" ? "#111E38" : "#B89047"}
                />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-stone-400 text-xs font-sans flex items-center justify-center h-full">Không có dữ liệu cho phân khúc được chọn.</p>
          )}
        </div>
      </div>
    </div>
  );
};
