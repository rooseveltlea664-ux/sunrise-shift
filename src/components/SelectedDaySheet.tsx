import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DayScheduleRecord, ShiftDefinition, TaskItem } from '../types/shift';
import { Briefcase, MessageSquare, Bell, Plus, Heart, Trash2 } from 'lucide-react';

interface Props {
  dateStr: string;
  record: DayScheduleRecord | undefined;
  shiftsMap: Record<string, ShiftDefinition>;
  onUpdateRecord: (updated: DayScheduleRecord) => void;
  userNames: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' };
}

export const SelectedDaySheet: React.FC<Props> = ({
  dateStr,
  record,
  shiftsMap,
  onUpdateRecord,
  userNames,
}) => {
  const [newText, setNewText] = useState('');

  const currentRecord: DayScheduleRecord = record || {
    dateStr,
    shiftAId: 'shift_morning',
    shiftBId: 'shift_rest',
    personalNotes: [
      { id: '1', text: '早会交接危重患者病历与医嘱', completed: true, createdAt: '08:00' },
      { id: '2', text: '14:00 巡检厂区2号流水线压力表', completed: false, createdAt: '14:00' },
    ],
    sharedMemo: '下班顺路取顺丰快递，保温杯已泡好菊花枸杞茶在玄关❤️',
    alarmEnabled: true,
  };

  const shiftA = shiftsMap[currentRecord.shiftAId];
  const shiftB = shiftsMap[currentRecord.shiftBId];
  const isTogether = shiftA?.category === 'rest' && shiftB?.category === 'rest';

  const handleToggleTask = (taskId: string) => {
    const updatedTasks = currentRecord.personalNotes.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdateRecord({ ...currentRecord, personalNotes: updatedTasks });
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const updatedTasks = currentRecord.personalNotes.filter(t => t.id !== taskId);
    onUpdateRecord({ ...currentRecord, personalNotes: updatedTasks });
  };

  const handleAddTask = () => {
    if (!newText.trim()) return;
    const newTask: TaskItem = {
      id: Date.now().toString(),
      text: newText.trim(),
      completed: false,
      createdAt: new Date().toLocaleTimeString().slice(0, 5),
    };
    onUpdateRecord({
      ...currentRecord,
      personalNotes: [...currentRecord.personalNotes, newTask],
    });
    setNewText('');
  };


  const handleToggleAlarm = () => {
    onUpdateRecord({
      ...currentRecord,
      alarmEnabled: !currentRecord.alarmEnabled,
    });
  };

  return (
    <motion.div 
      key={dateStr}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className="mt-2.5 liquid-card rounded-3xl p-3.5 shadow-lg space-y-2.5"
    >
      {/* 头部标题与闹钟联动 */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-gray-900 text-xs">{dateStr}</span>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
              isTogether 
                ? 'bg-rose-50 text-rose-700 border-rose-200' 
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {isTogether ? '☀️ 双方同休' : `${shiftA?.name || '早班'} · ${shiftB?.name || '休'}`}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {userNames.userNameA} ({shiftA?.startTime}-{shiftA?.endTime}) | {userNames.userNameB} ({shiftB?.startTime}-{shiftB?.endTime})
          </p>
        </div>
        <button
          onClick={handleToggleAlarm}
          className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium border flex items-center gap-1 motion-press ${
            currentRecord.alarmEnabled
              ? 'bg-sunrise-50 text-sunrise-600 border-sunrise-200'
              : 'bg-gray-100 text-gray-400 border-gray-200'
          }`}
        >
          <Bell className="w-3 h-3" />
          <span>{currentRecord.alarmEnabled ? '闹钟自适应' : '已静音'}</span>
        </button>
      </div>

      {/* 个人工作专属备注 (To-Do 清单) */}
      <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
            <Briefcase className="w-3.5 h-3.5 text-amber-700" />
            <span>我的今日工作备注 (个人专属待办)</span>
          </span>
          <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-mono">
            {currentRecord.personalNotes.length} 项任务
          </span>
        </div>

          <div className="flex flex-col gap-1 text-[11px]">
            <AnimatePresence initial={false}>
            {currentRecord.personalNotes.map(task => (
              <motion.label
                key={task.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between w-full text-gray-800 cursor-pointer overflow-hidden group"
              >
                <div className="flex items-center gap-1.5 flex-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task.id)}
                    className="rounded text-sunrise-500 accent-sunrise-500"
                  />
                  <span
                    className={`transition-all duration-300 ${
                      task.completed ? 'line-through text-gray-400' : 'font-medium text-gray-700'
                    }`}
                  >
                    {task.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteTask(task.id, e)}
                  className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.label>
            ))}
            </AnimatePresence>
          </div>

        <div className="mt-2 flex items-center gap-1">
          <input
            type="text"
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTask()}
            placeholder="+ 添加今日工作备忘/交接事项..."
            className="flex-1 text-[10px] px-2.5 py-1 bg-white rounded-lg border border-amber-200 focus:outline-none focus:ring-1 focus:ring-sunrise-500"
          />
          <button
            onClick={handleAddTask}
            className="px-2.5 py-1 bg-amber-800 text-white text-[10px] rounded-lg font-bold motion-press flex items-center gap-0.5"
          >
            <Plus className="w-3 h-3" />
            <span>添加</span>
          </button>
        </div>
      </div>

      {/* 双人共享留言板 */}
      <div className="p-2 rounded-xl bg-white/60 border border-gray-100 flex items-start gap-1.5 motion-press">
        <MessageSquare className="w-3.5 h-3.5 text-tealpartner-600 mt-0.5" />
        <div className="flex-1 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-700 text-[11px]">双人交班便签 (双方同步)</span>
            <span className="text-[9px] text-gray-400">实时保存</span>
          </div>
          <textarea
            value={currentRecord.sharedMemo}
            onChange={e => onUpdateRecord({ ...currentRecord, sharedMemo: e.target.value })}
            placeholder="写下给对方的温馨提示..."
            className="w-full text-[11px] text-gray-600 leading-tight bg-transparent border-none resize-none focus:outline-none focus:ring-0 placeholder-gray-400"
            rows={2}
          />
        </div>
      </div>
    </motion.div>
  );
};
