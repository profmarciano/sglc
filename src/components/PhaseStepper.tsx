'use client';

import { useMemo } from 'react';

interface PhaseStepperProps {
  phases: readonly string[];
  currentPhase?: string;
  onStepClick?: (phase: string) => void;
}

export function PhaseStepper({ phases, currentPhase, onStepClick }: PhaseStepperProps) {
  const currentIndex = useMemo(() => {
    if (!currentPhase) return -1;
    return phases.findIndex((fase) => fase === currentPhase);
  }, [phases, currentPhase]);

  const nextPhase = currentIndex >= 0 && currentIndex < phases.length - 1 ? phases[currentIndex + 1] : null;

  const rows = useMemo(() => {
    const rowCount = 2;
    const perRow = Math.ceil(phases.length / rowCount);
    return Array.from({ length: rowCount }, (_, i) => phases.slice(i * perRow, i * perRow + perRow));
  }, [phases]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-bold mb-2">Fluxo de fases da licitação</h2>
      <p className="text-sm text-slate-600 mb-4">
        Atual: <strong>{currentPhase ?? 'N/A'}</strong>
        <span className="mx-2">→</span>
        Próxima: <strong>{nextPhase ?? 'sem próxima'}</strong>
      </p>

      <div className="space-y-6">
        {rows.map((row, rowIndex) => {
          const rowStart = rowIndex * Math.ceil(phases.length / 2);
          const isReverse = rowIndex % 2 === 1;

          return (
            <div key={`row-${rowIndex}`} className="relative">
              <div className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-slate-200" />
              <div className={`relative z-10 flex items-center justify-center gap-1 ${isReverse ? 'flex-row-reverse' : ''}`}>
                {row.map((fase, idx) => {
                  const absoluteIndex = rowStart + idx;
                  const isActive = absoluteIndex <= currentIndex;
                  const isCurrent = absoluteIndex === currentIndex;
                  const isLast = idx === row.length - 1;

                  return (
                    <div key={fase} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onStepClick?.(fase)}
                        className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all duration-200 ${onStepClick ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                      >
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-[12px] font-semibold ${isActive ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 bg-white text-slate-500'} ${isCurrent ? 'ring-2 ring-indigo-400' : ''}`}
                        >
                          {absoluteIndex + 1}
                        </span>
                        <span className={`max-w-[82px] text-[10px] text-center leading-tight ${isCurrent ? 'font-semibold text-indigo-800' : 'text-slate-600'}`} title={fase}>
                          {fase}
                        </span>
                      </button>

                      {!isLast && (
                        <span className="relative flex items-center">
                          <span className={`h-1 w-8 rounded-full ${isActive ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 8 8"
                            className={`absolute h-2 w-2 ${isActive ? 'text-indigo-500' : 'text-slate-400'} ${isReverse ? 'rotate-180' : ''}`}
                          >
                            <path fill="currentColor" d="M0 0 L8 4 L0 8 Z" />
                          </svg>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
