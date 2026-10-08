export type ShiftCategory = 'regular' | 'night' | 'rest' | 'overtime' | 'duty';

export interface ShiftDefinition {
  id: string;
  name: string;
  code: string; // 1-2字缩写，如 "早", "夜", "休"
  startTime: string; // "08:30"
  endTime: string;   // "17:30"
  isNextDay: boolean; // 是否跨午夜次日
  durationHours: number; // 净工时
  category: ShiftCategory;
  bgColor: string;
  textColor: string;
  badgeBg: string;
  allowance: number; // 津贴
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export interface DayScheduleRecord {
  dateStr: string; // "2026-10-04"
  shiftAId: string;
  shiftBId: string;
  personalNotes: TaskItem[];
  sharedMemo: string;
  alarmEnabled: boolean;
}

export interface HolidayData {
  dateStr: string;
  name: string;
  type: 'holiday_rest' | 'work_compensate';
}

export type ViewPerspective = 'both' | 'me' | 'partner' | 'together';
export type AppFontFamily = 'modern' | 'wenkai' | 'serif' | 'round' | 'mono';
export type ThemeMode = 'light' | 'dark' | 'system' | 'auto';

// ★★★ 双人排班在月历中的自定义展示风格 ★★★
export type CalendarDisplayStyle = 
  | 'split_vertical'   // 上下对半分栏 (极高对比，推荐)
  | 'side_by_side'    // 左右并列微胶囊
  | 'slash_text'      // 极简斜杠文本 (极简纯粹)
  | 'pill_minimal';   // 极简微圆标 (清爽)

export interface UserSettings {
  userNameA: string; // e.g. '老公'
  userNameB: string; // e.g. '老婆'
  currentUserRole: 'A' | 'B'; // 决定当前设备的主视角是谁
}

export interface CustomTemplate {
  id: string;
  name: string;
  cycleA: string[];
  cycleB: string[];
  holidayStrategy: 'auto_rest' | 'shift_priority_with_overtime';
}

export interface ShiftAlarmConfig {
  enabled: boolean;
  time: string; // e.g. "06:30"
}

export interface AlarmSettings {
  target: 'mine_only' | 'both';
  personA_alarms: Record<string, ShiftAlarmConfig>; // shiftId -> config
  personB_alarms: Record<string, ShiftAlarmConfig>; // shiftId -> config
}

