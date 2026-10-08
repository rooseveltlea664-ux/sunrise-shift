import React, { useState } from 'react';
import { X, Clock, BellRing, BellOff } from 'lucide-react';
import { ShiftDefinition, AlarmSettings, ShiftAlarmConfig } from '../types/shift';
import { saveAlarms } from '../services/storageService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  shifts: ShiftDefinition[];
  userNames: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' };
  alarms: AlarmSettings;
  setAlarms: React.Dispatch<React.SetStateAction<AlarmSettings>>;
}

export const AlarmSettingsModal: React.FC<Props> = ({ isOpen, onClose, shifts, userNames, alarms, setAlarms }) => {
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');

  if (!isOpen) return null;

  const currentAlarms = activeTab === 'A' ? alarms.personA_alarms : alarms.personB_alarms;

  const handleUpdateAlarm = (shiftId: string, updates: Partial<ShiftAlarmConfig>) => {
    const newAlarms = { ...alarms };
    const targetMap = activeTab === 'A' ? newAlarms.personA_alarms : newAlarms.personB_alarms;
    
    if (!targetMap[shiftId]) {
      targetMap[shiftId] = { enabled: false, time: '07:00' };
    }
    
    targetMap[shiftId] = { ...targetMap[shiftId], ...updates };
    setAlarms(newAlarms);
    saveAlarms(newAlarms);
  };

  const handleTargetChange = (target: 'mine_only' | 'both') => {
    const newAlarms = { ...alarms, target };
    setAlarms(newAlarms);
    saveAlarms(newAlarms);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-sm liquid-card rounded-3xl p-5 shadow-2xl relative max-h-[92vh] flex flex-col motion-scale-spring">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center motion-press"
        >
          <X className="w-4 h-4 text-gray-700" />
        </button>

        <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-1.5">
          <Clock className="w-5 h-5 text-sunrise-500" />
          <span>自适应智能闹钟</span>
        </h3>
        <p className="text-[11px] text-gray-500 mb-4">
          系统会根据每日排班表，自动在指定时间呼叫系统原生闹钟。
        </p>

        {/* 响铃策略 */}
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 mb-4">
          <label className="text-[11px] font-bold text-amber-900 block mb-2">当前设备的响铃策略：</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="radio"
                checked={alarms.target === 'mine_only'}
                onChange={() => handleTargetChange('mine_only')}
                className="accent-amber-500 w-3.5 h-3.5"
              />
              <span className={alarms.target === 'mine_only' ? 'text-amber-800' : ''}>
                只为【我的班次】响铃 (互不打扰)
              </span>
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="radio"
                checked={alarms.target === 'both'}
                onChange={() => handleTargetChange('both')}
                className="accent-amber-500 w-3.5 h-3.5"
              />
              <span className={alarms.target === 'both' ? 'text-amber-800' : ''}>
                为【双方的班次】均响铃 (方便做早餐等)
              </span>
            </label>
          </div>
        </div>

        {/* 双人配置切换 */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-3 text-[11px] font-bold">
          <button
            onClick={() => setActiveTab('A')}
            className={`flex-1 py-1.5 rounded-lg motion-liquid-pill truncate px-1 ${
              activeTab === 'A' ? 'bg-white text-sunrise-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            👦 {userNames.userNameA}的作息
          </button>
          <button
            onClick={() => setActiveTab('B')}
            className={`flex-1 py-1.5 rounded-lg motion-liquid-pill truncate px-1 ${
              activeTab === 'B' ? 'bg-white text-tealpartner-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            👧 {userNames.userNameB}的作息
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {shifts.map(shift => {
            const isRest = shift.category === 'rest';
            const config = currentAlarms[shift.id] || { enabled: false, time: isRest ? '09:00' : '07:00' };

            return (
              <div key={shift.id} className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{ backgroundColor: shift.badgeBg, color: shift.textColor }}
                  >
                    {shift.code}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-800">{shift.name}</div>
                    <div className="text-[9px] text-gray-400">{shift.startTime} - {shift.endTime}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={config.time}
                    onChange={e => handleUpdateAlarm(shift.id, { time: e.target.value })}
                    disabled={!config.enabled}
                    className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
                      config.enabled ? 'bg-gray-50 border-gray-200 text-gray-900' : 'bg-gray-100/50 border-transparent text-gray-400'
                    }`}
                  />
                  <button
                    onClick={() => handleUpdateAlarm(shift.id, { enabled: !config.enabled })}
                    className={`p-1.5 rounded-xl motion-press ${
                      config.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {config.enabled ? <BellRing className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
