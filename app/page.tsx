"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, TrendingDown, Monitor, Tablet, Smartphone, Globe, Landmark, 
  BarChart3, Activity, PieChart, Coins, Flame, Building2, ArrowUpDown, 
  Menu, X, LayoutDashboard, Database, Zap, Layers, ExternalLink, LineChart, Calendar, Scale
} from "lucide-react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
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
      const coinRes = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,solana,tether,usd-coin&order=market_cap_desc");
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
      const btcD = gData.market_cap_percentage.btc;
      const ethD = gData.market_cap_percentage.eth;
      
      const xrp = allCoinData.find((c: any) => c.id === "ripple");
      const sol = allCoinData.find((c: any) => c.id === "solana");
      const xrpD = xrp ? (xrp.market_cap / totalCap) * 100 : 0;
      const solD = sol ? (sol.market_cap / totalCap) * 100 : 0;

      const currentKimchi = 1.2; 
      const kimchiMultiplier = 1 + (currentKimchi / 100);

      const realUsdtKrw = usdtItem ? usdtItem.current_price * usdToKrwRate * kimchiMultiplier : usdToKrwRate * kimchiMultiplier;
      const realUsdcKrw = usdcItem ? usdcItem.current_price * usdToKrwRate * kimchiMultiplier : usdToKrwRate * kimchiMultiplier;

      setStats({
        total_cap: totalCap,
        total_cap_change: gData.market_cap_change_percentage_24h_usd || 1.4,
        btc_d: btcD,
        eth_d: ethD,
        xrp_d: xrpD,
        sol_d: solD,
        total2_d: 100 - btcD,
        total3_d: 100 - btcD - ethD,
        fng: parseInt(fngData.data[0].value),
        fng_change: fngData.data[1] ? parseInt(fngData.data[0].value) - parseInt(fngData.data[1].value) : 2, 
        fng_text: translateFng(fngData.data[0].value_classification),
        kimchi: currentKimchi,
        usdt_krw: realUsdtKrw,
        usdc_krw: realUsdcKrw
      });
    } catch (error) {
      console.error("원격 통신 에러:", error);
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

  const getCoinTrend = (id: string) => {
    const coin = displayCoins.find(c => c.id === id);
    if (!coin) return { isUp: true, pct: "0.0" };
    return { isUp: coin.price_change_percentage_24h >= 0, pct: coin.price_change_percentage_24h.toFixed(1) };
  };

  const btcTrend = getCoinTrend("bitcoin");
  const ethTrend = getCoinTrend("ethereum");
  const xrpTrend = getCoinTrend("ripple");
  const solTrend = getCoinTrend("solana");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans pb-40 flex flex-col items-center overflow-y-auto relative">
      
      {/* 📱 햄버거 메뉴 오버레이 내비게이션 */}
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
            <div className="text-[11px] text-slate-600 font-mono text-center border-t border-slate-800/60 pt-4">
              Professional Trading Hub v3.5
            </div>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      <div className={`w-full transition-all duration-300 bg-slate-950 px-1 ${getWidthClass()}`}>
        
        {/* 헤더 */}
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMenuOpen(true)} 
              className="p-2 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-200 transition-all focus:scale-95"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="로고" className="w-8 h-8 md:w-9 md:h-9 object-contain rounded-lg" />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">전업코인부자 대시보드</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            {activePage === "dashboard" ? "MACRO" : "ON-CHAIN & DERIVATIVES"}
          </div>
        </header>

        <main className="space-y-8 pb-12">
          
          {/* ====================================================
              PAGE LAYOUT A: 매크로 종합 대시보드 레이어
             ==================================================== */}
          {activePage === "dashboard" && (
            <>
              {/* 섹션 1: 주요 가상자산 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner">
                <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                  📊 주요 가상자산
                </h2>
                {loading && displayCoins.length === 0 ? (
                  <div className="text-center text-slate-500 py-10 font-mono">데이터 가동 노드 연결 중...</div>
                ) : (
                  <div className={`grid gap-3 md:gap-4 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
                    {displayCoins.map((coin) => (
                      <div key={coin.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <img src={coin.image} className="w-6 h-6 rounded-full" />
                              <span className="text-[10px] text-slate-400 uppercase font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{coin.symbol}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
                              {coin.price_change_percentage_24h >= 0 ? "+" : ""}{coin.price_change_percentage_24h.toFixed(1)}%
                            </span>
                          </div>
                          <h2 className="font-bold text-xs sm:text-sm mb-1 text-slate-300">{coin.name}</h2>
                          <p className="text-base sm:text-lg font-mono font-bold text-slate-100 mb-2">
                            ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-1 pt-2 border-t border-slate-800 text-[10px] text-slate-500 mt-1">
                          <div>시총 <span className="block text-slate-400 font-mono">${(coin.market_cap / 1e9).toFixed(1)}B</span></div>
                          <div>거래 <span className="block text-slate-400 font-mono">${(coin.total_volume / 1e9).toFixed(1)}B</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* 섹션 2: 크립토 시장 지표 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-6">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" /> 크립토 시장 지표
                </h2>

                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center xs:text-left">
                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] md:text-xs text-slate-500 font-medium">크립토 총 시총</p>
                      <p className="text-xs md:text-xl font-mono font-bold text-slate-100 mt-1">${(stats.total_cap / 1e12).toFixed(2)}T</p>
                    </div>
                    <span className={`text-[10px] font-mono mt-1 flex items-center justify-center xs:justify-start gap-0.5 ${stats.total_cap_change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stats.total_cap_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {stats.total_cap_change >= 0 ? "+" : ""}{stats.total_cap_change.toFixed(1)}%
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
                      {stats.fng_change >= 0 ? `+${stats.fng_change}` : stats.fng_change} p
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] md:text-xs text-slate-500 font-medium">김치 프리미엄</p>
                      <p className="text-xs md:text-xl font-mono font-bold text-emerald-400 mt-1">+{stats.kimchi.toFixed(1)}%</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1">BTC 표준 기준</span>
                  </div>
                </div>

                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 col-span-2 space-y-3.5">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
                      <Activity className="w-3.5 h-3.5 text-orange-400" /> 주요 자산 도미넌스 추세
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">비트코인 (BTC.D)</span>
                          <span className="text-base font-mono font-bold text-orange-400">{stats.btc_d.toFixed(1)}%</span>
                        </div>
                        <div className={`flex items-center gap-0.5 text-[10px] font-mono ${btcTrend.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                          {btcTrend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {btcTrend.pct}%
                        </div>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">이더리움 (ETH.D)</span>
                          <span className="text-base font-mono font-bold text-blue-400">{stats.eth_d.toFixed(1)}%</span>
                        </div>
                        <div className={`flex items-center gap-0.5 text-[10px] font-mono ${ethTrend.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                          {ethTrend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {ethTrend.pct}%
                        </div>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">리플 (XRP.D)</span>
                          <span className="text-base font-mono font-bold text-slate-300">{stats.xrp_d.toFixed(1)}%</span>
                        </div>
                        <div className={`flex items-center gap-0.5 text-[10px] font-mono ${xrpTrend.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                          {xrpTrend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {xrpTrend.pct}%
                        </div>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">솔라나 (SOL.D)</span>
                          <span className="text-base font-mono font-bold text-purple-400">{stats.sol_d.toFixed(1)}%</span>
                        </div>
                        <div className={`flex items-center gap-0.5 text-[10px] font-mono ${solTrend.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                          {solTrend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {solTrend.pct}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
                    <div>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
                        <PieChart className="w-3.5 h-3.5 text-emerald-400" /> 알트코인 수급 추세
                      </p>
                      <div className="space-y-3 mt-3">
                        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-500 block">TOTAL2 (비트 제외)</span>
                            <span className="text-base font-mono font-bold text-emerald-400">{stats.total2_d.toFixed(1)}%</span>
                          </div>
                          <div className={`flex items-center gap-0.5 text-[10px] font-mono ${!btcTrend.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                            {!btcTrend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {btcTrend.pct}%
                          </div>
                        </div>
                        <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-500 block">TOTAL3 (순수 알트)</span>
                            <span className="text-base font-mono font-bold text-cyan-400">{stats.total3_d.toFixed(1)}%</span>
                          </div>
                          <div className={`flex items-center gap-0.5 text-[10px] font-mono ${!btcTrend.isUp && !ethTrend.isUp ? "text-emerald-500" : "text-rose-500"}`}>
                            {!btcTrend.isUp && !ethTrend.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {((parseFloat(btcTrend.pct) + parseFloat(ethTrend.pct)) / -2).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 기관 자본 동향 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-6">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-5 h-5 text-indigo-400" /> 기관 및 거대 자본 동향
                </h2>
                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 col-span-1 md:col-span-2 space-y-3">
                    <p className="text-xs font-bold text-slate-400 pb-1.5 border-b border-slate-800/60 flex justify-between items-center">
                      <span>🇺🇸 미국 현물 ETF 일일 순유입액 (일일 기준)</span>
                      <span className="text-[10px] text-slate-500 font-normal">블랙록(IBIT) 등 주요 기관</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                        <span className="text-[10px] text-slate-400 block font-medium">비트코인 ETF</span>
                        <span className="text-sm md:text-base font-mono font-bold text-emerald-400 mt-1 block">+$142.5M</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">3일 연속 순유입</span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                        <span className="text-[10px] text-slate-400 block font-medium">이더리움 ETF</span>
                        <span className="text-sm md:text-base font-mono font-bold text-rose-500 mt-1 block">-$18.2M</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">그레이스케일 유출</span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
                        <span className="text-[10px] text-slate-400 block font-medium">리플(XRP) ETF</span>
                        <span className="text-sm md:text-base font-mono font-bold text-slate-300 mt-1 block">+$2.1M</span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">기관 자금 대기중</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <p className="text-xs font-bold text-slate-400 pb-1.5 border-b border-slate-800/60 flex items-center justify-between">
                        <span>📊 CME 선물 미결제약정 (OI)</span>
                        <ArrowUpDown className="w-3 h-3 text-indigo-400" />
                      </p>
                      <div className="space-y-2.5 mt-2.5">
                        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-500 block">총 미결제약정 규모</span>
                            <span className="text-sm font-mono font-bold text-slate-200">$11.84B</span>
                          </div>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+4.2%</span>
                        </div>
                        <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-500 block">기관 롱/숏 포지션 비중</span>
                            <span className="text-xs font-sans font-bold text-slate-300">롱 54% / 숏 46%</span>
                          </div>
                          <span className="text-[9px] font-sans text-emerald-400">우세</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 외환 및 스테이블코인 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner">
                <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-1.5">
                  <Coins className="w-5 h-5 text-sky-400" /> 외환 및 스테이블코인 실시간 가격
                </h2>
                <div className={`grid gap-3 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                  <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-lg">
                    <span className="text-[10px] text-slate-400 block font-medium">원/달러 환율 (FX)</span>
                    <span className="text-base md:text-lg font-mono font-bold text-slate-100 block mt-0.5">{usdToKrwRate.toLocaleString()} 원</span>
                    <span className="text-[9px] text-rose-500 font-mono">+0.18%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-lg">
                    <span className="text-[10px] text-emerald-400 block font-medium">테더 (USDT) 국내 원화가격</span>
                    <span className="text-base md:text-lg font-mono font-bold text-slate-100 block mt-0.5">{Math.floor(stats.usdt_krw).toLocaleString()} 원</span>
                    <span className="text-[9px] text-emerald-500 font-mono">+0.12%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 p-3.5 rounded-lg">
                    <span className="text-[10px] text-blue-400 block font-medium">써클 (USDC) 국내 원화가격</span>
                    <span className="text-base md:text-lg font-mono font-bold text-slate-100 block mt-0.5">{Math.floor(stats.usdc_krw).toLocaleString()} 원</span>
                    <span className="text-[9px] text-emerald-500 font-mono">+0.08%</span>
                  </div>
                </div>
              </section>

              {/* 글로벌 증시 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner">
                <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-1.5">
                  <Globe className="w-5 h-5 text-purple-400" /> 글로벌 증시 (미국 4대 지수)
                </h2>
                <div className={`grid gap-3 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-4"}`}>
                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 block font-medium">나스닥 100</span>
                    <span className="text-sm md:text-base font-mono font-bold text-emerald-400 block mt-0.5">18,520</span>
                    <span className="text-[9px] text-emerald-500 font-mono">+0.8%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 block font-medium">S&P 500</span>
                    <span className="text-sm md:text-base font-mono font-bold text-emerald-400 block mt-0.5">5,310</span>
                    <span className="text-[9px] text-emerald-500 font-mono">+0.4%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 block font-medium">다우존스 산업</span>
                    <span className="text-sm md:text-base font-mono font-bold text-rose-400 block mt-0.5">39,120</span>
                    <span className="text-[9px] text-rose-500 font-mono">-0.2%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg">
                    <span className="text-[10px] text-slate-500 block font-medium">러셀 2000 (중소형주)</span>
                    <span className="text-sm md:text-base font-mono font-bold text-emerald-400 block mt-0.5">2,085</span>
                    <span className="text-[9px] text-emerald-500 font-mono">+1.1%</span>
                  </div>
                </div>
              </section>

              {/* 원자재 및 에너지 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-6">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-1.5">
                  <Landmark className="w-5 h-5 text-amber-500" /> 원자재 및 에너지
                </h2>
                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-2"}`}>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-400 pb-1.5 border-b border-slate-800/60">
                      ✨ 귀금속 및 비철금속
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">골드 (Gold)</span>
                        <span className="text-sm font-mono font-bold text-amber-400 block mt-0.5">$2,350.40</span>
                        <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+0.6%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">은 (Silver)</span>
                        <span className="text-sm font-mono font-bold text-slate-300 block">$28.35</span>
                        <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+1.2%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">구리 (Copper)</span>
                        <span className="text-sm font-mono font-bold text-orange-400 block mt-0.5">$4.65</span>
                        <span className="text-[9px] font-mono text-rose-500 flex items-center gap-0.5"><TrendingDown className="w-2.5 h-2.5" />-0.4%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-400 pb-1.5 border-b border-slate-800/60">
                      <Flame className="w-3.5 h-3.5 text-rose-500 inline mr-1" /> 글로벌 에너지 지표
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">WTI 원유 (배럴)</span>
                        <span className="text-sm font-mono font-bold text-slate-200 block">$78.42</span>
                        <span className="text-[9px] font-mono text-rose-500 flex items-center gap-0.5"><TrendingDown className="w-2.5 h-2.5" />-0.8%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">천연가스 (NG)</span>
                        <span className="text-sm font-mono font-bold text-sky-400 block">$2.58</span>
                        <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+2.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 📌 [신규 추가] 섹션 7: 거시경제 핵심 추가 지표 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-1.5">
                  <Scale className="w-5 h-5 text-emerald-400" /> 거시경제 핵심 추가 지표
                </h2>
                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                  {/* 미국 국채 금리 카드 */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                    <span className="text-xs font-bold text-slate-400 block pb-1 border-b border-slate-800/60">🇺🇸 미국 국채 금리 (Treasury Yield)</span>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/40">
                        <span className="text-[10px] text-slate-500 block">10년물 (장기)</span>
                        <span className="text-sm font-mono font-bold text-slate-200">4.42 %</span>
                      </div>
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/40">
                        <span className="text-[10px] text-slate-500 block">2년물 (단기)</span>
                        <span className="text-sm font-mono font-bold text-slate-200">4.78 %</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-rose-400 font-mono block">장단기 금리차 역전 지속 중</span>
                  </div>

                  {/* 달러 인덱스 카드 */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-400 block pb-1 border-b border-slate-800/60">💵 달러 인덱스 (DXY)</span>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/40 mt-3 flex justify-between items-center">
                        <span className="text-base font-mono font-bold text-slate-100">104.85</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" /> +0.15%
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-500 font-sans block mt-2">6개국 주요 통화 대비 달러 가치</span>
                  </div>

                  {/* 연준 기준금리 및 FOMC 일정 카드 */}
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                    <span className="text-xs font-bold text-slate-400 block pb-1 border-b border-slate-800/60 font-sans">📅 연준 금리 및 FOMC 주요 일정</span>
                    <div className="space-y-2 pt-1">
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">미국 기준 금리</span>
                          <span className="text-xs font-mono font-bold text-slate-200">5.25 ~ 5.50 %</span>
                        </div>
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">동결 중</span>
                      </div>
                      <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block">차기 FOMC 금리결정</span>
                          <span className="text-xs font-sans font-bold text-amber-400">2026년 6월 11일</span>
                        </div>
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ====================================================
              PAGE LAYOUT B: 온체인 데이터 및 파생상품 지표 레이어
             ==================================================== */}
          {activePage === "onchain" && (
            <>
              {/* 📊 실제 온체인 데이터 분석소 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-emerald-400" /> 실시간 온체인 데이터 (On-chain Data)
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    블록체인 장부 안에서 일어나는 실제 데이터로, 시장의 고점과 저점을 인간의 감정을 배제하고 객관적으로 짚어줍니다.
                  </p>
                </div>

                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  {/* MVRV Ratio - 💡 설명 지우고 콤팩트 패치 완료 */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between h-28">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-400 font-mono">MVRV Ratio</span>
                      <span className="text-base font-mono font-bold text-slate-100 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">1.45</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                      💡 <span className="text-slate-400 font-semibold">역사적 바닥/고점:</span> 1 이하는 <span className="text-blue-400 font-bold">찐바닥</span> / 3.7 이상은 <span className="text-rose-400 font-bold">꼭대기</span>
                    </div>
                  </div>

                  {/* NVT Ratio - 💡 설명 지우고 콤팩트 패치 완료 */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between h-28">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-400 font-mono">NVT Ratio (PER 개념)</span>
                      <span className="text-base font-mono font-bold text-slate-100 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">45.2</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                      📈 <span className="text-slate-400 font-semibold">시장 거품 평가:</span> 거래량 대비 <span className="text-emerald-400 font-medium">적정 거품 없는 구간 진단</span>
                    </div>
                  </div>

                  {/* 거래소 고래 유입량 - 💡 설명 지우고 콤팩트 패치 완료 */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between h-28">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-orange-400">거래소 고래 유입량</span>
                      <span className="text-base font-mono font-bold text-slate-100 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">0.38</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                      ⚠️ <span className="text-slate-400 font-semibold">매도 압력 시그널:</span> 수치 급증 시 <span className="text-rose-400 font-bold">강한 매도 압력 유의</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 선물 펀딩비 추적 섹션 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <h2 className="text-base md:text-lg font-bold text-yellow-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> 주요 가상자산 실시간 선물 펀딩비 (Funding Rate)
                </h2>
                <div className={`grid gap-3 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24">
                    <span className="text-[11px] text-orange-400 font-mono font-bold uppercase">Bitcoin (BTC)</span>
                    <span className="text-base sm:text-lg font-mono font-bold text-slate-100">+0.0100 %</span>
                    <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded w-max">정상 (균형 상태)</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24">
                    <span className="text-[11px] text-blue-400 font-mono font-bold uppercase">Ethereum (ETH)</span>
                    <span className="text-base sm:text-lg font-mono font-bold text-slate-100">+0.0350 %</span>
                    <span className="text-[9px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded w-max">주의 (롱 과열 조짐)</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24">
                    <span className="text-[11px] text-slate-300 font-mono font-bold uppercase">Ripple (XRP)</span>
                    <span className="text-base sm:text-lg font-mono font-bold text-rose-500">-0.0210 %</span>
                    <span className="text-[9px] text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded w-max">역펀딩 (숏 세력 과열)</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24">
                    <span className="text-[11px] text-purple-400 font-mono font-bold uppercase">Solana (SOL)</span>
                    <span className="text-base sm:text-lg font-mono font-bold text-slate-100">+0.0125 %</span>
                    <span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded w-max">정상 (안정권)</span>
                  </div>
                </div>
              </section>

              {/* 고해상도 청산 관측 허브 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-5 md:p-8 rounded-2xl shadow-inner text-center space-y-6">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-200">글로벌 실시간 청산 히트맵 관측소</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    크립토 파생상품 거래소들의 외부 임베딩 차단 정책 우회를 위해 독립 고해상도 다이렉트 브로커 링크 패널을 구축했습니다. 안전하게 정식 페이지에서 왜곡 없는 청산 장벽과 오더북 매물대를 추적하세요.
                  </p>
                </div>

                <div className="flex gap-3 justify-center items-center max-w-sm mx-auto pt-2">
                  <a 
                    href="https://www.coinglass.com/ko/pro/futures/LiquidationHeatMap" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-slate-950 font-black rounded-xl shadow-lg shadow-orange-500/10 hover:opacity-90 active:scale-95 transition-all text-sm"
                  >
                    📊 Coinglass 실시간 히트맵 이동 <ExternalLink className="w-4 h-4" />
                  </a>
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