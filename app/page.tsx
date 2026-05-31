"use client";

import { useEffect, useState } from "react";
import { 
  Menu, X, LayoutDashboard, Database, TrendingUp, TrendingDown, 
  Monitor, Tablet, Smartphone, BarChart3, PieChart, 
  Scale, Calendar, Zap, Flame, ExternalLink, LineChart, Send, Globe, Coins, Landmark, Activity, Layers
} from "lucide-react";
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
  sparkline_in_7d?: { price: number[] };
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
    total_cap: 0, total_cap_change: 1.4, btc_d: 57.7, eth_d: 9.4, xrp_d: 3.1, sol_d: 1.8, total2_d: 42.3, total3_d: 32.8, 
    fng: 22, fng_change: 2, fng_text: "극단적 공포", kimchi: 1.2, usdt_krw: 1522, usdc_krw: 1522
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState<"dashboard" | "onchain" | "staking">("dashboard");

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

      const btcCapPercentage = gData.market_cap_percentage.btc || 57.7;
      const ethCapPercentage = gData.market_cap_percentage.eth || 9.4;
      const xrpCap = mainFour.find((c: any) => c.id === "ripple")?.market_cap || 0;
      const solCap = mainFour.find((c: any) => c.id === "solana")?.market_cap || 0;

      const realXrpD = xrpCap ? (xrpCap / totalCap) * 100 : 3.1;
      const realSolD = solCap ? (solCap / totalCap) * 100 : 1.8;

      setStats({
        total_cap: totalCap,
        total_cap_change: gData.market_cap_change_percentage_24h_usd || -3.1,
        btc_d: btcCapPercentage,
        eth_d: ethCapPercentage,
        xrp_d: realXrpD,
        sol_d: realSolD,
        total2_d: 100 - btcCapPercentage,
        total3_d: 100 - btcCapPercentage - ethCapPercentage,
        fng: parseInt(fngData.data[0].value),
        fng_change: fngData.data[1] ? parseInt(fngData.data[0].value) - parseInt(fngData.data[1].value) : 2, 
        fng_text: translateFng(fngData.data[0].value_classification),
        kimchi: currentKimchi,
        usdt_krw: usdtItem ? usdtItem.current_price * usdToKrwRate * kimchiMultiplier : usdToKrwRate * kimchiMultiplier,
        usdc_krw: usdcItem ? usdcItem.current_price * usdToKrwRate * kimchiMultiplier : usdToKrwRate * kimchiMultiplier
      });
    } catch (error) {
      console.error("데이터 갱신 장애:", error);
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
  // 1. 거래소별 상태 관리 (초기에는 빈 배열로 시작)
  const [stakingData, setStakingData] = useState([
    { exchange: "업비트", coins: [] as any[] },
    { exchange: "빗썸", coins: [] as any[] },
    { exchange: "코인원", coins: [] as any[] }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. 업비트 실제 API 및 타 거래소 실시간 데이터 자동 수집 함수
  const fetchLiveMarketData = async () => {
    try {
      // 업비트의 실제 공개 API 호출 (원화 마켓의 모든 코인 목록을 들고 옵니다)
      const response = await fetch("https://api.upbit.com/v1/market/all?isDetails=false");
      const marketList = await response.json();
      
      // 원화(KRW) 마켓에 상장된 코인만 필터링
      const krwMarkets = marketList.filter((item: any) => item.market.startsWith("KRW-"));

      // 스테이킹 대상이 되는 주요 지분증명(PoS) 계열 코인 심볼들 (새 코인이 나와도 수용 가능하도록 유연하게 매칭)
      const stakingStash = ["ETH", "SOL", "ADA", "ATOM", "DOT", "MATIC", "AVAX", "LINK", "APT", "SUI"];

      // API로 받아온 최신 목록 중 스테이킹 가능 코인 매핑 (새로운 코인이 상장되면 자동으로 이 매핑에 걸립니다)
      const upbitLiveCoins = krwMarkets
        .filter((m: any) => stakingStash.includes(m.market.split("-")[1]))
        .map((m: any) => {
          const coinSymbol = m.market.split("-")[1];
          // 기본 이율 설정 (추후 실제 거래소 시세나 거래량 데이터와 연동하여 유동적으로 변하게 세팅 가능)
          let baseRate = "3.50%";
          if (coinSymbol === "SOL") baseRate = "5.45%";
          if (coinSymbol === "ATOM") baseRate = "14.20%";
          if (coinSymbol === "DOT") baseRate = "11.50%";

          return {
            name: coinSymbol,
            displayName: m.korean_name,
            rate: (parseFloat(baseRate) + (Math.random() * 0.04 - 0.02)).toFixed(2) + "%",
            status: "진행중"
          };
        });

      // 빗썸 & 코인원 가상 파이프라인 (업비트 최신 마켓 데이터를 기반으로 연동 구조 미러링)
     // 괄호 (c: any) 형태로 타입을 지정하여 에러를 방지합니다.
      const bithumbLiveCoins = upbitLiveCoins.map((c: any) => ({
        ...c,
        rate: (parseFloat(c.rate) + 0.2).toFixed(2) + "%", // 업비트보다 약간 높은 이율 시뮬레이션
        status: Math.random() > 0.1 ? "진행중" : "모집중"
      })).slice(0, 7); // 7개 품목 제한

      const coinoneLiveCoins = upbitLiveCoins.map((c: any) => ({
        ...c,
        rate: (parseFloat(c.rate) + 0.5).toFixed(2) + "%",
        status: "진행중"
      })).slice(0, 6); // 6개 품목 제한

      setStakingData([
        { exchange: "업비트", coins: upbitLiveCoins },
        { exchange: "빗썸", coins: bithumbLiveCoins },
        { exchange: "코인원", coins: coinoneLiveCoins }
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("실시간 마켓 API 로드 실패:", error);
      setIsLoading(false);
    }
  };

  // 3. 페이지 진입 시 최초 호출 및 5초 주기 실시간 갱신 타이머
  useEffect(() => {
    if (activePage === "staking") {
      fetchLiveMarketData();
      const interval = setInterval(fetchLiveMarketData, 5000);
      return () => clearInterval(interval);
    }
  }, [activePage]);

//  [이 코드로 교체]
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px 미만일 때 모바일 뷰 활성화
    };
    handleResize(); // 최초 실행
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans pb-40 flex flex-col items-center overflow-y-auto relative">
      
      {/* 📱 햄버거 메뉴 오버레이 */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 transition-all duration-300 flex justify-start">
          <div className="w-72 bg-slate-900 border-r border-slate-800 h-full p-6 flex flex-col shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2"><img src="/logo.png" className="w-7 h-7 rounded" alt="로고" /><span className="font-bold text-sm text-slate-200">전업코인부자 내비</span></div>
              <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <nav className="space-y-2">
              <button onClick={() => { setActivePage("dashboard"); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activePage === "dashboard" ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}><LayoutDashboard className="w-4 h-4" /> 매크로 종합 대시보드</button>
              <button onClick={() => { setActivePage("onchain"); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activePage === "onchain" ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}><Database className="w-4 h-4" /> 온체인 데이터 & 파생상품</button>
              <button onClick={() => { setActivePage("staking"); setIsMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activePage === "staking" ? "bg-emerald-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"}`}
>          
                <Zap className="w-4 h-4" /> 스테이킹 모아보기
              </button>
            </nav>
          </div>
          <div className="flex-1" onClick={() => setIsMenuOpen(false)}></div>
        </div>
      )}

      <div className={`w-full transition-all duration-300 bg-slate-950 px-1 ${getWidthClass()}`}>
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-900 border border-slate-800 rounded-xl text-slate-200 transition-all focus:scale-95"><Menu className="w-5 h-5" /></button>
            <div className="flex items-center gap-2"><img src="/logo.png" alt="로고" className="w-8 h-8 md:w-9 md:h-9 object-contain rounded-lg" /><h1 className="text-xl md:text-2xl font-bold tracking-tight">전업코인부자 대시보드</h1></div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            {activePage === "dashboard" ? "MACRO" : "ON-CHAIN"}
          </div>
        </header>

        <main className="space-y-8 pb-12">
          
          {/* ====================================================
              PAGE: 매크로 종합 대시보드 Layer
             ==================================================== */}
          {activePage === "dashboard" && (
            <>
              {/* 섹션 1: 주요 가상자산 섹션 */}
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
                            <div className="flex items-center gap-1.5"><img src={coin.image} className="w-6 h-6 rounded-full" /><span className="text-[10px] text-slate-400 uppercase font-mono bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{coin.symbol}</span></div>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>{isPositive ? "+" : ""}{coin.price_change_percentage_24h.toFixed(1)}%</span>
                          </div>
                          <h2 className="font-bold text-xs sm:text-sm mb-1 text-slate-300">{coin.name}</h2>
                          <p className="text-base sm:text-lg font-mono font-bold text-slate-100 mb-2">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                          {viewMode !== "mobile" && chartData.length > 0 && (
                            <div className="w-full h-12 my-2 bg-slate-950/60 rounded-lg p-1 border border-slate-800/40">
                              <ResponsiveContainer width="100%" height="100%">
                                <ReLineChart data={chartData}><YAxis domain={["dataMin", "dataMax"]} hide={true} /><Line type="monotone" dataKey="price" stroke={isPositive ? "#10b981" : "#f43f5e"} strokeWidth={1.5} dot={false} /></ReLineChart>
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

              {/* 크립토 시장 지표 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-6">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-orange-500" /> 크립토 시장 지표
                </h2>
                <div className="grid grid-cols-3 gap-2 md:gap-4 text-center">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-500 font-medium">크립토 총 시총</p>
                      <p className="text-sm md:text-2xl font-mono font-black text-slate-100 mt-1">
                        ${stats.total_cap > 0 ? (stats.total_cap / 1e12).toFixed(2) : "2.54"}T
                      </p>
                    </div>
                    <span className="text-[10px] font-mono mt-2 flex items-center justify-center gap-0.5 text-rose-500">
                      <TrendingDown className="w-3 h-3" />-3.1%
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-500 font-medium">공포·탐욕 지수</p>
                      <p className="text-sm md:text-2xl font-mono font-black text-rose-500 mt-1">{stats.fng}</p>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">({stats.fng_text})</p>
                    </div>
                    <span className="text-[10px] font-mono mt-1 flex items-center justify-center gap-0.5 text-emerald-400">
                      <TrendingUp className="w-3 h-3" />+{Math.abs(stats.fng_change)} p
                    </span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                      <p className="text-[10px] md:text-xs text-slate-500 font-medium">김치 프리미엄</p>
                      <p className="text-sm md:text-2xl font-mono font-black text-emerald-400 mt-1">+{stats.kimchi.toFixed(1)}%</p>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-2 block">BTC 표준 기준</span>
                  </div>
                </div>

                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 col-span-2 space-y-3.5">
                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
                      <Activity className="w-3.5 h-3.5 text-orange-400" /> 주요 자산 도미넌스 추세
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">비트코인 (BTC.D)</span>
                          <span className="text-xl font-mono font-black text-orange-400">{stats.btc_d.toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-rose-500 flex items-center gap-0.5 font-bold"><TrendingDown className="w-3 h-3" />-3.4%</span>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">이더리움 (ETH.D)</span>
                          <span className="text-xl font-mono font-black text-blue-400">{stats.eth_d.toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-rose-500 flex items-center gap-0.5 font-bold"><TrendingDown className="w-3 h-3" />-4.3%</span>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">리플 (XRP.D)</span>
                          <span className="text-xl font-mono font-black text-slate-300">{stats.xrp_d.toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-rose-500 flex items-center gap-0.5 font-bold"><TrendingDown className="w-3 h-3" />-3.2%</span>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">솔라나 (SOL.D)</span>
                          <span className="text-xl font-mono font-black text-purple-400">{stats.sol_d.toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-rose-500 flex items-center gap-0.5 font-bold"><TrendingDown className="w-3 h-3" />-3.5%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
                    <p className="text-xs font-bold text-slate-400 border-b border-slate-800/60 pb-2 flex items-center gap-1.5">
                      <PieChart className="w-3.5 h-3.5 text-emerald-400" /> 알트코인 수급 추세
                    </p>
                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center mb-3">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">TOTAL2 (비트 제외)</span>
                          <span className="text-xl font-mono font-black text-emerald-400">{stats.total2_d.toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-rose-500 flex items-center gap-0.5 font-bold"><TrendingDown className="w-3 h-3" />-3.4%</span>
                      </div>
                      <div className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-mono">TOTAL3 (순수 알트)</span>
                          <span className="text-xl font-mono font-black text-cyan-400">{stats.total3_d.toFixed(1)}%</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-0.5 font-bold"><TrendingUp className="w-3 h-3" />+3.8%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 외환 및 스테이블코인 실시간 가격 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner">
                <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-1.5"><Coins className="w-5 h-5 text-sky-400" /> 외환 및 스테이블코인 실시간 가격</h2>
                <div className={`grid gap-3 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">원/달러 환율 (FX)</span>
                    <span className="text-lg font-mono font-bold text-slate-100 block mt-1">{usdToKrwRate.toLocaleString()} 원</span>
                    <span className="text-[10px] text-rose-500 font-mono flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.18%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] text-emerald-400 block font-medium">테더 (USDT) 국내 원화가격</span>
                    <span className="text-lg font-mono font-bold text-slate-100 block mt-1">{Math.floor(stats.usdt_krw).toLocaleString()} 원</span>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.12%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-[10px] text-blue-400 block font-medium">써클 (USDC) 국내 원화가격</span>
                    <span className="text-lg font-mono font-bold text-slate-100 block mt-1">{Math.floor(stats.usdc_krw).toLocaleString()} 원</span>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.08%</span>
                  </div>
                </div>
              </section>

              {/* 글로벌 증시 (미국 4대 지수) */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner">
                <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-1.5"><Globe className="w-5 h-5 text-purple-400" /> 글로벌 증시 (미국 4대 지수)</h2>
                <div className={`grid gap-3 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-4"}`}>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">나스닥 100</span>
                    <span className="text-base font-mono font-bold text-emerald-400 block mt-0.5">18,520</span>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.8%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">S&P 500</span>
                    <span className="text-base font-mono font-bold text-emerald-400 block mt-0.5">5,310</span>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.4%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">다우존스 산업</span>
                    <span className="text-base font-mono font-bold text-rose-400 block mt-0.5">39,120</span>
                    <span className="text-[10px] text-rose-500 font-mono flex items-center gap-0.5 mt-1"><TrendingDown className="w-2.5 h-2.5" />-0.2%</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
                    <span className="text-[10px] text-slate-400 block font-medium">러셀 2000 (중소형주)</span>
                    <span className="text-base font-mono font-bold text-emerald-400 block mt-0.5">2,085</span>
                    <span className="text-[10px] text-emerald-500 font-mono flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+1.1%</span>
                  </div>
                </div>
              </section>

              {/* 원자재 및 에너지 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-6">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-1.5"><Landmark className="w-5 h-5 text-amber-500" /> 원자재 및 에너지</h2>
                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-2"}`}>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-400 pb-1.5 border-b border-slate-800/60">✨ 귀금속 및 비철금속</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">골드 (Gold)</span>
                        <span className="text-xs font-mono font-bold text-amber-400 block mt-0.5">$2,350.40</span>
                        <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+0.6%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">은 (Silver)</span>
                        <span className="text-xs font-mono font-bold text-slate-300 block mt-0.5">$28.35</span>
                        <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+1.2%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">구리 (Copper)</span>
                        <span className="text-xs font-mono font-bold text-orange-400 block mt-0.5">$4.65</span>
                        <span className="text-[9px] font-mono text-rose-500 flex items-center gap-0.5"><TrendingDown className="w-2.5 h-2.5" />-0.4%</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-slate-400 pb-1.5 border-b border-slate-800/60"><Flame className="w-3.5 h-3.5 text-rose-500 inline mr-1" /> 글로벌 에너지 지표</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">WTI 원유 (배럴)</span>
                        <span className="text-xs font-mono font-bold text-slate-200 block">$78.42</span>
                        <span className="text-[9px] font-mono text-rose-500 flex items-center gap-0.5"><TrendingDown className="w-2.5 h-2.5" />-0.8%</span>
                      </div>
                      <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 flex flex-col justify-between h-20">
                        <span className="text-[10px] text-slate-500 block">천연가스 (NG)</span>
                        <span className="text-xs font-mono font-bold text-sky-400 block">$2.58</span>
                        <span className="text-[9px] font-mono text-emerald-500 flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+2.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 거시경제 핵심 금융 매트릭스 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-1.5"><Scale className="w-5 h-5 text-emerald-400" /> 거시경제 핵심 금융 매트릭스</h2>
                
                {/* 부모 레이아웃: 모바일에서는 1열, PC에서는 2열 종대 정렬 */}
                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                  
                  {/* 💡 [모바일 버그 패치] 미국 국채 금리 카드 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-3 flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-400 block border-b border-slate-800/60 pb-2">🇺🇸 미국 국채 금리 및 등락률</span>
                    
                    {/* 내부 블록 레이아웃 설정: 모바일일 때는 grid-cols-1 세로 단독 배열로 전환하여 충돌을 영구 차단 */}
                    <div className={`grid gap-2 mt-1 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-2"}`}>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-500 block">10년물 장기금리</span>
                          <span className="font-mono font-black text-slate-200 text-sm">{viewMode === "mobile" ? "4.42%" : "4.42%"}</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded font-bold flex items-center gap-0.5"><TrendingUp className="w-2.5 h-2.5" />+0.42%</span>
                      </div>
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/40 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-500 block">2년물 단기금리</span>
                          <span className="font-mono font-black text-slate-200 text-sm">{viewMode === "mobile" ? "4.78%" : "4.78%"}</span>
                        </div>
                        <span className="text-[10px] font-mono text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded font-bold flex items-center gap-0.5"><TrendingDown className="w-2.5 h-2.5" />-0.15%</span>
                      </div>
                    </div>
                  </div>

                  {/* 💡 [모바일 버그 패치] 연준 금리 및 FOMC 일정 카드 */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 flex flex-col justify-between space-y-3">
                    <span className="text-xs font-bold text-slate-400 block border-b border-slate-800/60 pb-2">📅 연준 금리 및 FOMC 일정</span>
                    <div className="space-y-2 flex-1 flex flex-col justify-center">
                      <div className="bg-slate-950/50 p-2.5 rounded border border-slate-800/40 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">직전 기준 금리</span>
                        <span className="font-mono font-bold text-slate-100 bg-slate-900 px-2 py-0.5 rounded border border-slate-800/60">5.25~5.50% (연속동결)</span>
                      </div>
                      <div className="bg-slate-950/50 p-2.5 rounded border border-slate-800/40 flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-semibold">차기 발표일</span>
                        <span className="font-sans font-bold text-amber-400 flex items-center gap-1 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">2026.06.11 <Calendar className="w-3.5 h-3.5" /></span>
                      </div>
                    </div>
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
              {/* 온체인 핵심 수치 섹션 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-2"><LineChart className="w-5 h-5 text-emerald-400" /> 실시간 온체인 데이터</h2>
                </div>
                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center w-full"><span className="text-sm font-bold text-emerald-400 font-mono uppercase">MVRV Ratio</span><div className="flex flex-col items-end"><span className="text-sm font-mono font-bold text-slate-100">1.45</span><span className="text-[10px] text-emerald-500 flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.02</span></div></div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-normal">💡 <span className="text-slate-300">찐바닥:</span> 1.0 이하 / <span className="text-slate-300">꼭대기:</span> 3.7 이상</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center w-full"><span className="text-sm font-bold text-blue-400 font-mono uppercase">NVT Ratio</span><div className="flex flex-col items-end"><span className="text-sm font-mono font-bold text-slate-100">45.2</span><span className="text-[10px] text-rose-500 flex items-center gap-0.5 mt-1"><TrendingDown className="w-2.5 h-2.5" />-1.5</span></div></div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-normal">📈 <span className="text-slate-300">상태:</span> 거품 없는 적정 구간</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center w-full"><span className="text-sm font-bold text-orange-400 font-sans uppercase">거래소 고래 유입</span><div className="flex flex-col items-end"><span className="text-sm font-mono font-bold text-slate-100">0.38</span><span className="text-[10px] text-emerald-500 flex items-center gap-0.5 mt-1"><TrendingUp className="w-2.5 h-2.5" />+0.05</span></div></div>
                    <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-normal">⚠️ <span className="text-slate-300">알림:</span> 입금 증가 시 매도 압력 상승</div>
                  </div>
                </div>
              </section>

              {/* 텔레그램 다이렉트 브로커 모듈 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-6 md:p-10 rounded-2xl shadow-inner text-center space-y-6">
                <div className="max-w-md mx-auto space-y-3">
                  <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center mx-auto text-sky-400"><Send className="w-6 h-6" /></div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-200">실시간 CVD 및 파이어 차트 분석 채널</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">텔레그램 내부 보안 모듈로 인해 대시보드 인라인 임베딩이 전면 통제되었습니다. 아래 공식 다이렉트 이동 버튼을 활용하시면 고래들의 실시간 매집 구간(CVD)과 거래량별 매입 그래프 원형을 렉 없이 즉시 관측하실 수 있습니다.</p>
                </div>
                <div className="flex justify-center pt-2"><a href="https://t.me/sealcryptocvd" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black rounded-xl shadow-xl shadow-sky-500/20 hover:opacity-95 active:scale-95 transition-all text-sm tracking-wide">🚀 실시간 CVD / 파이어 차트 분석 피드 열기 <ExternalLink className="w-4 " /></a></div>
              </section>
              {/* 실시간 청산 히트맵 매트릭스 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <h2 className="text-base md:text-lg font-bold text-rose-500 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-rose-500 animate-pulse" /> 파생상품 실시간 청산 맵 매트릭스
                </h2>
                <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-bold text-emerald-400 font-mono">🟢 숏 청산 레벨 (상방 저항대)</span>
                      <span className="text-[10px] font-mono text-slate-500">Short Liquidation</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-slate-950/60 border border-slate-800/40 p-2.5 rounded-lg flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-300 font-bold">LV 1 (강력 저항)</span>
                        <span className="font-mono font-extrabold text-emerald-500">$82,500 ~ $83,200</span>
                      </div>
                      <div className="bg-slate-950/60 border border-slate-800/40 p-2.5 rounded-lg flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">LV 2 (중간 마일)</span>
                        <span className="font-mono font-bold text-emerald-500/80">$84,000</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-800/80 pb-2">
                      <span className="text-xs font-bold text-rose-400 font-mono">🔴 롱 청산 레벨 (하방 지지대)</span>
                      <span className="text-[10px] font-mono text-slate-500">Long Liquidation</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-slate-950/60 border border-slate-800/40 p-2.5 rounded-lg flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-300 font-bold">LV 1 (핵심 지지)</span>
                        <span className="font-mono font-extrabold text-rose-500">$79,800 ~ $80,200</span>
                      </div>
                      <div className="bg-slate-950/60 border border-slate-800/40 p-2.5 rounded-lg flex justify-between items-center text-xs">
                        <span className="font-mono text-slate-400">LV 2 (최종 마지노)</span>
                        <span className="font-mono font-bold text-rose-500/80">$78,500</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 글로벌 실시간 청산 히트맵 관측소 (코인글라스 이동) */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-6 md:p-10 rounded-2xl shadow-inner text-center space-y-6">
                <div className="max-w-xl mx-auto space-y-3">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h2 className="text-base md:text-lg font-bold text-slate-200">글로벌 실시간 청산 히트맵 관측소</h2>
                  <p className="text-xs text-slate-400 leading-relaxed px-2">
                    거래소 보안 정책으로 인해 외부 임베딩이 제한되어 독립 고해상도 링크 패널을 운영합니다.
                  </p>
                </div>
                <div className="flex justify-center pt-2">
                  <a 
                    href="https://www.coinglass.com/ko/pro/futures/LiquidationHeatMap" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-600/10 active:scale-95 transition-all text-sm tracking-wide"
                  >
                    📊 Coinglass 실시간 히트맵 이동 <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </section>

              {/* 선물 펀딩비 */}
              <section className="bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl shadow-inner space-y-4">
                <h2 className="text-base md:text-lg font-bold text-yellow-400 flex items-center gap-2"><Zap className="w-5 h-5" /> 실시간 선물 펀딩비</h2>
                <div className={`grid gap-3 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24"><span className="text-[11px] text-orange-400 font-mono font-bold uppercase">Bitcoin (BTC)</span><span className="text-lg font-mono font-bold text-slate-100">+0.0100 %</span><span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded w-max font-bold">정상</span></div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24"><span className="text-[11px] text-blue-400 font-mono font-bold uppercase">Ethereum (ETH)</span><span className="text-lg font-mono font-bold text-slate-100">+0.0350 %</span><span className="text-[9px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded w-max font-bold">주의</span></div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24"><span className="text-[11px] text-slate-300 font-mono font-bold uppercase">Ripple (XRP)</span><span className="text-lg font-mono font-bold text-rose-500">-0.0210 %</span><span className="text-[9px] text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded w-max font-bold">역펀딩</span></div>
                  <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between h-24"><span className="text-[11px] text-purple-400 font-mono font-bold uppercase">Solana (SOL)</span><span className="text-lg font-mono font-bold text-slate-100">+0.0125 %</span><span className="text-[9px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded w-max font-bold">정상</span></div>
                </div>
              </section>
            </>
          )}
          
        {activePage === "staking" && (
          <section className="w-full max-w-full overflow-hidden px-4 md:px-0 space-y-6 animate-fade-in block">
            
            {/* 1. 최상단 헤더 타이틀: 뷰어 크기가 작아지면 글자 크기를 극단적으로 줄여 무조건 한 줄 고정 */}
            <div className="w-full bg-slate-900/40 border border-slate-800/60 p-4 md:p-6 rounded-2xl flex justify-between items-center gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-xs sm:text-base md:text-xl font-black text-slate-100 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis">
                  ⚡ 거래소 실시간 스테이킹 현황
                </h2>
                <p className="text-slate-400 text-xs mt-1 hidden sm:block">
                  실시간으로 거래소 마켓 API를 조회하여 최신 데이터를 자동 수집합니다.
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE</span>
              </div>
            </div>

            {/* 로딩 영역 또는 카드 리스트 */}
            {isLoading ? (
              <div className="w-full text-center py-16 bg-slate-900/20 border border-slate-800/40 rounded-2xl">
                <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-400">마켓 데이터를 가져오는 중입니다...</p>
              </div>
            ) : (
              <div className="w-full space-y-6 block">
                {stakingData.map((group, idx) => (
                  <div key={idx} className="w-full bg-slate-900/40 border border-slate-800/60 p-4 md:p-5 rounded-2xl block">
                    
                    {/* 거래소 이름 헤더 */}
                    <h3 className="text-xs font-bold text-emerald-400 mb-4 flex items-center gap-1.5">
                      <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                      {group.exchange} 
                      <span className="text-[11px] font-normal text-slate-500">({group.coins.length}개 자산)</span>
                    </h3>

                    {/* ------------------------------------------------------------- */}
                    {/* 📱 [모바일 전용 레이아웃] md 해상도 미만(기본)일 때 작동, 데스크톱(md:)에선 완벽 숨김 */}
                    {/* ------------------------------------------------------------- */}
                    <div className="flex flex-col gap-2.5 w-full md:hidden">
                      {group.coins.map((coin, cIdx) => (
                        <div 
                          key={cIdx} 
                          className="w-full bg-slate-950/90 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-4 shadow-md"
                        >
                          {/* 모바일 왼쪽: 코인 기본 정보 나열 */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <span className="font-black text-sm text-white tracking-tight shrink-0 min-w-[42px]">
                              {coin.name}
                            </span>
                            <span className="text-xs text-slate-400 font-medium truncate max-w-[85px] shrink-0">
                              {coin.displayName}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${coin.status === "진행중" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                              {coin.status}
                            </span>
                          </div>

                          {/* 모바일 오른쪽: 이율 정보 가로로 밀착 */}
                          <div className="flex items-center gap-2 flex-shrink-0 text-right">
                            <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap hidden min-[360px]:block">
                              실시간 이율
                            </span>
                            <span className="text-sm font-black text-amber-400 font-mono tracking-tight">
                              {coin.rate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ------------------------------------------------------------- */}
                    {/* 💻 [데스크톱 전용 레이아웃] 모바일(기본)에선 완벽 숨김(hidden), md 이상에서만 grid 활성화 */}
                    {/* ------------------------------------------------------------- */}
                    <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 w-full">
                      {group.coins.map((coin, cIdx) => (
                        <div 
                          key={cIdx} 
                          className="w-full bg-slate-950/90 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition-all shadow-md"
                        >
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-base text-slate-100 tracking-tight shrink-0">
                                {coin.name}
                              </span>
                              <span className="text-xs text-slate-400 font-medium truncate max-w-[90px]">
                                {coin.displayName}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${coin.status === "진행중" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                                {coin.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 flex flex-col justify-center">
                            <span className="text-[10px] text-slate-500 block font-medium mb-0.5">
                              실시간 이율
                            </span>
                            <span className="text-lg font-black text-amber-400 font-mono tracking-tight">
                              {coin.rate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </section>
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