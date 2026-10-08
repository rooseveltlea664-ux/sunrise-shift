import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  currentMonthText: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export const LiquidNavbar: React.FC<Props> = ({
  currentMonthText,
  onPrevMonth,
  onNextMonth,
  onToday,
}) => {
  return (
    <header className="px-4 pt-4 pb-2 relative z-20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{currentMonthText}</h1>
        </div>

        <div className="flex items-center gap-1 bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md p-1 rounded-full border border-gray-200/50 dark:border-zinc-700/50 shadow-sm">
          <button
            onClick={onPrevMonth}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors motion-press"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={onToday}
            className="px-2 py-0.5 text-xs font-semibold rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm motion-press"
          >
            今天
          </button>
          <button
            onClick={onNextMonth}
            className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors motion-press"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
