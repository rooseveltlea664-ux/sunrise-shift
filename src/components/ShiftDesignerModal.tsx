import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShiftDefinition, ShiftCategory } from '../types/shift';
import { X, Plus, Trash2, Edit2, Palette, Clock, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shifts: ShiftDefinition[];
  onSaveShifts: (updatedShifts: ShiftDefinition[]) => void;
}

const COLOR_PRESETS = [
  { bg: '#EA580C', text: '#9A3412', badge: '#FFEDE0', name: '晨曦暖橙' },
  { bg: '#0D9488', text: '#115E59', badge: '#E0F8F5', name: '松石晨苍' },
  { bg: '#0284C7', text: '#0369A1', badge: '#E0F2FE', name: '清晨天蓝' },
  { bg: '#7C3AED', text: '#5B21B6', badge: '#F3E8FF', name: '梦幻薰衣' },
  { bg: '#E11D48', text: '#9F1239', badge: '#FFE4E6', name: '珊瑚樱红' },
  { bg: '#D97706', text: '#92400E', badge: '#FEF3C7', name: '琥珀金黄' },
  { bg: '#4B5563', text: '#374151', badge: '#F3F4F6', name: '质感雅灰' },
];

export const ShiftDesignerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  shifts,
  onSaveShifts,
}) => {
  const [editingShift, setEditingShift] = useState<ShiftDefinition | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // 表单状态
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isNextDay, setIsNextDay] = useState(false);
  const [durationHours, setDurationHours] = useState(8);
  const [category, setCategory] = useState<ShiftCategory>('regular');
  const [allowance, setAllowance] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);

  const startCreate = () => {
    setIsCreating(true);
    setEditingShift(null);
    setName('');
    setCode('');
    setStartTime('08:30');
    setEndTime('17:30');
    setIsNextDay(false);
    setDurationHours(8);
    setCategory('regular');
    setAllowance(0);
    setSelectedColorIdx(0);
  };

  const startEdit = (s: ShiftDefinition) => {
    setEditingShift(s);
    setIsCreating(false);
    setName(s.name);
    setCode(s.code);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setIsNextDay(s.isNextDay);
    setDurationHours(s.durationHours);
    setCategory(s.category);
    setAllowance(s.allowance);
    const cIdx = COLOR_PRESETS.findIndex(c => c.bg === s.bgColor);
    setSelectedColorIdx(cIdx >= 0 ? cIdx : 0);
  };

  const handleDelete = (id: string) => {
    if (shifts.length <= 2) {
      alert('至少需保留两个基础班次（如白班与休息）');
      return;
    }
    const updated = shifts.filter(s => s.id !== id);
    onSaveShifts(updated);
    if (editingShift?.id === id) setEditingShift(null);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('请填写班次名称与代号缩写');
      return;
    }

    const color = COLOR_PRESETS[selectedColorIdx];
    const newShiftData: ShiftDefinition = {
      id: editingShift ? editingShift.id : `shift_${Date.now()}`,
      name: name.trim(),
      code: code.trim().slice(0, 2),
      startTime,
      endTime,
      isNextDay,
      durationHours: Number(durationHours) || 8,
      category,
      bgColor: color.bg,
      textColor: color.text,
      badgeBg: color.badge,
      allowance: Number(allowance) || 0,
    };

    let updated: ShiftDefinition[];
    if (editingShift) {
      updated = shifts.map(s => (s.id === editingShift.id ? newShiftData : s));
    } else {
      updated = [...shifts, newShiftData];
    }

    onSaveShifts(updated);
    setEditingShift(null);
    setIsCreating(false);
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
            className="w-full max-w-sm liquid-card rounded-3xl p-5 shadow-2xl relative max-h-[90vh] flex flex-col z-10"
          >
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-gray-700" />
            </motion.button>

            <h3 className="text-base font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-sunrise-500" />
              <span>自定义班次设计器</span>
            </h3>
        <p className="text-[11px] text-gray-500 mb-3">自由添加早/中/夜/备岗/副班，自定义工时、时段与津贴</p>

        {/* 现有班次清单 */}
        {!isCreating && !editingShift && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-1">
              <span>现有班次库 ({shifts.length})</span>
              <button
                onClick={startCreate}
                className="px-2.5 py-1 bg-sunrise-500 text-white rounded-lg font-bold flex items-center gap-1 text-[11px] motion-press shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建班次</span>
              </button>
            </div>

            {shifts.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: idx * 0.04 }}
                style={{ willChange: 'transform, opacity' }}
                className="p-2.5 rounded-2xl bg-white/80 border border-gray-200 flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: s.badgeBg, color: s.textColor }}
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shadow-inner"
                  >
                    {s.code}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-gray-900">{s.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {s.startTime} - {s.endTime} {s.isNextDay ? '(次日)' : ''} · {s.durationHours}h
                      {s.allowance > 0 ? ` · 津贴¥${s.allowance}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(s)}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 motion-press"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 motion-press"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* 新增 / 编辑表单 */}
        {(isCreating || editingShift) && (
          <form onSubmit={handleSaveForm} className="flex-1 overflow-y-auto space-y-2.5 text-xs pr-0.5">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100">
              <span className="font-bold text-gray-800 text-xs">
                {editingShift ? `编辑班次: ${editingShift.name}` : '新建自定义班次'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingShift(null);
                }}
                className="text-[11px] text-gray-400 hover:text-gray-700"
              >
                返回列表
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">班次全称</label>
                <input
                  type="text"
                  placeholder="如: 副夜班 / 行政早班"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs focus:ring-1 focus:ring-sunrise-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">缩写(1-2字)</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="如: 副"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs text-center font-bold focus:ring-1 focus:ring-sunrise-500 outline-none"
                  required
                />
              </div>
            </div>

            {/* 时段与跨天 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">上班时间</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full px-2 py-1 rounded-xl border border-gray-200 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">下班时间</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full px-2 py-1 rounded-xl border border-gray-200 bg-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] text-gray-700">是否属于跨午夜次日班次？</span>
              <input
                type="checkbox"
                checked={isNextDay}
                onChange={e => setIsNextDay(e.target.checked)}
                className="rounded accent-sunrise-500 w-4 h-4 cursor-pointer"
              />
            </div>

            {/* 工时与津贴 */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">有效净工时 (h)</label>
                <input
                  type="number"
                  step="0.5"
                  value={durationHours}
                  onChange={e => setDurationHours(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-600 block mb-0.5">班次补贴津贴 (¥)</label>
                <input
                  type="number"
                  value={allowance}
                  onChange={e => setAllowance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-mono text-emerald-600 font-bold"
                />
              </div>
            </div>

            {/* 班次类别 */}
            <div>
              <label className="text-[10px] font-semibold text-gray-600 block mb-1">班次性质分类</label>
              <div className="grid grid-cols-4 gap-1 text-[10px]">
                {[
                  { id: 'regular', label: '工作班' },
                  { id: 'night', label: '夜班' },
                  { id: 'rest', label: '休假日' },
                  { id: 'duty', label: '值班待命' },
                ].map(c => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => setCategory(c.id as ShiftCategory)}
                    className={`py-1 rounded-lg border font-medium ${
                      category === c.id
                        ? 'bg-black text-white font-bold border-black'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 颜色选择器 */}
            <div>
              <label className="text-[10px] font-semibold text-gray-600 block mb-1">选择徽章色系</label>
              <div className="flex items-center gap-1.5">
                {COLOR_PRESETS.map((color, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedColorIdx(idx)}
                    style={{ backgroundColor: color.bg }}
                    className={`w-6 h-6 rounded-full cursor-pointer motion-press flex items-center justify-center ${
                      selectedColorIdx === idx ? 'ring-2 ring-black scale-110' : 'opacity-85'
                    }`}
                  >
                    {selectedColorIdx === idx && <Check className="w-3 h-3 text-white" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-sunrise-500 hover:bg-sunrise-600 text-white font-bold text-xs shadow-md motion-press"
              >
                保存此班次配置
              </button>
            </div>
          </form>
        )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
