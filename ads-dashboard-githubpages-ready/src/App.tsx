import React, { useState, useMemo, useRef } from "react";
import { 
  Upload, 
  Trash2, 
  X, 
  RotateCcw, 
  FileSpreadsheet, 
  SlidersHorizontal, 
  Search, 
  FileText,
  TrendingUp,
  Sliders,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { CampaignData, UploadedFileMeta, AccountType, ManagerType, SegmentType } from "./types";
import { PHARM_REAL_CAMPAIGNS } from "./utils/data";
import { parseAdFile } from "./utils/parser";

import { KPIOverview } from "./components/KPIOverview";
import { ReportCharts } from "./components/ReportCharts";
import { ReportTables } from "./components/ReportTables";

export default function App() {
  // Toggle between Default baseline data vs Custom uploads
  const [dataSource, setDataSource] = useState<"default" | "uploaded">("default");

  // Custom Upload States
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMeta[]>([]);
  const [customCampaigns, setCustomCampaigns] = useState<CampaignData[]>([]);
  
  // Selected account for next upload
  const [uploadAccount, setUploadAccount] = useState<AccountType>("TKQC chính");
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active campaign set based on toggle selection
  const campaigns = dataSource === "default" ? PHARM_REAL_CAMPAIGNS : customCampaigns;

  // --- SELECTION FILTERS STATE ---
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterAccount, setFilterAccount] = useState<AccountType | "all">("all");
  const [filterSegment, setFilterSegment] = useState<SegmentType | "all">("all");
  const [filterManager, setFilterManager] = useState<ManagerType | "all">("all");
  const [filterResultType, setFilterResultType] = useState<string>("all");

  // Extract accent-free string for flexible search comparison
  const removeAccents = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  // Get distinct Result Types from current dataset dynamically
  const availableResultTypes = useMemo(() => {
    const types = new Set<string>();
    campaigns.forEach(c => {
      if (c.resultIndicator) {
        types.add(c.resultIndicator.trim());
      }
    });
    return Array.from(types);
  }, [campaigns]);

  // Handle file deletion
  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const remaining = prev.filter(f => f.id !== fileId);
      // Recalculate campaigns after deleting this file's campaigns
      const fileToDelete = prev.find(f => f.id === fileId);
      if (fileToDelete) {
        setCustomCampaigns(campaignsPrev => 
          campaignsPrev.filter(c => !fileToDelete.campaignNames.includes(c.name))
        );
      }
      return remaining;
    });
    setUploadMessage({ type: "success", text: "Đã gỡ bỏ tệp và cập nhật danh sách." });
    setTimeout(() => setUploadMessage(null), 3000);
  };

  // Clear all uploaded files to start over
  const handleClearAllUploads = () => {
    setUploadedFiles([]);
    setCustomCampaigns([]);
    setUploadMessage({ type: "success", text: "Đã làm sạch toàn bộ dữ liệu tự tải lên." });
    setTimeout(() => setUploadMessage(null), 3000);
  };

  // File Upload parsing processor
  const processUploadedFile = async (file: File) => {
    setUploadMessage(null);
    try {
      const parseResult = await parseAdFile(file, uploadAccount);
      const parsedCampaigns = parseResult.campaigns;

      if (parsedCampaigns.length === 0) {
        throw new Error("Không phát hiện chiến dịch hợp lệ nào trong tệp.");
      }

      // Add to uploaded metadata list
      const newFileMeta: UploadedFileMeta = {
        id: `file-${Date.now()}-${file.name}`,
        fileName: file.name,
        account: uploadAccount,
        campaignCount: parsedCampaigns.length,
        totalSpent: parsedCampaigns.reduce((sum, c) => sum + c.spent, 0),
        campaignNames: parsedCampaigns.map(c => c.name)
      };

      setUploadedFiles(prev => [...prev, newFileMeta]);
      setCustomCampaigns(prev => [...prev, ...parsedCampaigns]);
      
      // Auto-switch to uploaded tab
      setDataSource("uploaded");
      
      setUploadMessage({
        type: "success",
        text: `Đã nạp thành công ${parsedCampaigns.length} chiến dịch từ file "${file.name}" gán vào tài khoản "${uploadAccount}".`
      });
    } catch (err: any) {
      setUploadMessage({
        type: "error",
        text: err?.message || "Không thể phân tích dữ liệu tệp quảng cáo."
      });
    }
  };

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processUploadedFile(file);
    }
  };

  const handleManualFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processUploadedFile(file);
    }
  };

  // Reset all search and selection filters
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterAccount("all");
    setFilterSegment("all");
    setFilterManager("all");
    setFilterResultType("all");
  };

  // Apply search query and dynamic selection filters
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      // 1. Text Search matching (campaign name, result indicator, manager, account)
      if (searchQuery.trim() !== "") {
        const queryClean = removeAccents(searchQuery);
        const nameMatch = removeAccents(c.name).includes(queryClean);
        const mgrMatch = removeAccents(c.manager).includes(queryClean);
        const accMatch = removeAccents(c.account).includes(queryClean);
        const typeMatch = removeAccents(c.resultIndicator).includes(queryClean);
        if (!nameMatch && !mgrMatch && !accMatch && !typeMatch) {
          return false;
        }
      }

      // 2. Account filter
      if (filterAccount !== "all" && c.account !== filterAccount) {
        return false;
      }

      // 3. Segment filter
      if (filterSegment !== "all" && c.segment !== filterSegment) {
        return false;
      }

      // 4. Manager filter
      if (filterManager !== "all" && c.manager !== filterManager) {
        return false;
      }

      // 5. Result indicator type filter
      if (filterResultType !== "all" && c.resultIndicator !== filterResultType) {
        return false;
      }

      return true;
    });
  }, [campaigns, searchQuery, filterAccount, filterSegment, filterManager, filterResultType]);

  // Summarize cost of currently filtered set
  const filteredSpentTotal = useMemo(() => {
    return filteredCampaigns.reduce((sum, c) => sum + c.spent, 0);
  }, [filteredCampaigns]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 selection:bg-[#C5A880]/30 select-none pb-12 font-sans antialiased">
      
      {/* 1. TOP MARQUEE/HEADER BAR */}
      <div className="bg-[#111E38] text-[#C5A880] py-2 px-6 border-b border-[#C5A880]/20 flex justify-between items-center text-[10px] tracking-[0.2em] uppercase font-mono font-bold no-print">
        <span>Pharmesthetic Intel System • June 2026 Analysis</span>
        <span>Premium Campaign Intelligence Engine</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* 2. MAIN LOGO & BRANDING */}
        <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-200/80 pb-4 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#B89047] font-bold block">
              Báo Cáo Nghiệp Vụ Facebook Ads
            </span>
            <h1 className="text-3xl md:text-4xl font-serif text-[#111E38] font-bold tracking-tight">
              Pharmesthetic <span className="font-light italic text-[#B89047]">Performance Dashboard</span>
            </h1>
            <p className="text-xs text-stone-500 font-sans max-w-2xl">
              Phân loại 3 chiều độc lập: Nhân viên trực tiếp chạy, Phân khúc sản phẩm (B2B/B2C), và Tài khoản quảng cáo. Cam kết loại bỏ sai lệch định dạng.
            </p>
          </div>

          {/* Dataset source selector */}
          <div className="flex bg-stone-100 p-0.5 rounded border border-stone-200 text-xs font-mono no-print">
            <button
              onClick={() => setDataSource("default")}
              className={`px-3 py-1.5 rounded transition-all ${
                dataSource === "default"
                  ? "bg-[#111E38] text-[#FDFBF7] font-semibold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Dữ liệu chuẩn Tháng 6/2026
            </button>
            <button
              onClick={() => setDataSource("uploaded")}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                dataSource === "uploaded"
                  ? "bg-[#111E38] text-[#FDFBF7] font-semibold"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Dữ liệu tự tải lên ({uploadedFiles.length})
            </button>
          </div>
        </header>

        {/* 3. CONSECUTIVE FILE UPLOAD AREA */}
        <section className="bg-stone-50 border border-stone-200/80 rounded p-5 space-y-4 no-print" id="file-uploader">
          <div className="border-b border-stone-200/60 pb-2">
            <h3 className="font-serif text-sm font-bold text-[#111E38] uppercase tracking-wide">
              Nạp Tệp Dữ Liệu Chi Tiết (CSV / XLSX)
            </h3>
            <p className="text-[11px] text-stone-400 font-sans mt-0.5">
              Hỗ trợ kéo thả hoặc lựa chọn tệp Facebook quảng cáo. Nhập nhiều tệp liên tiếp để cộng dồn tích lũy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Input Selection Block */}
            <div className="space-y-3 font-sans">
              <div>
                <label className="block text-[11px] font-mono tracking-wider uppercase text-stone-500 mb-1">
                  1. Tài khoản được gán cho tệp
                </label>
                <select
                  value={uploadAccount}
                  onChange={(e) => setUploadAccount(e.target.value as AccountType)}
                  className="w-full bg-white border border-stone-200 text-[#111E38] text-xs font-medium px-3 py-2 rounded focus:outline-none focus:border-[#B89047] transition cursor-pointer"
                >
                  <option value="TKQC chính">TKQC chính (act_3258022854474822)</option>
                  <option value="TKQC-02 Ecom">TKQC-02 Ecom</option>
                  <option value="TKQC-04 BD">TKQC-04 BD</option>
                </select>
              </div>

              <div>
                <span className="block text-[11px] font-mono tracking-wider uppercase text-stone-500 mb-1">
                  2. Chọn tệp từ thiết bị
                </span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 bg-[#111E38] text-[#FDFBF7] hover:bg-[#111E38]/90 font-mono text-xs uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#C5A880]" />
                  Chọn File CSV/XLSX
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleManualFileSelect}
                  accept=".csv, .xlsx"
                  className="hidden"
                />
              </div>
            </div>

            {/* Dropzone Drop block */}
            <div className="md:col-span-2">
              <span className="block text-[11px] font-mono tracking-wider uppercase text-stone-500 mb-1">
                Hoặc kéo thả tệp vào vùng dưới đây
              </span>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border border-dashed rounded h-[106px] flex flex-col items-center justify-center transition-all ${
                  dragActive 
                    ? "border-[#B89047] bg-[#C5A880]/5" 
                    : "border-stone-200 hover:border-stone-400 bg-white"
                }`}
              >
                <Upload className={`w-5 h-5 mb-1 ${dragActive ? "text-[#B89047] animate-bounce" : "text-stone-400"}`} />
                <span className="text-xs text-stone-500 font-medium font-sans">
                  Kéo thả file .csv hoặc .xlsx vào đây để tải lên
                </span>
                <span className="text-[10px] text-stone-400 font-sans mt-0.5">
                  (Sheet đầu tiên của Excel sẽ được sử dụng)
                </span>
              </div>
            </div>
          </div>

          {/* Upload Status Alert banner */}
          {uploadMessage && (
            <div className={`p-3 rounded text-xs font-sans flex items-start gap-2.5 leading-relaxed ${
              uploadMessage.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}>
              {uploadMessage.type === "success" ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <span>{uploadMessage.text}</span>
            </div>
          )}

          {/* List of uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="border-t border-stone-200/60 pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-mono tracking-wider uppercase text-stone-500 font-bold">
                  Danh Sách Tệp Đã Nạp ({uploadedFiles.length})
                </span>
                <button
                  onClick={handleClearAllUploads}
                  className="text-[10px] font-mono text-rose-700 hover:text-rose-900 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  XÓA TẤT CẢ FILE NẠP
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {uploadedFiles.map(file => (
                  <div key={file.id} className="bg-white border border-stone-200 rounded p-2.5 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2 overflow-hidden mr-2">
                      <FileText className="w-4 h-4 text-[#B89047] flex-shrink-0" />
                      <div className="overflow-hidden">
                        <span className="text-xs font-medium text-stone-800 block truncate leading-none mb-1">
                          {file.fileName}
                        </span>
                        <div className="flex gap-2 text-[9px] font-mono leading-none">
                          <span className="text-stone-400">{file.account}</span>
                          <span className="text-[#111E38] font-bold">({file.campaignCount} CD)</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1 text-stone-400 hover:text-rose-700 hover:bg-stone-50 rounded transition-all"
                      title="Gỡ bỏ tệp này"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 4. DYNAMIC SEARCH & FILTER PANEL */}
        <section className="bg-[#111E38] text-stone-100 rounded p-5 border border-[#C5A880]/15 no-print" id="filters-panel">
          <div className="flex justify-between items-center border-b border-stone-700/60 pb-2.5 mb-4">
            <h3 className="font-serif text-sm font-bold tracking-wide uppercase text-[#C5A880] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C5A880]" />
              Thanh Tìm Kiếm & Bộ Lọc Nhanh Chiến Dịch
            </h3>
            <span className="text-[11px] font-mono text-stone-300">
              Đang xem <span className="font-bold text-[#C5A880]">{filteredCampaigns.length}</span> / tổng {campaigns.length} chiến dịch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 font-sans text-xs">
            
            {/* Search query box */}
            <div className="relative">
              <span className="block text-[10px] font-mono uppercase text-stone-400 mb-1 tracking-wider">
                Tìm kiếm tên chiến dịch
              </span>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm..."
                  className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded px-3 py-2 pl-8 focus:outline-none focus:border-[#C5A880] text-xs transition"
                />
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Account filter */}
            <div>
              <span className="block text-[10px] font-mono uppercase text-stone-400 mb-1 tracking-wider">
                Tài khoản quảng cáo
              </span>
              <select
                value={filterAccount}
                onChange={(e) => setFilterAccount(e.target.value as AccountType | "all")}
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded px-3 py-2 focus:outline-none focus:border-[#C5A880] transition cursor-pointer"
              >
                <option value="all">Tất cả tài khoản</option>
                <option value="TKQC chính">TKQC chính</option>
                <option value="TKQC-02 Ecom">TKQC-02 Ecom</option>
                <option value="TKQC-04 BD">TKQC-04 BD</option>
              </select>
            </div>

            {/* Segment filter */}
            <div>
              <span className="block text-[10px] font-mono uppercase text-stone-400 mb-1 tracking-wider">
                Phân khúc sản phẩm
              </span>
              <select
                value={filterSegment}
                onChange={(e) => setFilterSegment(e.target.value as SegmentType | "all")}
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded px-3 py-2 focus:outline-none focus:border-[#C5A880] transition cursor-pointer"
              >
                <option value="all">Tất cả phân khúc</option>
                <option value="B2B">B2B (Form/Lead)</option>
                <option value="B2C">B2C (Landing Page)</option>
              </select>
            </div>

            {/* Manager filter */}
            <div>
              <span className="block text-[10px] font-mono uppercase text-stone-400 mb-1 tracking-wider">
                Người chạy (Nhân sự)
              </span>
              <select
                value={filterManager}
                onChange={(e) => setFilterManager(e.target.value as ManagerType | "all")}
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded px-3 py-2 focus:outline-none focus:border-[#C5A880] transition cursor-pointer"
              >
                <option value="all">Tất cả nhân sự</option>
                <option value="Khương">Khương</option>
                <option value="Đông">Đông</option>
                <option value="Nam">Nam</option>
                <option value="Lương">Lương</option>
                <option value="Vy">Vy</option>
              </select>
            </div>

            {/* Result indicators filter */}
            <div>
              <span className="block text-[10px] font-mono uppercase text-stone-400 mb-1 tracking-wider">
                Mục tiêu kết quả (Mục tiêu)
              </span>
              <select
                value={filterResultType}
                onChange={(e) => setFilterResultType(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 text-stone-100 rounded px-3 py-2 focus:outline-none focus:border-[#C5A880] transition cursor-pointer"
              >
                <option value="all">Tất cả mục tiêu</option>
                {availableResultTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-3 border-t border-stone-700/60 font-sans text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-400">Chi phí tập đang lọc:</span>
              <span className="font-mono text-md font-bold text-[#C5A880]">
                {Math.round(filteredSpentTotal).toLocaleString("vi-VN")} VND
              </span>
            </div>
            <button
              onClick={handleClearFilters}
              className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded transition font-mono tracking-wide uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#C5A880]" />
              Xóa Bộ Lọc
            </button>
          </div>
        </section>

        {/* 5. METRICS SUMMARY KPI CARDS */}
        <section className="space-y-3">
          <div className="border-b border-stone-200/80 pb-1 flex justify-between items-center">
            <h3 className="font-serif text-xs font-bold text-[#111E38] uppercase tracking-wider">
              Chỉ Số KPI Tổng Quan (Thay đổi theo bộ lọc)
            </h3>
            {dataSource === "default" && (
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded leading-none">
                Có so sánh dữ liệu Tháng 5/2026
              </span>
            )}
          </div>
          <KPIOverview
            filteredData={filteredCampaigns}
            allData={campaigns}
            isDefaultData={dataSource === "default"}
          />
        </section>

        {/* 6. CHARTS BLOCK */}
        <section className="bg-white border border-stone-200/80 rounded p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h2 className="font-serif text-lg text-[#111E38] font-bold tracking-tight">
              Biểu Đồ Trực Quan Hiệu Quả Chiến Dịch
            </h2>
          </div>
          <ReportCharts filteredData={filteredCampaigns} />
        </section>

        {/* 7. REPORT TABLES TAB SUITE */}
        <section className="bg-white border border-stone-200/80 rounded p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h2 className="font-serif text-lg text-[#111E38] font-bold tracking-tight">
              Bảng Biểu Chi Tiết Đa Chiều (Sắp xếp tăng/giảm dần)
            </h2>
          </div>
          <ReportTables 
            filteredData={filteredCampaigns} 
            allLoadedData={campaigns} 
          />
        </section>

      </div>
    </div>
  );
}
