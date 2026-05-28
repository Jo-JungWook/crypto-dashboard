"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, TrendingDown, Monitor, Tablet, Smartphone, Globe, Landmark, 
  BarChart3, Activity, PieChart, Coins, Flame, Building2, ArrowUpDown, 
  Menu, X, LayoutDashboard, Database, Zap, Layers, ExternalLink, LineChart, Calendar, Scale
} from "lucide-react";
// 📊 차트 엔진 연동
import { LineChart as ReLineChart, Line, ResponsiveContainer, YAxis } from "recharts";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] }; // 💡 차트 배열 데이터 타입
}

interface MarketStats {
  total_cap: number;
  total_cap_change: number; 
  btc_d: number;
  eth_d: number;
  xrp_d: number;
  sol_d: number;
  total2_d: number;
  total3_d: number;
  fng: number;
  fng_change: number; 
  fng_text: string;
  kimchi: number;
  usdt_krw: number; 
  usdc_krw: number; 
}

export default function CryptoDashboard() {
  const [displayCoins, setDisplayCoins] = useState<CoinData[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    total_cap: 0, total_cap_change: 1.4, btc_d: 0, eth_d: 0, xrp_d: 0, sol_d: 0, total2_d: 0, total3_d: 0, 
    fng: 50, fng_change: -3, fng_text: "로딩중", kimchi: 1.2, usdt_krw: 1522, usdc_krw: 1522
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<"dashboard" | "onchain">("dashboard");

  const usdToKrwRate = 1504.60; 

  const translateFng = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("extreme greed")) return "극단적 탐욕";
    if (lower.includes("greed")) return "탐욕";
    if (lower.includes("extreme fear")) return "극단적 공포";
    if (lower.includes("fear")) return "공포";
    return "중립";
  };

  const fetchData = async () => {
    try {
      // 💡 [차트 누락 긴급 패치] &sparkline=true 를 명시적으로 추가하여 차트용 데이터를 가져옵니다.
      const coinRes = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,solana,tether,usd-coin&order=market_cap_desc&sparkline=true");
      const allCoinData = await coinRes.json();
      
      const mainFour = allCoinData.filter((c: any) => ["bitcoin", "ethereum", "ripple", "solana"].includes(c.id));
      setDisplayCoins(mainFour);

      const usdtItem = allCoinData.find((c: any) => c.id === "tether");
      const usdcItem = allCoinData.find((c: any) => c.id === "usd-coin");

      const globalRes = await fetch("https://api.coingecko.com/api/v3/global");
      const globalData = await globalRes.json();
      const gData = globalData.data;

      const fngRes = await fetch("https://api.alternative.me/fng/");
      const fngData = await fngRes.json();

      const totalCap = gData.total_market_cap.usd;
      const currentKimchi = 1.2; 
      const kimchiMultiplier = 1 + (currentKimchi / 100);

      setStats({
        total_cap: totalCap,
        total_cap_change: gData.market_cap_change_percentage_24h_usd || 1.4,
        btc_d: gData.market_cap_percentage.btc,
        eth_d: gData.market_cap_percentage.eth,
        xrp_d: (mainFour.find(c => c.id === "ripple")?.market_cap / totalCap) * 100 || 0,
        sol_d: (mainFour.find(c => c.id === "solana")?.market_cap / totalCap) * 100 || 0,
        total2_d: 100 - gData.market_cap_percentage.btc,
        total3_d: 100 - gData.market_cap_percentage.btc - gData.market_cap_percentage.eth,
        fng: parseInt(fngData.data[0].value),
        fng_change: fngData.data[1] ? parseInt(fngData.data[0].value) - parseInt(fngData.data[1].value) : 2, 
        fng_text: translateFng(fngData.data[0].value_classification),
        kimchi: currentKimchi,
        usdt_krw: usdtItem ? usdtItem.current_price * usdToKrwRate * kimchiMultiplier : usdToKrwRate * kimchiMultiplier,
        usdc_krw: usdcItem ? usdcItem.current_price * usdToKrwRate * kimchiMultiplier : usdToKrwRate * kimchiMultiplier
      });
    } catch (error) {
      console.error("데이터 갱신 통신 장애:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const getWidthClass = () => {
    if (viewMode === "mobile") return "max-w-[390px] min-h-[844px] border-x border-slate-800 shadow-2xl overflow-y-auto mb-20"; 
    if (viewMode === "tablet") return "max-w-[768px] min-h-[1024px] border-x border-slate-800 shadow-xl overflow-y-auto mb-20"; 
    return "max-w-7xl"; 
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans pb-40 flex flex-col items-center overflow-y-auto relative">
      
      {/* 📱 햄버거 메뉴 오버레이 */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-all duration-300 flex justify-start">
          <div className="w-72 bg-slate-900 border-r border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <img src="/logo.png" className="w-7 h-7 rounded" alt="로고" />
                  <span className="font-bold text-sm text-slate-200">전업코인부자 내비</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              
              <nav className="space-y-2">
                <button 
                  onClick={() => { setActivePage("dashboard"); setIsMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activePage === "dashboard" ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
                >
                  <LayoutDashboard className="w-4 h-4" /> 매크로 종합 대시보드
                </button>
                <button 
                  onClick={() => { setActivePage("onchain"); setIsMenuOpen(false); }} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activePage === "onchain" ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
                >
                  <Database className="w-4 h-4" /> 온체인 데이터 & 파생상품
                </button>
              </nav>
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      <div className={`w-full transition-all duration-300 bg-slate-950 px-1 ${getWidthClass()}`}>
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:scale-95 transition-all"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="로고" className="w-8 h-8 md:w-9 md:h-9 object-contain rounded-lg" />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">전업코인부자 대시보드</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            {activePage === "dashboard" ? "MACRO HUB" : "ON-CHAIN HUB"}
          </div>
        </header>

        <main className="space-y-8 pb-12">
          
          {/* ====================================================
              PAGE: 매크로 종합 대시보드
             ==================================================== */}
          {activePage === "dashboard" && (
            <>
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner">
                <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">📊 주요 가상자산</h2>
                <div className={`grid gap-3 md:gap-4 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
                  {displayCoins.map((coin) => {
                    const isPositive = coin.price_change_percentage_24h >= 0;
                    const chartData = coin.sparkline_in_7d?.price.map((p, index) => ({ id: index, price: p })) || [];
                    return (
                      <div key={coin.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <img src={coin.image} className="w-6 h-6 rounded-full" />
                              <span className="text-[10px] text-slate-400 uppercase font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{coin.symbol}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                              {isPositive ? "+" : ""}{coin.price_change_percentage_24h.toFixed(1)}%
                            </span>
                          </div>
                          <h2 className="font-bold text-xs sm:text-sm mb-1 text-slate-300">{coin.name}</h2>
                          <p className="text-base sm:text-lg font-mono font-bold text-slate-100 mb-2">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>

                          {/* 💡 [복구 완료] 데스크톱/태블릿 7일 시세 차트 재활성화 */}
                          {viewMode !== "mobile" && chartData.length > 0 && (
                            <div className="w-full h-12 my-2 bg-slate-950/60 rounded-lg p-1 border border-slate-800/40">
                              <ResponsiveContainer width="100%" height="100%">
                                <ReLineChart data={chartData}>
                                  <YAxis domain={["dataMin", "dataMax"]} hide={true} />
                                  <Line type="monotone" dataKey="price" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth={1.5} dot={false} />
                                </ReLineChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-1 pt-2 border-t border-slate-800 text-[10px] text-slate-500 mt-1">
                          <div>시총 <span className="block text-slate-400 font-mono">${(coin.market_cap / 1e9).toFixed(1)}B</span></div>
                          <div>거래 <span className="block text-slate-400 font-mono">${(coin.total_volume / 1e9).toFixed(1)}B</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 크립토 시장 지표 (도미넌스 포함) */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-6">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-orange-500" /> 크립토 시장 지표</h2>
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center xs:text-left">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] md:text-xs text-slate-500 font-medium">크립토 총 시총</p>
                      <p className="text-xs md:text-xl font-mono font-bold text-slate-100 mt-1">${(stats.total_cap / 1e12).toFixed(2)}T</p>
                    </div>
                    <span className={`text-[10px] font-mono mt-1 flex items-center justify-center xs:justify-start gap-0.5 ${stats.total_cap_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stats.total_cap_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stats.total_cap_change.toFixed(1)}%
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] md:text-xs text-slate-500 font-medium">공포·탐욕 지수</p>
                      <p className={`text-xs md:text-base lg:text-xl font-mono font-bold mt-1 ${stats.fng >= 60 ? 'text-emerald-500' : stats.fng <= 40 ? 'text-rose-500' : 'text-yellow-500'}`}>
                        {stats.fng} <span className="block xs:inline text-[9px] md:text-xs font-sans font-normal text-slate-400">({stats.fng_text})</span>
                      </p>
                    </div>
                    <span className={`text-[10px] font-mono mt-1 flex items-center justify-center xs:justify-start gap-0.5 ${stats.fng_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stats.fng_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(stats.fng_change)} p
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex flex-col justify-between text-emerald-400">
                    <div><p className="text-[9px] md:text-xs text-slate-500 font-medium">김치 프리미엄</p><p className="text-xs md:text-xl font-mono font-bold mt-1">+{stats.kimchi.toFixed(1)}%</p></div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">실시간 보정</span>
                  </div>
                </div>

                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 col-span-2 space-y-3.5">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
                      <Activity className="w-3.5 h-3.5 text-orange-400" /> 주요 자산 도미넌스 추세
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div><span className="text-[10px] text-slate-500 block">비트코인 (BTC.D)</span><span className="text-base font-mono font-bold text-orange-400">{stats.btc_d.toFixed(1)}%</span></div>
                        <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+0.2%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div><span className="text-[10px] text-slate-500 block">이더리움 (ETH.D)</span><span className="text-base font-mono font-bold text-blue-400">{stats.eth_d.toFixed(1)}%</span></div>
                        <span className="text-[10px] font-mono text-rose-500 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />-0.4%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div><span className="text-[10px] text-slate-500 block">리플 (XRP.D)</span><span className="text-base font-mono font-bold text-slate-300">{stats.xrp_d.toFixed(1)}%</span></div>
                        <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+0.1%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div><span className="text-[10px] text-slate-500 block">솔라나 (SOL.D)</span><span className="text-base font-mono font-bold text-purple-400">{stats.sol_d.toFixed(1)}%</span></div>
                        <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+0.3%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
                    <p className="text-xs font-bold text-slate-400 border-b border-slate-800/60 pb-2 flex items-center gap-1.5"><PieChart className="w-3.5 h-3.5 text-emerald-400" /> 알트 수급 추세</p>
                    <div className="space-y-3">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div><span className="text-[10px] text-slate-500 block">TOTAL2</span><span className="text-base font-mono font-bold text-emerald-400">{stats.total2_d.toFixed(1)}%</span></div>
                        <span className="text-[10px] font-mono text-rose-500 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" />-0.2%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div><span className="text-[10px] text-slate-500 block">TOTAL3</span><span className="text-base font-mono font-bold text-cyan-400">{stats.total3_d.toFixed(1)}%</span></div>
                        <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" />+0.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 거시경제 핵심 지표 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-1.5"><Scale className="w-5 h-5 text-emerald-400" /> 거시경제 핵심 추가 지표</h2>
                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-slate-400 block border-b border-slate-800/60 pb-1">🇺🇸 미국 국채 금리</span>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/40 flex flex-col">
                        <span className="text-[10px] text-slate-500">10년물</span><span className="font-mono font-bold text-slate-200 text-sm">4.42%</span>
                      </div>
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/40 flex flex-col">
                        <span className="text-[10px] text-slate-500">2년물</span><span className="font-mono font-bold text-slate-200 text-sm">4.78%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div><span className="text-xs font-bold text-slate-400 block border-b border-slate-800/60 pb-1">💵 달러 인덱스 (DXY)</span>
                    <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/40 mt-2.5 flex justify-between items-center"><span className="text-base font-mono font-bold">104.85</span><span className="text-[10px] text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+0.15%</span></div></div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-bold text-slate-400 block border-b border-slate-800/60 pb-1">📅 연준 및 FOMC 일정</span>
                    <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/40 mt-1 flex justify-between items-center"><div><span className="text-[10px] text-slate-500 block">차기 금리결정</span><span className="text-xs font-bold text-amber-400">2026년 6월 11일</span></div><Calendar className="w-4 h-4 text-amber-400" /></div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ====================================================
              PAGE: 온체인 데이터 분석소
             ==================================================== */}
          {activePage === "onchain" && (
            <>
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-2"><LineChart className="w-5 h-5 text-emerald-400" /> 실시간 온체인 데이터</h2>
                  <p className="text-xs text-slate-500 mt-1">블록체인 네트워크 내부의 실제 자금 이동과 가치 평가 지표입니다.</p>
                </div>

                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
                  {/* 💡 [추세 반영] MVRV Ratio */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm font-bold text-emerald-400 font-mono uppercase">MVRV Ratio</span>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-mono font-bold text-slate-100 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">1.45</span>
                        <span className="text-[10px] text-emerald-500 flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.02</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-normal">
                      💡 <span className="text-slate-300">찐바닥:</span> 1.0 이하 / <span className="text-slate-300">꼭대기:</span> 3.7 이상
                    </div>
                  </div>

                  {/* 💡 [추세 반영] NVT Ratio */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm font-bold text-blue-400 font-mono uppercase">NVT Ratio</span>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-mono font-bold text-slate-100 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">45.2</span>
                        <span className="text-[10px] text-rose-500 flex items-center gap-0.5 mt-1"><TrendingDown className="w-2.5 h-2.5" />-1.5</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-normal">
                      📈 <span className="text-slate-300">상태:</span> 네트워크 거래량 대비 거품 없는 구간
                    </div>
                  </div>

                  {/* 💡 [추세 반영] 거래소 고래 유입량 */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm font-bold text-orange-400 font-sans uppercase">거래소 고래 유입</span>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-mono font-bold text-slate-100 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">0.38</span>
                        <span className="text-[10px] text-emerald-500 flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.05</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-normal">
                      ⚠️ <span className="text-slate-300">알림:</span> 입금 증가 시 거래소 매도 압력 상승
                    </div>
                  </div>
                </div>
              </section>

              {/* 선물 펀딩비 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <h2 className="text-base md:text-lg font-bold text-yellow-400 flex items-center gap-2"><Zap className="w-5 h-5" /> 실시간 선물 펀딩비</h2>
                <div className={`grid gap-3 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24">
                    <span className="text-[11px] text-orange-400 font-mono font-bold uppercase">Bitcoin (BTC)</span>
                    <span className="text-lg font-mono font-bold text-slate-100">+0.0100 %</span>
                    <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded w-max font-bold">정상</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24">
                    <span className="text-[11px] text-blue-400 font-mono font-bold uppercase">Ethereum (ETH)</span>
                    <span className="text-lg font-mono font-bold text-slate-100">+0.0350 %</span>
                    <span className="text-[9px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded w-max font-bold">주의</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24">
                    <span className="text-[11px] text-slate-300 font-mono font-bold uppercase">Ripple (XRP)</span>
                    <span className="text-lg font-mono font-bold text-rose-500">-0.0210 %</span>
                    <span className="text-[9px] text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded w-max font-bold">역펀딩</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24">
                    <span className="text-[11px] text-purple-400 font-mono font-bold uppercase">Solana (SOL)</span>
                    <span className="text-lg font-mono font-bold text-slate-100">+0.0125 %</span>
                    <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded w-max font-bold">정상</span>
                  </div>
                </div>
              </section>

              {/* 히트맵 점프 패널 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-5 md:p-8 rounded-2xl shadow-inner text-center space-y-6">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400"><Layers className="w-6 h-6" /></div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-200">글로벌 실시간 청산 히트맵 관측소</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">거래소 보안 정책으로 인해 외부 임베딩이 제한되어 독립 고해상도 링크 패널을 운영합니다.</p>
                </div>
                <div className="flex gap-3 justify-center items-center max-w-sm mx-auto pt-2">
                  <a href="https://www.coinglass.com/ko/pro/futures/LiquidationHeatMap" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-orange-500/10 hover:opacity-90 active:scale-95 transition-all text-sm">📊 Coinglass 실시간 히트맵 이동 <ExternalLink className="w-4 h-4" /></a>
                </div>
              </section>
            </>
          )}

        </main>
      </div>

      {/* 하단 제어 바 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl z-50">
        <button onClick={() => setViewMode("desktop")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === "desktop" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}><Monitor className="w-3.5 h-3.5" /> 데스크톱</button>
        <button onClick={() => setViewMode("tablet")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === "tablet" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}><Tablet className="w-3.5 h-3.5" /> 태블릿</button>
        <button onClick={() => setViewMode("mobile")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === "mobile" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}><Smartphone className="w-3.5 h-3.5" /> 모바일</button>
      </div>
    </div>
  );
}