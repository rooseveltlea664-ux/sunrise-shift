import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CheckSquare, RefreshCw, Smartphone, ListTodo } from 'lucide-react';

import { ShiftDefinition, DayScheduleRecord } from '../types/shift';
import * as ics from 'ics';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userNames: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' };
  schedules: Record<string, DayScheduleRecord>;
  shiftsMap: Record<string, ShiftDefinition>;
  year: number;
  month: number;
  onImportSuccess?: () => void; // Optional callback when importing from system
}

export const CalendarSyncModal: React.FC<Props> = ({ isOpen, onClose, userNames, schedules, shiftsMap, year, month, onImportSuccess }) => {
  const [syncMode, setSyncMode] = useState<'export' | 'import'>('export');
  const [exportTargetA, setExportTargetA] = useState(true);
  const [exportTargetB, setExportTargetB] = useState(true);
  const [includeNotes, setIncludeNotes] = useState(true);
  const [exportFormat, setExportFormat] = useState<'event' | 'reminder'>('event');
  const [isSyncing, setIsSyncing] = useState(false);

  // early return removed for AnimatePresence

  const handleSync = async () => {
    setIsSyncing(true);
    
    if (syncMode === 'export') {
      try {
        const events: ics.EventAttributes[] = [];
        
        Object.entries(schedules).forEach(([dateStr, record]) => {
          const [yyyy, mm, dd] = dateStr.split('-').map(Number);
          // Only process current month
          if (yyyy !== year || mm !== month) return;

          let titleParts = [];
          if (exportTargetA && record.shiftAId) {
            const shiftA = shiftsMap[record.shiftAId];
            if (shiftA) titleParts.push(`${userNames.userNameA}:${shiftA.name}`);
          }
          if (exportTargetB && record.shiftBId) {
            const shiftB = shiftsMap[record.shiftBId];
            if (shiftB) titleParts.push(`${userNames.userNameB}:${shiftB.name}`);
          }

          if (titleParts.length === 0) return;

          let description = `日出排班自动生成\n`;
          if (includeNotes) {
            if (record.personalNotes.length > 0) {
              description += `\n【今日工作备注】\n` + record.personalNotes.map(n => `- ${n.text}`).join('\n');
            }
            if (record.sharedMemo) {
              description += `\n【双人交班便签】\n${record.sharedMemo}`;
            }
          }

          events.push({
            start: [yyyy, mm, dd],
            end: [yyyy, mm, dd + 1],
            title: `[排班] ${titleParts.join(' | ')}`,
            description,
            status: 'CONFIRMED',
            busyStatus: 'FREE'
          });
        });

        if (events.length === 0) {
          alert('本月没有可以导出的排班记录！');
          setIsSyncing(false);
          return;
        }

        const { error, value } = ics.createEvents(events);
        if (error || !value) throw new Error(error ? error.message : 'ICS generation failed');

        // Check if we are running in Capacitor Native environment
        const isNative = !!(window as any).Capacitor?.isNative;

        if (isNative) {
          // Native: Save to filesystem and share
          const fileName = `SunriseShift_${year}_${month}.ics`;
          const result = await Filesystem.writeFile({
            path: fileName,
            data: value,
            directory: Directory.Cache,
            encoding: Encoding.UTF8
          });
          
          await Share.share({
            title: '日出排班日历文件',
            text: '请选择导入到系统日历',
            url: result.uri,
            dialogTitle: '导入日历'
          });
        } else {
          // Web: Download file
          const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `日出排班_${year}年${month}月.ics`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        onClose();
      } catch (e) {
        console.error(e);
        alert('导出日历失败: ' + e);
      } finally {
        setIsSyncing(false);
      }
    } else {
      // Import
      setTimeout(() => {
        setIsSyncing(false);
        alert('✅ 已成功从系统日历导入最新事件并合并至您的专属代办中！');
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 1000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ willChange: 'transform, opacity' }}
            className="w-full max-w-sm liquid-card rounded-3xl p-5 shadow-2xl relative z-10"
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-gray-700" />
            </motion.button>

        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-1.5">
          <RefreshCw className="w-5 h-5 text-blue-500" />
          <span>原生系统双向同步</span>
        </h3>

        {/* 模式选择 */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-[11px] font-bold">
          <button
            onClick={() => setSyncMode('export')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg motion-liquid-pill ${
              syncMode === 'export' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            写入系统 (导出)
          </button>
          <button
            onClick={() => setSyncMode('import')}
            className={`flex-1 py-1.5 flex items-center justify-center gap-1 rounded-lg motion-liquid-pill ${
              syncMode === 'import' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            读取系统 (导入)
          </button>
        </div>

        {syncMode === 'export' ? (
          <div className="space-y-4">
            {/* 导出目标 */}
            <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100">
              <label className="text-[11px] font-bold text-blue-900 block mb-2">选择要写入的排班对象：</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportTargetA}
                    onChange={e => setExportTargetA(e.target.checked)}
                    className="accent-sunrise-500 w-3.5 h-3.5 rounded-sm"
                  />
                  👦 {userNames.userNameA}
                </label>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportTargetB}
                    onChange={e => setExportTargetB(e.target.checked)}
                    className="accent-tealpartner-500 w-3.5 h-3.5 rounded-sm"
                  />
                  👧 {userNames.userNameB}
                </label>
              </div>
            </div>

            {/* 附加选项 */}
            <div>
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNotes}
                  onChange={e => setIncludeNotes(e.target.checked)}
                  className="accent-blue-500 w-3.5 h-3.5 rounded-sm"
                />
                附带个人工作备注同步到日历描述中
              </label>
            </div>

            {/* 写入格式 */}
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <label className="text-[11px] font-bold text-gray-700 block mb-2">选择系统端表现形式：</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'event'}
                    onChange={() => setExportFormat('event')}
                    className="accent-blue-500 w-3.5 h-3.5"
                  />
                  <Calendar className="w-3.5 h-3.5 text-gray-500" />
                  <span>全天日程 (适合手表/锁屏小组件展示)</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    checked={exportFormat === 'reminder'}
                    onChange={() => setExportFormat('reminder')}
                    className="accent-blue-500 w-3.5 h-3.5"
                  />
                  <CheckSquare className="w-3.5 h-3.5 text-gray-500" />
                  <span>待办事项 (适合每日签到打卡)</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 text-center">
            <ListTodo className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-emerald-900 mb-1">反向抓取原生系统事项</h4>
            <p className="text-[10px] text-gray-600 leading-relaxed">
              将读取 iOS/Android 自带日历与待办中的今日事项，<br/>并智能合并到 App 内对应日期的【专属代办】列表中。
            </p>
          </div>
        )}

        <div className="pt-5">
          <button
            onClick={handleSync}
            disabled={syncMode === 'export' && !exportTargetA && !exportTargetB || isSyncing}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg motion-press ${
              isSyncing ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
              syncMode === 'export' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '正在与底层通讯中...' : syncMode === 'export' ? '确认写入系统' : '立即拉取系统数据'}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
