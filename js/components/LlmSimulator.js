const { useState, useEffect } = React;

function LlmSimulator() {
  const [threads, setThreads] = useState(6);
  const [chromeOpen, setChromeOpen] = useState(false);
  const [tabs, setTabs] = useState(11);
  const [speed, setSpeed] = useState(2.5);

  useEffect(() => {
    // 1. Velocidade base ancorada nos nossos testes reais do Mac Pro 2009
    let baseSpeed = 1.0;
    if (threads === 4) baseSpeed = 1.5;
    else if (threads === 6) baseSpeed = 2.5; // O "Sweet Spot"
    else if (threads === 8) baseSpeed = 1.8; // Overhead de processador duplo
    else if (threads > 8) baseSpeed = 1.2;
    else if (threads < 4) baseSpeed = 1.0;

    // 2. Cálculo de Penalidade do zRAM (Chrome)
    let penalty = 0;
    if (chromeOpen) {
      // Perde 0.1 t/s a cada 2 abas abertas
      penalty = Math.floor(tabs / 2) * 0.1;
    }

    let currentSpeed = baseSpeed - penalty;

    // 3. Penalidade severa: Acima de 10 abas, o Swap chora (perde 20% do total)
    if (chromeOpen && tabs > 10) {
      currentSpeed = currentSpeed * 0.8;
    }

    // Impede que a velocidade fique negativa
    currentSpeed = Math.max(0.1, currentSpeed);

    setSpeed(currentSpeed.toFixed(2));
  }, [threads, chromeOpen, tabs]);

  // Cálculo para o ponteiro do velocímetro (0 a 3 t/s)
  const rotation = (parseFloat(speed) / 3) * 180 - 90;

  return (
    <div className="max-w-md mx-auto p-6 bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 shadow-2xl font-sans my-8 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="mb-6 border-b border-zinc-800/50 pb-4 relative z-10">
        <h3 className="text-xl font-bold mb-1 tracking-tight">Simulador de Performance LLM</h3>
        <div className="flex items-center gap-2">
          <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Mac Pro 2009 • 4.8GB RAM • Llama-3.2-3B</p>
        </div>
      </div>

      {/* Visor de Velocidade com Velocímetro */}
      <div className="bg-black/40 rounded-xl p-8 mb-8 text-center border border-zinc-800/50 backdrop-blur-sm relative z-10">

        {/* Gauge (CSS Simple) */}
        <div className="relative w-48 h-24 mx-auto mb-4 overflow-hidden">
          {/* Arcos do Gauge */}
          <div className="absolute top-0 left-0 w-48 h-48 border-[12px] border-zinc-800 rounded-full"></div>
          <div
            className="absolute top-0 left-0 w-48 h-48 border-[12px] border-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ clipPath: `polygon(50% 50%, -50% 100%, 150% 100%)`, transform: `rotate(${rotation}deg)` }}
          ></div>

          {/* Info Central */}
          <div className="absolute bottom-0 left-0 w-full text-center">
            <div className="text-4xl font-black font-mono tracking-tighter text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              {speed}
            </div>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Tokens / seg</div>
          </div>
        </div>

        {/* Alerta de Gargalo */}
        {speed < 1.0 && (
          <div className="mt-4 text-xs font-bold text-rose-400 bg-rose-400/10 py-1.5 px-3 rounded-full inline-flex items-center gap-2 border border-rose-400/20 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            Gargalo Severo de Memória
          </div>
        )}
      </div>

      <div className="space-y-6 relative z-10">
        {/* Controle de Threads */}
        <div>
          <div className="flex justify-between mb-3 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Threads Ativas</label>
            <div className="bg-zinc-800 px-2 py-1 rounded text-xs font-mono text-emerald-400 border border-zinc-700">
              {threads} CORES
            </div>
          </div>
          <input
            type="range"
            min="2" max="12" step="2"
            value={threads}
            onChange={(e) => setThreads(parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 mt-2 font-medium uppercase">
            <span>Seguro</span>
            <span className="text-emerald-500/70 text-center">Sweet Spot (6)</span>
            <span>Overhead</span>
          </div>
        </div>

        {/* Toggle do Chrome */}
        <div className="flex items-center justify-between pt-5 border-t border-zinc-800/50">
          <div>
            <label className="text-sm font-bold block">Navegador Aberto</label>
            <span className="text-[11px] text-zinc-500">Impacto direto no swap / zRAM</span>
          </div>
          <button
            onClick={() => {
              const newState = !chromeOpen;
              setChromeOpen(newState);
              if (!newState) setTabs(0);
              else setTabs(11);
            }}
            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${chromeOpen ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-700'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 shadow-sm ${chromeOpen ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Controle de Abas (Só aparece se o Chrome estiver aberto) */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${chromeOpen ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
          <div className="flex justify-between mb-3 items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Abas do Chrome</label>
            <span className={`text-xs font-mono px-2 py-1 rounded border ${tabs > 10 ? 'text-rose-400 border-rose-400/20 bg-rose-400/5' : 'text-zinc-400 border-zinc-700 bg-zinc-800'}`}>
              {tabs} ABAS
            </span>
          </div>
          <input
            type="range"
            min="1" max="30" step="1"
            value={tabs}
            onChange={(e) => setTabs(parseInt(e.target.value))}
            className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer transition-colors ${tabs > 10 ? 'accent-rose-500 bg-zinc-800' : 'accent-emerald-500 bg-zinc-800'}`}
          />
          {tabs > 10 && (
            <p className="text-[10px] text-rose-500/80 mt-2 italic flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
              Penalidade de -20% aplicada (Swap Overload)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Exporta para ser usado com ReactDOM.render ou Babel
window.LlmSimulator = LlmSimulator;
