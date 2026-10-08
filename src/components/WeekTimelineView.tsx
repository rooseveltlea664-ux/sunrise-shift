import React from 'react';
import { ShiftDefinition, DayScheduleRecord, ViewPerspective } from '../types/shift';
import { getHolidayInfo } from '../services/holidayService';
import { Clock, Sun, AlertCircle } from 'lucide-react';

interface Props {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  schedules: Record<string, DayScheduleRecord>;
  shiftsMap: Record<string, ShiftDefinition>;
  perspective: ViewPerspective;
}

export const WeekTimelineView: React.FC<Props> = ({
  selectedDate,
  onSelectDate,
  schedules,
  shiftsMap,
  perspective,
}) => {
  const current = new Date(selectedDate);
  const dayOfWeek = (current.getDay() + 6) % 7; // 周一为 0
  
  // 生成当前选中日期所在周的 7 天
  const weekDays: { dateStr: string; dayNum: number; weekName: string }[] = [];
  const weekNames = ['一', '二', '三', '四', '五', '六', '日'];
  
  const monday = new Date(current);
  monday.setDate(current.getDate() - dayOfWeek);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    weekDays.push({
      dateStr: `${y}-${m}-${day}`,
      dayNum: d.getDate(),
      weekName: weekNames[i],
    });
  }

  const selectedRecord = schedules[selectedDate];
  const shiftA = selectedRecord ? shiftsMap[selectedRecord.shiftAId] : null;
  const shiftB = selectedRecord ? shiftsMap[selectedRecord.shiftBId] : null;

  const isTogether = shiftA?.category === 'rest' && shiftB?.category === 'rest';

  return (
    <div className="space-y-2.5">
      {/* 1. 紧凑周历滑条 (Compact Week Strip) */}
      <div className="liquid-card rounded-2xl p-2 shadow-sm">
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map(item => {
            const isSelected = item.dateStr === selectedDate;
            const rec = schedules[item.dateStr];
            const sA = rec ? shiftsMap[rec.shiftAId] : null;
            const sB = rec ? shiftsMap[rec.shiftBId] : null;
            const hol = getHolidayInfo(item.dateStr);
            const isTog = sA?.category === 'rest' && sB?.category === 'rest';

            return (
              <div
                key={item.dateStr}
                onClick={() => onSelectDate(item.dateStr)}
                className={`py-1.5 rounded-xl cursor-pointer motion-press flex flex-col items-center justify-between ${
                  isSelected
                    ? 'bg-black text-white shadow-md'
                    : isTog
                    ? 'bg-together-bg text-together-text border border-together-border'
                    : 'bg-white/70 text-gray-700'
                }`}
              >
                <span className="text-[9px] font-mono opacity-60">周{item.weekName}</span>
                <span className="text-xs font-bold font-mono my-0.5">{item.dayNum}</span>
                <div className="flex gap-0.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sA?.bgColor || '#EA580C' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sB?.bgColor || '#0D9488' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 双人 24 小时作息交集时间轴 (Duo 24h Timeline) - 标准视窗的核心灵魂 */}
      <div className="liquid-card rounded-3xl p-3.5 shadow-md">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
            <Clock className="w-3.5 h-3.5 text-sunrise-500" />
            <span>今日双方作息时差与交集时间轴</span>
          </div>
          {isTogether ? (
            <span className="text-[10px] text-rose-600 font-bold bg-together-bg px-2 py-0.5 rounded-full border border-together-border flex items-center gap-0.5">
              <Sun className="w-3 h-3 text-rose-500" />
              <span>全天双人共同在家时光</span>
            </span>
          ) : (
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              错峰当值
            </span>
          )}
        </div>

        {/* 24h 时间轴标尺 */}
        <div className="space-y-2 text-xs">
          {/* 小王时间线 */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-600 mb-1 font-semibold">
              <span className="text-sunrise-600 font-bold">👦 小王: {shiftA?.name} ({shiftA?.startTime} - {shiftA?.endTime})</span>
              <span className="font-mono text-gray-400">{shiftA?.durationHours}小时在岗</span>
            </div>
            {/* 时间轴进度条 */}
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative border border-gray-200">
              {shiftA?.category !== 'rest' ? (
                <div
                  className="h-full bg-sunrise-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                  style={{ marginLeft: '35%', width: '40%' }}
                >
                  工作时段
                </div>
              ) : (
                <div className="h-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[9px] font-bold">
                  全天休假在家
                </div>
              )}
            </div>
          </div>

          {/* 小李时间线 */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-600 mb-1 font-semibold">
              <span className="text-tealpartner-600 font-bold">👧 小李: {shiftB?.name} ({shiftB?.startTime} - {shiftB?.endTime})</span>
              <span className="font-mono text-gray-400">{shiftB?.durationHours}小时在岗</span>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden relative border border-gray-200">
              {shiftB?.category !== 'rest' ? (
                <div
                  className="h-full bg-tealpartner-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold"
                  style={{ marginLeft: '75%', width: '25%' }}
                >
                  夜班当值
                </div>
              ) : (
                <div className="h-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-[9px] font-bold">
                  全天休假在家
                </div>
              )}
            </div>
          </div>

          {/* 标尺刻度 */}
          <div className="flex justify-between text-[8px] text-gray-400 font-mono px-0.5 pt-0.5">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
