import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShiftDefinition, DayScheduleRecord, ViewPerspective, CalendarDisplayStyle } from '../types/shift';
import { getHolidayInfo } from '../services/holidayService';
import { LayoutGrid, Layers, Columns2, Sparkles, CircleDot } from 'lucide-react';

interface Props {
  year: number;
  month: number; // 1-12
  monthDirection: number; // 1 for next, -1 for prev, 0 for initial
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  schedules: Record<string, DayScheduleRecord>;
  shiftsMap: Record<string, ShiftDefinition>;
  perspective: ViewPerspective;
  displayStyle: CalendarDisplayStyle;
  onDisplayStyleChange: (style: CalendarDisplayStyle) => void;
  userNames: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' };
}

export const CalendarGrid: React.FC<Props> = ({
  year,
  month,
  monthDirection,
  selectedDate,
  onSelectDate,
  schedules,
  shiftsMap,
  perspective,
  displayStyle,
  onDisplayStyleChange,
  userNames,
}) => {
  // 生成当月天数与首日星期
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0(周日) ~ 6(周六)
  const offset = (firstDay + 6) % 7; // 转为周一为 0
  const daysInMonth = new Date(year, month, 0).getDate();

  const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // 上月末占位
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = offset - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const m = month - 1 === 0 ? 12 : month - 1;
    const y = month - 1 === 0 ? year - 1 : year;
    days.push({
      day: d,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  // 当月
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      isCurrentMonth: true,
    });
  }

  return (
    <div className="liquid-card rounded-3xl p-3 shadow-lg">

      {/* 星期表头 */}
      <div className="grid grid-cols-7 text-center text-[11px] font-bold text-gray-400 mb-2 font-mono tracking-widest">
        <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span>
        <span className="text-sunrise-500">六</span>
        <span className="text-sunrise-500">日</span>
      </div>

      {/* 48px 标准单元格网格 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div 
          key={`${year}-${month}`}
          initial={{ opacity: 0, scale: 0.95, x: monthDirection * 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.95, x: -monthDirection * 40 }}
          transition={{ duration: 0.35, type: 'spring', bounce: 0 }}
          className="grid grid-cols-7 gap-1 text-center text-xs"
        >
        {days.map((item, idx) => {
          const holiday = getHolidayInfo(item.dateStr);
          const record = schedules[item.dateStr];
          const shiftA = record ? shiftsMap[record.shiftAId] : null;
          const shiftB = record ? shiftsMap[record.shiftBId] : null;

          const isReallyTogetherRest =
            shiftA && shiftB && shiftA.category === 'rest' && shiftB.category === 'rest';

          // 透视视角逻辑：个人视角中不显示"同休"，全显和同休视角才显示"同休"
          const isTogetherRest =
            isReallyTogetherRest && (perspective === 'both' || perspective === 'together');

          const isSelected = item.dateStr === selectedDate;

          // 视角过滤计算
          let showBadgeA = true;
          let showBadgeB = true;
          let dimCell = false;

          if (perspective === 'me') {
            if (userNames.currentUserRole === 'A') showBadgeB = false;
            else showBadgeA = false;
          } else if (perspective === 'partner') {
            if (userNames.currentUserRole === 'A') showBadgeA = false;
            else showBadgeB = false;
          } else if (perspective === 'together') {
            if (!isTogetherRest) {
              dimCell = true;
            }
          }

          if (!item.isCurrentMonth) {
            return (
              <div key={idx} className="cal-cell rounded-xl bg-gray-100/40 opacity-40">
                <span className="text-[9px] font-mono text-gray-400 text-left pl-0.5">{item.day}</span>
              </div>
            );
          }

          return (
            <motion.div
              key={idx}
              onClick={() => onSelectDate(item.dateStr)}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className={`cal-cell rounded-xl cursor-pointer ${
                isTogetherRest
                  ? 'border-2 border-rose-400 bg-together-bg motion-halo-active'
                  : 'cal-cell-bg border border-gray-100'
              } ${isSelected ? 'ring-2 ring-black shadow-md scale-[1.03] z-10' : ''} ${
                dimCell ? 'opacity-20 grayscale' : 'opacity-100'
              }`}
            >
              {/* 单元格顶部：日期号 + 节假日/补班角标 */}
              <div className="flex justify-between items-center px-0.5">
                <span
                  className={`text-xs font-mono leading-none ${
                    isTogetherRest ? 'font-bold text-together-text' : 'text-gray-800'
                  }`}
                >
                  {item.day}
                </span>
                {holiday && (
                  <span
                    className={`text-[9px] px-1 rounded leading-none py-0.5 font-bold shadow-sm ${
                      holiday.type === 'holiday_rest'
                        ? 'bg-holiday-restBg text-holiday-restText'
                        : 'bg-holiday-workBg text-holiday-workText'
                    }`}
                  >
                    {holiday.type === 'holiday_rest' ? '休' : '班'}
                  </span>
                )}
                {isTogetherRest && !holiday && (
                  <span className="text-[10px] text-rose-500 font-bold motion-sun-spin leading-none">☀️</span>
                )}
              </div>

              {/* 核心双人排班展示：根据自定义风格动态分化 */}
              {isTogetherRest ? (
                <div className="bg-white/95 text-rose-600 font-bold text-[10px] py-1 rounded shadow-sm text-center mt-auto mb-0.5 mx-0.5 tracking-widest">
                  同休
                </div>
              ) : (
                <div className="mt-auto flex flex-col justify-end h-full pt-1">
                  {/* 风格 1: 上下对半分栏 (清晰分界，绝不混淆) */}
                  {displayStyle === 'split_vertical' && (
                    <div className="flex flex-col gap-1 pb-0.5">
                      {showBadgeA && (
                        <div
                          style={{ backgroundColor: shiftA?.badgeBg, color: shiftA?.textColor }}
                          className="text-[9.5px] font-bold rounded-md py-0.5 px-1 flex items-center justify-between leading-none truncate border border-black/5 shadow-xs"
                        >
                          <span className="opacity-60 text-[8px] mr-1 truncate max-w-[20px]">{userNames.userNameA}</span>
                          <span>{shiftA?.code || '早'}</span>
                        </div>
                      )}
                      {showBadgeB && (
                        <div
                          style={{ backgroundColor: shiftB?.badgeBg, color: shiftB?.textColor }}
                          className="text-[9.5px] font-bold rounded-md py-0.5 px-1 flex items-center justify-between leading-none truncate border border-black/5 shadow-xs"
                        >
                          <span className="opacity-60 text-[8px] mr-1 truncate max-w-[20px]">{userNames.userNameB}</span>
                          <span>{shiftB?.code || '休'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 风格 2: 左右并列双徽章 */}
                  {displayStyle === 'side_by_side' && (
                    <div className="flex gap-1 pb-0.5 px-0.5">
                      {showBadgeA && (
                        <span
                          style={{ backgroundColor: shiftA?.badgeBg, color: shiftA?.textColor }}
                          className="flex-1 text-[9.5px] font-bold rounded-md py-1 truncate border border-black/5 text-center leading-none shadow-xs"
                          title={userNames.userNameA}
                        >
                          {shiftA?.code || '早'}
                        </span>
                      )}
                      {showBadgeB && (
                        <span
                          style={{ backgroundColor: shiftB?.badgeBg, color: shiftB?.textColor }}
                          className="flex-1 text-[9.5px] font-bold rounded-md py-1 truncate border border-black/5 text-center leading-none shadow-xs"
                          title={userNames.userNameB}
                        >
                          {shiftB?.code || '休'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* 风格 3: 极简纯粹斜杠 (Typographic) */}
                  {displayStyle === 'slash_text' && (
                    <div className="text-center text-[11px] font-black font-mono pb-1.5 flex items-center justify-center">
                      {showBadgeA && (
                        <span style={{ color: shiftA?.textColor }} className="drop-shadow-sm">{shiftA?.code || '早'}</span>
                      )}
                      {showBadgeA && showBadgeB && (
                        <span className="text-gray-300 mx-1 font-light">/</span>
                      )}
                      {showBadgeB && (
                        <span style={{ color: shiftB?.textColor }} className="drop-shadow-sm">{shiftB?.code || '休'}</span>
                      )}
                    </div>
                  )}

                  {/* 风格 4: 极简双色微标 (带圆方指示) */}
                  {displayStyle === 'pill_minimal' && (
                    <div className="flex flex-col gap-0.5 pb-1 pl-1">
                      {showBadgeA && (
                        <div className="flex items-center gap-1.5" title={`${userNames.userNameA}: ${shiftA?.name}`}>
                          <span className="w-1.5 h-1.5 rounded-full shadow-sm" style={{ backgroundColor: shiftA?.bgColor }}></span>
                          <span className="text-[8.5px] font-bold text-gray-700 leading-none">{shiftA?.code || '早'}</span>
                        </div>
                      )}
                      {showBadgeB && (
                        <div className="flex items-center gap-1.5" title={`${userNames.userNameB}: ${shiftB?.name}`}>
                          <span className="w-1.5 h-1.5 rounded-sm shadow-sm transform rotate-45 scale-90" style={{ backgroundColor: shiftB?.bgColor }}></span>
                          <span className="text-[8.5px] font-bold text-gray-700 leading-none">{shiftB?.code || '休'}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
