import React from 'react';
import { ShiftDefinition, DayScheduleRecord } from '../types/shift';
import { Sparkles } from 'lucide-react';

interface Props {
  year: number;
  month: number;
  schedules: Record<string, DayScheduleRecord>;
  shiftsMap: Record<string, ShiftDefinition>;
  userNames: { userNameA: string; userNameB: string };
}

export const FullMonthOverview: React.FC<Props> = ({
  year,
  month,
  schedules,
  shiftsMap,
  userNames,
}) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let togetherDaysCount = 0;
  let totalHoursA = 0;
  let nightAllowanceB = 0;

  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const rec = schedules[dStr];
    if (rec) {
      const sA = shiftsMap[rec.shiftAId];
      const sB = shiftsMap[rec.shiftBId];
      if (sA?.category === 'rest' && sB?.category === 'rest') {
        togetherDaysCount++;
      }
      if (sA) totalHoursA += sA.durationHours;
      if (sB?.category === 'night') {
        nightAllowanceB += sB.allowance;
      }
    }
  }

  return (
    <div className="liquid-card rounded-2xl p-2.5 shadow-sm">
      <div className="flex items-center justify-between pb-1 border-b border-gray-100">
        <span className="font-bold text-[11px] text-gray-900 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sunrise-500" />
          <span>{month}月协同速报</span>
        </span>
        <span className="text-[9px] text-gray-400 font-mono">当月核算</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5 mt-1.5 text-center text-xs">
        <div className="p-1 rounded-xl bg-together-bg border border-together-border flex flex-col justify-center">
          <div className="text-[8px] text-together-text font-medium truncate">双人同休</div>
          <div className="text-[11px] font-bold text-together-text font-mono mt-0.5">{togetherDaysCount} 天</div>
        </div>
        <div className="p-1 rounded-xl bg-sunrise-50/70 border border-sunrise-100 flex flex-col justify-center">
          <div className="text-[8px] text-sunrise-600 font-medium truncate">{userNames.userNameA}工时</div>
          <div className="text-[11px] font-bold text-sunrise-600 font-mono mt-0.5">{totalHoursA} h</div>
        </div>
        <div className="p-1 rounded-xl bg-tealpartner-50/70 border border-tealpartner-100 flex flex-col justify-center">
          <div className="text-[8px] text-tealpartner-600 font-medium truncate">{userNames.userNameB}津贴</div>
          <div className="text-[11px] font-bold text-tealpartner-600 font-mono mt-0.5">+{nightAllowanceB} 元</div>
        </div>
      </div>
    </div>
  );
};
