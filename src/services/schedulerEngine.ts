import { ShiftDefinition, DayScheduleRecord } from '../types/shift';
import { getHolidayInfo } from './holidayService';

export interface CycleTemplate {
  name: string;
  sequenceShiftIds: string[]; // 轮班周期模板
}

export const PRESET_TEMPLATES: CycleTemplate[] = [
  { name: '两早两中两夜两休 (8天循环)', sequenceShiftIds: ['shift_morning', 'shift_morning', 'shift_middle', 'shift_middle', 'shift_night', 'shift_night', 'shift_rest', 'shift_rest'] },
  { name: '两早两夜两休 (6天循环)', sequenceShiftIds: ['shift_morning', 'shift_morning', 'shift_night', 'shift_night', 'shift_rest', 'shift_rest'] },
  { name: '做一休一 (2天循环)', sequenceShiftIds: ['shift_morning', 'shift_rest'] },
  { name: '常规行政班 (上五休二)', sequenceShiftIds: ['shift_morning', 'shift_morning', 'shift_morning', 'shift_morning', 'shift_morning', 'shift_rest', 'shift_rest'] }
];

export const generateScheduleRange = (
  startDate: Date,
  daysCount: number,
  templateA: string[],
  templateB: string[],
  holidayStrategy: 'auto_rest' | 'shift_priority_with_overtime'
): Record<string, DayScheduleRecord> => {
  const result: Record<string, DayScheduleRecord> = {};
  const current = new Date(startDate);

  for (let i = 0; i < daysCount; i++) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const holiday = getHolidayInfo(dateStr);
    let shiftA = templateA[i % templateA.length];
    let shiftB = templateB[i % templateB.length];

    if (holidayStrategy === 'auto_rest') {
      if (holiday?.type === 'holiday_rest') {
        shiftA = 'shift_rest';
        shiftB = 'shift_rest';
      } else if (holiday?.type === 'work_compensate') {
        shiftA = 'shift_compensate';
        shiftB = 'shift_compensate';
      }
    }

    result[dateStr] = {
      dateStr,
      shiftAId: shiftA,
      shiftBId: shiftB,
      personalNotes: [],
      sharedMemo: '',
      alarmEnabled: true
    };

    current.setDate(current.getDate() + 1);
  }

  return result;
};
