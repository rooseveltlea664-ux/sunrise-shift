import React, { useState } from 'react';
import { ShiftDefinition, DayScheduleRecord } from '../types/shift';
import { BarChart3, Heart, DollarSign, Download, Share2, Award, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CalendarSyncModal } from './CalendarSyncModal';

interface Props {
  year: number;
  month: number;
  schedules: Record<string, DayScheduleRecord>;
  shiftsMap: Record<string, ShiftDefinition>;
  userNames: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' };
}

export const AnalyticsDashboard: React.FC<Props> = ({
  year,
  month,
  schedules,
  shiftsMap,
  userNames,
}) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let togetherCount = 0;
  let workDaysA = 0;
  let workHoursA = 0;
  let allowanceA = 0;
  const shiftCountsA: Record<string, number> = {};

  let workDaysB = 0;
  let workHoursB = 0;
  let allowanceB = 0;
  const shiftCountsB: Record<string, number> = {};

  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const rec = schedules[dStr];
    if (rec) {
      const sA = shiftsMap[rec.shiftAId];
      const sB = shiftsMap[rec.shiftBId];
      if (sA?.category === 'rest' && sB?.category === 'rest') {
        togetherCount++;
      }
      if (sA && sA.category !== 'rest') {
        workDaysA++;
        workHoursA += sA.durationHours;
        allowanceA += sA.allowance || 0;
        shiftCountsA[sA.name] = (shiftCountsA[sA.name] || 0) + 1;
      }
      if (sB && sB.category !== 'rest') {
        workDaysB++;
        workHoursB += sB.durationHours;
        allowanceB += sB.allowance || 0;
        shiftCountsB[sB.name] = (shiftCountsB[sB.name] || 0) + 1;
      }
    }
  }

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleShare = async () => {
    setIsGeneratingImage(true);
    const element = document.getElementById('analytics-content-to-capture');
    if (!element) {
      setIsGeneratingImage(false);
      return;
    }
    
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: null });
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = image;
      link.download = `日出排班_${year}年${month}月工时报告.png`;
      link.click();
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      alert('生成图片失败，请稍后重试');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCalendarSync = () => {
    setIsSyncModalOpen(true);
  };

  return (
    <div id="analytics-content-to-capture" className="space-y-3 pb-6">
      {/* 头部荣誉卡 */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg text-center relative overflow-hidden">
        <div className="w-10 h-10 rounded-full bg-sunrise-500/10 text-sunrise-600 flex items-center justify-center mx-auto mb-1">
          <Heart className="w-5 h-5 fill-current text-rose-500" />
        </div>
        <h3 className="text-sm font-bold text-gray-900">{year}年{month}月 · 双人合盘工时报告</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">辛苦轮班的时光，也有属于两个人的默契</p>
        
        <div className="mt-3 p-2.5 rounded-2xl bg-together-bg/90 border border-together-border flex items-center justify-between">
          <div className="text-left">
            <div className="text-[10px] text-together-text font-bold">全月共同休息日</div>
            <div className="text-lg font-extrabold text-rose-600 font-mono">{togetherCount} 天</div>
          </div>
          <button
            onClick={handleShare}
            disabled={isGeneratingImage}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-md motion-press flex items-center gap-1 ${
              isGeneratingImage ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-rose-600 text-white'
            }`}
          >
            {isGeneratingImage ? (
              <span className="animate-pulse">截图中...</span>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                <span>生成精美战报</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 个人对比卡片 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* A */}
        <div className="liquid-card rounded-2xl p-3 shadow-md border-t-2 border-sunrise-500 flex flex-col">
          <div className="flex items-center justify-between font-bold text-sunrise-900 mb-2">
            <span className="truncate">👦 {userNames.userNameA}</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-gray-600 flex-1">
            <div className="flex justify-between">
              <span>出勤天数:</span>
              <span className="font-mono font-bold text-gray-900">{workDaysA} 天</span>
            </div>
            <div className="flex justify-between">
              <span>总工时:</span>
              <span className="font-mono font-bold text-gray-900">{workHoursA} h</span>
            </div>
            <div className="flex justify-between">
              <span>班次津贴:</span>
              <span className="font-mono font-bold text-emerald-600">+{allowanceA} 元</span>
            </div>
            {Object.entries(shiftCountsA).map(([name, count]) => (
              <div key={name} className="flex justify-between border-t border-gray-100/50 pt-1 mt-1">
                <span>{name}:</span>
                <span className="font-mono font-bold text-sunrise-600">{count}天</span>
              </div>
            ))}
          </div>
        </div>

        {/* B */}
        <div className="liquid-card rounded-2xl p-3 shadow-md border-t-2 border-tealpartner-500 flex flex-col">
          <div className="flex items-center justify-between font-bold text-tealpartner-900 mb-2">
            <span className="truncate">👧 {userNames.userNameB}</span>
          </div>
          <div className="space-y-1.5 text-[11px] text-gray-600 flex-1">
            <div className="flex justify-between">
              <span>出勤天数:</span>
              <span className="font-mono font-bold text-gray-900">{workDaysB} 天</span>
            </div>
            <div className="flex justify-between">
              <span>总工时:</span>
              <span className="font-mono font-bold text-gray-900">{workHoursB} h</span>
            </div>
            <div className="flex justify-between">
              <span>班次津贴:</span>
              <span className="font-mono font-bold text-emerald-600">+{allowanceB} 元</span>
            </div>
            {Object.entries(shiftCountsB).map(([name, count]) => (
              <div key={name} className="flex justify-between border-t border-gray-100/50 pt-1 mt-1">
                <span>{name}:</span>
                <span className="font-mono font-bold text-tealpartner-600">{count}天</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 原生日历同步功能块 */}
      <div className="liquid-card rounded-2xl p-3 shadow-md border border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5 mb-0.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>同步至手机系统日历</span>
          </div>
          <div className="text-[10px] text-gray-500">将本月排班写入iOS/安卓原生自带日历，方便手表查看</div>
        </div>
        <button
          onClick={handleCalendarSync}
          className="px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-[11px] font-bold shadow-sm motion-press"
        >
          一键写入
        </button>
      </div>

      <CalendarSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        userNames={userNames}
        schedules={schedules}
        shiftsMap={shiftsMap}
        year={year}
        month={month}
      />
    </div>
  );
};
