"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Monitor, Smartphone, Globe, Landmark, BarChart3, Activity, PieChart } from "lucide-react";

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
  btc_d: number;
  eth_d: number;
  xrp_d: number;
  sol_d: number;
  total2_d: number;
  total3_d: number;
  fng: number;
  fng_text: string;
  kimchi: number;
}

export default function CryptoDashboard() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [stats, setStats] = useState<MarketStats>({
    total_cap: 0, btc_d: 0, eth_d: 0, xrp_d: 0, sol_d: 0, total2_d: 0, total3_d: 0, fng: 50, fng_text: "로딩중", kimchi: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // 💡 영어 상태값을 깔끔한 한글로 번역해주는 헬퍼 함수 (모바일 잘림 방지)
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
      const coinRes = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,ripple,solana&order=market_cap_desc");
      const coinData = await coinRes.json();
      setCoins(coinData);

      const globalRes = await fetch("https://api.coingecko.com/api/v3/global");
      const globalData = await globalRes.json();
      const gData = globalData.data;

      const fngRes = await fetch("https://api.alternative.me/fng/");
      const fngData = await fngRes.json();

      const totalCap = gData.total_market_cap.usd;
      const btcD = gData.market_cap_percentage.btc;
      const ethD = gData.market_cap_percentage.eth;
      
      const xrp = coinData.find((c: any) => c.id === "ripple");
      const sol = coinData.find((c: any) => c.id === "solana");
      const xrpD = xrp ? (xrp.market_cap / totalCap) * 100 : 0;
      const solD = sol ? (sol.market_cap / totalCap) * 100 : 0;

      setStats({
        total_cap: totalCap,
        btc_d: btcD,
        eth_d: ethD,
        xrp_d: xrpD,
        sol_d: solD,
        total2_d: 100 - btcD,
        total3_d: 100 - btcD - ethD,
        fng: parseInt(fngData.data[0].value),
        fng_text: translateFng(fngData.data[0].value_classification), // 한글 적용
        kimchi: 1.5
      });
    } catch (error) {
      console.error("Data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getWidthClass = () => {
    if (viewMode === "mobile") return "max-w-[390px] min-h-[844px] border-x border-slate-800 shadow-2xl overflow-y-auto mb-20"; 
    return "max-w-7xl"; 
  };

  // 코인 개별 24h 변동률을 기준으로 도미넌스 추세를 유추하기 위한 매핑용 도우미
  const getCoinTrend = (id: string) => {
    const coin = coins.find(c => c.id === id);
    if (!coin) return { isUp: true, pct: "0.0" };
    return { isUp: coin.price_change_percentage_24h >= 0, pct: coin.price_change_percentage_24h.toFixed(1) };
  };

  const btcTrend = getCoinTrend("bitcoin");
  const ethTrend = getCoinTrend("ethereum");
  const xrpTrend = getCoinTrend("ripple");
  const solTrend = getCoinTrend("solana");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans pb-40 flex flex-col items-center overflow-y-auto">
      <div className={`w-full transition-all duration-300 bg-slate-950 px-1 ${getWidthClass()}`}>
        
        {/* 헤더 */}
        <header className="flex justify-between items-center mb-6 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/logo.png" alt="로고" className="w-8 h-8 md:w-9 md:h-9 object-contain rounded-lg" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">전업코인부자 대시보드</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            LIVE
          </div>
        </header>

        <main className="space-y-10 pb-12">
          
          {/* 섹션 1: 주요 가상자산 */}
          <section>
            <h2 className="text-base md:text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              📊 주요 가상자산
            </h2>
            <div className={`grid gap-3 md:gap-4 ${viewMode === "mobile" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}>
              {coins.map((coin) => (
                <div key={coin.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-xl flex flex-col justify-between">
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
                  <div className="grid grid-cols-2 gap-1 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                    <div>시총 <span className="block text-slate-400 font-mono">${(coin.market_cap / 1e9).toFixed(1)}B</span></div>
                    <div>거래 <span className="block text-slate-400 font-mono">${(coin.total_volume / 1e9).toFixed(1)}B</span></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 섹션 2: 크립토 시장 지표 */}
          <section className="space-y-6">
            <h2 className="text-base md:text-lg font-bold text-slate-200 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" /> 크립토 시장 지표
            </h2>

            {/* 그룹 A: 시장 기본 지표 (공포탐욕지수 한글화 패치 완료) */}
            <div className="grid grid-cols-3 gap-2 md:gap-4 text-center xs:text-left">
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
                <p className="text-[9px] md:text-xs text-slate-500 font-medium">크립토 총 시총</p>
                <p className="text-xs md:text-xl font-mono font-bold text-slate-100 mt-1">${(stats.total_cap / 1e12).toFixed(2)}T</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
                <p className="text-[9px] md:text-xs text-slate-500 font-medium">공포·탐욕 지수</p>
                <p className={`text-xs md:text-base lg:text-xl font-mono font-bold mt-1 ${stats.fng >= 60 ? 'text-emerald-500' : stats.fng <= 40 ? 'text-rose-500' : 'text-yellow-500'}`}>
                  {stats.fng} <span className="block xs:inline text-[9px] md:text-xs font-sans font-normal text-slate-400">({stats.fng_text})</span>
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl shadow-lg">
                <p className="text-[9px] md:text-xs text-slate-500 font-medium">김치 프리미엄</p>
                <p className="text-xs md:text-xl font-mono font-bold text-emerald-400 mt-1">+{stats.kimchi.toFixed(1)}%</p>
              </div>
            </div>

            {/* 그룹 B: 도미넌스 컴팩트 묶음 (상승/하락 추세 추적 장치 탑재) */}
            <div className={`grid gap-4 ${viewMode === "mobile" ? "grid-cols-1" : "grid-cols-3"}`}>
              
              {/* 주요 자산 도미넌스 (추세 화살표 탑재) */}
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

              {/* 알트코인 마켓 캡 비중 추세 (TOTAL2, TOTAL3 추세 탑재) */}
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

          {/* 섹션 3: 글로벌 증시 */}
          <section className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mb-4">
              <Globe className="w-4 h-4 text-purple-400" /> 글로벌 증시 (미국 4대 지수)
            </h3>
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

          {/* 섹션 4: 외환 및 원자재 */}
          <section className="bg-slate-900/40 border border-slate-800/60 p-4 rounded-xl">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 mb-4">
              <Landmark className="w-4 h-4 text-blue-400" /> 외환 및 주요 원자재
            </h3>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg">
                <span className="text-slate-500 block">달러 인덱스 (DXY)</span>
                <span className="text-base font-mono font-bold text-slate-200 mt-0.5 block">104.2</span>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg">
                <span className="text-slate-500 block">국제 금 (GOLD)</span>
                <span className="text-base font-mono font-bold text-amber-400 mt-0.5 block">$2,350</span>
              </div>
            </div>
          </section>

        </main>
      </div>

      {/* 하단 제어 바 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl z-50">
        <button onClick={() => setViewMode("desktop")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === "desktop" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}><Monitor className="w-3.5 h-3.5" /> 데스크톱</button>
        <button onClick={() => setViewMode("mobile")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${viewMode === "mobile" ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-400"}`}><Smartphone className="w-3.5 h-3.5" /> 모바일</button>
      </div>
    </div>
  );
}