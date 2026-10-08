import { ShiftDefinition, DayScheduleRecord } from '../types/shift';

export const INITIAL_SHIFTS: ShiftDefinition[] = [
  {
    id: 'shift_morning',
    name: '早班 (常规)',
    code: '早',
    startTime: '08:00',
    endTime: '16:30',
    isNextDay: false,
    durationHours: 8.0,
    category: 'regular',
    bgColor: '#EA580C',
    textColor: '#9A3412',
    badgeBg: '#FFEDE0',
    allowance: 0,
  },
  {
    id: 'shift_middle',
    name: '中班',
    code: '中',
    startTime: '12:00',
    endTime: '20:30',
    isNextDay: false,
    durationHours: 8.0,
    category: 'regular',
    bgColor: '#0284C7',
    textColor: '#0369A1',
    badgeBg: '#E0F2FE',
    allowance: 20,
  },
  {
    id: 'shift_night',
    name: '大夜班 (跨天)',
    code: '夜',
    startTime: '20:00',
    endTime: '08:00',
    isNextDay: true,
    durationHours: 11.0,
    category: 'night',
    bgColor: '#0D9488',
    textColor: '#115E59',
    badgeBg: '#E0F8F5',
    allowance: 80,
  },
  {
    id: 'shift_rest',
    name: '轮休 / 休息',
    code: '休',
    startTime: '00:00',
    endTime: '24:00',
    isNextDay: false,
    durationHours: 0,
    category: 'rest',
    bgColor: '#6B7280',
    textColor: '#4B5563',
    badgeBg: '#F3F4F6',
    allowance: 0,
  },
  {
    id: 'shift_compensate',
    name: '法定调休补班',
    code: '补',
    startTime: '08:30',
    endTime: '17:30',
    isNextDay: false,
    durationHours: 8.0,
    category: 'regular',
    bgColor: '#D97706',
    textColor: '#92400E',
    badgeBg: '#FEF3C7',
    allowance: 0,
  }
];

export const loadShifts = (): ShiftDefinition[] => {
  const data = localStorage.getItem('sunrise_shifts');
  return data ? JSON.parse(data) : INITIAL_SHIFTS;
};

export const saveShifts = (shifts: ShiftDefinition[]) => {
  localStorage.setItem('sunrise_shifts', JSON.stringify(shifts));
};

export const loadSchedules = (): Record<string, DayScheduleRecord> => {
  const data = localStorage.getItem('sunrise_schedules');
  return data ? JSON.parse(data) : {};
};

export const saveSchedules = (records: Record<string, DayScheduleRecord>) => {
  localStorage.setItem('sunrise_schedules', JSON.stringify(records));
};

export const loadDisplayStyle = (): 'split_vertical' | 'side_by_side' | 'slash_text' | 'pill_minimal' => {
  const style = localStorage.getItem('sunrise_display_style');
  return (style as any) || 'split_vertical';
};

export const saveDisplayStyle = (style: string) => {
  localStorage.setItem('sunrise_display_style', style);
};

export const loadUserSettings = (): { userNameA: string; userNameB: string; currentUserRole: 'A'|'B' } => {
  const data = localStorage.getItem('sunrise_user_settings');
  return data ? JSON.parse(data) : { userNameA: '小王', userNameB: '小李', currentUserRole: 'A' };
};

export const saveUserSettings = (settings: { userNameA: string; userNameB: string; currentUserRole: 'A'|'B' }) => {
  localStorage.setItem('sunrise_user_settings', JSON.stringify(settings));
};

import { CustomTemplate } from '../types/shift';

export const loadTemplates = (): CustomTemplate[] => {
  const data = localStorage.getItem('sunrise_templates');
  if (data) {
    return JSON.parse(data);
  }
  // Default templates if empty
  return [
    {
      id: 'preset_1',
      name: '两早两中两夜两休 (8天)',
      cycleA: ['shift_morning', 'shift_morning', 'shift_middle', 'shift_middle', 'shift_night', 'shift_night', 'shift_rest', 'shift_rest'],
      cycleB: ['shift_night', 'shift_night', 'shift_rest', 'shift_rest', 'shift_morning', 'shift_morning', 'shift_middle', 'shift_middle'],
      holidayStrategy: 'auto_rest'
    },
    {
      id: 'preset_2',
      name: '常规行政班 (双休)',
      cycleA: ['shift_morning', 'shift_morning', 'shift_morning', 'shift_morning', 'shift_morning', 'shift_rest', 'shift_rest'],
      cycleB: ['shift_morning', 'shift_morning', 'shift_morning', 'shift_morning', 'shift_morning', 'shift_rest', 'shift_rest'],
      holidayStrategy: 'auto_rest'
    }
  ];
};

export const saveTemplates = (templates: CustomTemplate[]) => {
  localStorage.setItem('sunrise_templates', JSON.stringify(templates));
};

import { AlarmSettings } from '../types/shift';

export const loadAlarms = (): AlarmSettings => {
  const data = localStorage.getItem('sunrise_alarms');
  if (data) return JSON.parse(data);
  return {
    target: 'mine_only',
    personA_alarms: {},
    personB_alarms: {}
  };
};

export const saveAlarms = (alarms: AlarmSettings) => {
  localStorage.setItem('sunrise_alarms', JSON.stringify(alarms));
};
