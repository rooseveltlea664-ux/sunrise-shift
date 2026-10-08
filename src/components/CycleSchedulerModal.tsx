import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShiftDefinition, DayScheduleRecord } from '../types/shift';
import { PRESET_TEMPLATES, generateScheduleRange } from '../services/schedulerEngine';
import { loadTemplates, saveTemplates } from '../services/storageService';
import { CustomTemplate } from '../types/shift';
import { X, Calendar, Play, Plus, Trash2, ArrowRight, Save, Edit3 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shifts: ShiftDefinition[];
  onApplySchedule: (newRecords: Record<string, DayScheduleRecord>, applyToA: boolean, applyToB: boolean) => void;
  userNames: { userNameA: string; userNameB: string };
}

export const CycleSchedulerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  shifts,
  onApplySchedule,
  userNames,
}) => {
  // 自定义序列状态：小王与小李各自的循环序列
  const [seqA, setSeqA] = useState<string[]>([
    'shift_morning',
    'shift_morning',
    'shift_night',
    'shift_night',
    'shift_rest',
    'shift_rest',
  ]);
  const [seqB, setSeqB] = useState<string[]>([
    'shift_night',
    'shift_night',
    'shift_rest',
    'shift_rest',
    'shift_morning',
    'shift_morning',
  ]);

  const [activePartnerTab, setActivePartnerTab] = useState<'A' | 'B'>('A');
  const [holidayStrategy, setHolidayStrategy] = useState<'auto_rest' | 'shift_priority_with_overtime'>('auto_rest');
  const [rangeMonths, setRangeMonths] = useState(3);
  const [startDateStr, setStartDateStr] = useState('2026-10-01');

  const [templates, setTemplates] = useState<CustomTemplate[]>(() => loadTemplates());
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [applyToA, setApplyToA] = useState(true);
  const [applyToB, setApplyToB] = useState(true);

  const currentSeq = activePartnerTab === 'A' ? seqA : seqB;
  const setCurrentSeq = activePartnerTab === 'A' ? setSeqA : setSeqB;

  const handleApplyTemplate = (tmpl: CustomTemplate) => {
    setSeqA([...tmpl.cycleA]);
    setSeqB([...tmpl.cycleB]);
    setHolidayStrategy(tmpl.holidayStrategy || 'auto_rest');
  };

  const handleDeleteTemplate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除此模板吗？')) {
      const next = templates.filter(t => t.id !== id);
      setTemplates(next);
      saveTemplates(next);
    }
  };

  const handleSaveAsTemplate = () => {
    const name = prompt('请输入新轮班模板的名称：');
    if (!name) return;
    const newTmpl: CustomTemplate = {
      id: 'tmpl_' + Date.now(),
      name,
      cycleA: [...seqA],
      cycleB: [...seqB],
      holidayStrategy
    };
    const next = [...templates, newTmpl];
    setTemplates(next);
    saveTemplates(next);
  };

  const handleRenameTemplate = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = prompt('修改模板名称：', currentName);
    if (newName && newName.trim() !== '') {
      const next = templates.map(t => t.id === id ? { ...t, name: newName.trim() } : t);
      setTemplates(next);
      saveTemplates(next);
    }
  };

  const handleAddShiftToSeq = (shiftId: string) => {
    setCurrentSeq([...currentSeq, shiftId]);
  };

  const handleRemoveStep = (index: number) => {
    if (currentSeq.length <= 1) {
      alert('轮换周期至少需包含 1 个班次');
      return;
    }
    const next = [...currentSeq];
    next.splice(index, 1);
    setCurrentSeq(next);
  };

  const handleGenerate = () => {
    if (!applyToA && !applyToB) {
      alert('请至少选择一个要覆盖的对象！');
      return;
    }
    const start = new Date(startDateStr);
    const generated = generateScheduleRange(
      start,
      rangeMonths * 31,
      seqA,
      seqB,
      holidayStrategy
    );
    onApplySchedule(generated, applyToA, applyToB);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0 }}
            className="w-full max-w-sm liquid-card rounded-3xl p-5 shadow-2xl relative max-h-[92vh] flex flex-col z-10"
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-gray-700" />
            </motion.button>

        <h3 className="text-base font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-sunrise-500" />
          <span>自定义自由轮班设计器</span>
        </h3>
        <p className="text-[11px] text-gray-500 mb-3">为双方自由组合专属轮班序列，任意天数自动循环</p>

        <div className="flex-1 overflow-y-auto space-y-3 pr-0.5 text-xs">
          {/* 1. 快捷套用预设模板 */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-semibold text-gray-600 block">我的轮班模板：</label>
              <button
                type="button"
                onClick={handleSaveAsTemplate}
                className="text-[10px] text-sunrise-600 font-bold hover:underline flex items-center gap-0.5"
              >
                <Save className="w-3 h-3" />
                将当前序列存为新模板
              </button>
            </div>
            <div className="grid grid-cols-1 gap-1.5 text-[10px]">
              {templates.map((tmpl, idx) => (
                <motion.div 
                  key={tmpl.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm group"
                >
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="flex-1 p-2 text-left hover:bg-sunrise-50 font-bold text-gray-800 flex items-center justify-between truncate"
                  >
                    <span>{tmpl.name}</span>
                    <span className="text-[9px] font-normal text-gray-400">({tmpl.cycleA.length}天)</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRenameTemplate(tmpl.id, tmpl.name, e)}
                    className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 border-l border-gray-100"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteTemplate(tmpl.id, e)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 border-l border-gray-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 2. 双方序列切换 */}
          <div className="p-1 bg-gray-100 rounded-xl flex items-center font-bold text-[11px]">
            <button
              onClick={() => setActivePartnerTab('A')}
              className={`flex-1 py-1 rounded-lg text-center motion-liquid-pill truncate px-1 ${
                activePartnerTab === 'A' ? 'bg-white text-sunrise-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              👦 {userNames.userNameA} ({seqA.length}天周期)
            </button>
            <button
              onClick={() => setActivePartnerTab('B')}
              className={`flex-1 py-1 rounded-lg text-center motion-liquid-pill truncate px-1 ${
                activePartnerTab === 'B' ? 'bg-white text-tealpartner-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              👧 {userNames.userNameB} ({seqB.length}天周期)
            </button>
          </div>

          {/* 3. 序列可视化预览与点按增删 */}
          <div className="p-2.5 rounded-2xl bg-white/90 border border-gray-200">
            <div className="text-[10px] text-gray-500 mb-1.5 flex justify-between">
              <span>当前循环序列（按天顺序执行）：</span>
              <span className="font-mono font-bold text-gray-700">{currentSeq.length} 天一轮</span>
            </div>

            {/* 步骤胶囊序列 */}
            <div className="flex flex-wrap gap-1.5 items-center mb-2 min-h-[36px]">
              {currentSeq.map((shiftId, idx) => {
                const s = shifts.find(item => item.id === shiftId);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border shadow-sm text-xs font-bold relative group"
                    style={{ backgroundColor: s?.badgeBg || '#F3F4F6', color: s?.textColor || '#111' }}
                  >
                    <span>第{idx + 1}天: {s?.code || '休'}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="text-gray-400 hover:text-rose-600 ml-0.5"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {/* 点击添加班次进序列 */}
            <div className="pt-2 border-t border-gray-100">
              <span className="text-[10px] text-gray-500 block mb-1">点击向序列追加班次：</span>
              <div className="flex flex-wrap gap-1">
                {shifts.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleAddShiftToSeq(s.id)}
                    style={{ backgroundColor: s.badgeBg, color: s.textColor }}
                    className="px-2 py-0.5 rounded-md font-bold text-[10px] border border-black/5 motion-press flex items-center gap-0.5"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. 起始日期与排班时长 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">轮班基准起点</label>
              <input
                type="date"
                value={startDateStr}
                onChange={e => setStartDateStr(e.target.value)}
                className="w-full px-2 py-1 rounded-xl border border-gray-200 bg-white text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">生成覆盖范围</label>
              <select
                value={rangeMonths}
                onChange={e => setRangeMonths(Number(e.target.value))}
                className="w-full px-2 py-1 rounded-xl border border-gray-200 bg-white text-xs"
              >
                <option value={1}>生成 1 个月</option>
                <option value={3}>生成 3 个月 (一季)</option>
                <option value={6}>生成半年</option>
                <option value={12}>生成全年 (12个月)</option>
              </select>
            </div>
          </div>

          {/* 5. 节假日规则 */}
          <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] font-bold text-amber-900 block mb-1">国家节假日与调休补班处理：</span>
            <div className="space-y-1 text-[10px] text-gray-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="strat"
                  checked={holidayStrategy === 'auto_rest'}
                  onChange={() => setHolidayStrategy('auto_rest')}
                  className="accent-sunrise-500"
                />
                <span>遇法定节假日自动休 / 遇调休周末自动补班</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="strat"
                  checked={holidayStrategy === 'shift_priority_with_overtime'}
                  onChange={() => setHolidayStrategy('shift_priority_with_overtime')}
                  className="accent-sunrise-500"
                />
                <span>按周期严格执行，节假日出勤自动加权津贴</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <div className="flex items-center justify-between px-1 mb-2 text-[10px] text-gray-600 font-bold">
            <span>生成覆盖目标：</span>
            <div className="flex gap-3">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToA}
                  onChange={(e) => setApplyToA(e.target.checked)}
                  className="accent-sunrise-500 rounded-sm"
                />
                👦 {userNames.userNameA}
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToB}
                  onChange={(e) => setApplyToB(e.target.checked)}
                  className="accent-tealpartner-500 rounded-sm"
                />
                👧 {userNames.userNameB}
              </label>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sunrise-500 to-sunrise-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg motion-press"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>应用自定义序列并生成排班</span>
          </button>
        </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
