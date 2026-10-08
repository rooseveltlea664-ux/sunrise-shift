import { HolidayData } from '../types/shift';

// 2026年国务院法定节假日及周末调休补班数据库
export const NATIONAL_HOLIDAYS_2026: Record<string, HolidayData> = {
  // 元旦
  '2026-01-01': { dateStr: '2026-01-01', name: '元旦', type: 'holiday_rest' },
  // 春节
  '2026-02-14': { dateStr: '2026-02-14', name: '除夕前补班', type: 'work_compensate' },
  '2026-02-16': { dateStr: '2026-02-16', name: '春节', type: 'holiday_rest' },
  '2026-02-17': { dateStr: '2026-02-17', name: '初一', type: 'holiday_rest' },
  '2026-02-18': { dateStr: '2026-02-18', name: '初二', type: 'holiday_rest' },
  '2026-02-19': { dateStr: '2026-02-19', name: '初三', type: 'holiday_rest' },
  '2026-02-20': { dateStr: '2026-02-20', name: '初四', type: 'holiday_rest' },
  '2026-02-21': { dateStr: '2026-02-21', name: '初五', type: 'holiday_rest' },
  '2026-02-22': { dateStr: '2026-02-22', name: '初六', type: 'holiday_rest' },
  '2026-02-28': { dateStr: '2026-02-28', name: '春节补班', type: 'work_compensate' },
  // 清明
  '2026-04-04': { dateStr: '2026-04-04', name: '清明节', type: 'holiday_rest' },
  '2026-04-05': { dateStr: '2026-04-05', name: '清明休', type: 'holiday_rest' },
  '2026-04-06': { dateStr: '2026-04-06', name: '清明休', type: 'holiday_rest' },
  // 劳动节
  '2026-04-26': { dateStr: '2026-04-26', name: '五一调休补班', type: 'work_compensate' },
  '2026-05-01': { dateStr: '2026-05-01', name: '劳动节', type: 'holiday_rest' },
  '2026-05-02': { dateStr: '2026-05-02', name: '五一休', type: 'holiday_rest' },
  '2026-05-03': { dateStr: '2026-05-03', name: '五一休', type: 'holiday_rest' },
  '2026-05-04': { dateStr: '2026-05-04', name: '五一休', type: 'holiday_rest' },
  '2026-05-05': { dateStr: '2026-05-05', name: '五一休', type: 'holiday_rest' },
  '2026-05-09': { dateStr: '2026-05-09', name: '五一补班', type: 'work_compensate' },
  // 端午
  '2026-06-19': { dateStr: '2026-06-19', name: '端午节', type: 'holiday_rest' },
  // 中秋 & 国庆
  '2026-09-25': { dateStr: '2026-09-25', name: '中秋节', type: 'holiday_rest' },
  '2026-09-27': { dateStr: '2026-09-27', name: '国庆补班', type: 'work_compensate' },
  '2026-10-01': { dateStr: '2026-10-01', name: '国庆节', type: 'holiday_rest' },
  '2026-10-02': { dateStr: '2026-10-02', name: '国庆休', type: 'holiday_rest' },
  '2026-10-03': { dateStr: '2026-10-03', name: '国庆休', type: 'holiday_rest' },
  '2026-10-04': { dateStr: '2026-10-04', name: '国庆休', type: 'holiday_rest' },
  '2026-10-05': { dateStr: '2026-10-05', name: '国庆休', type: 'holiday_rest' },
  '2026-10-06': { dateStr: '2026-10-06', name: '国庆休', type: 'holiday_rest' },
  '2026-10-07': { dateStr: '2026-10-07', name: '国庆休', type: 'holiday_rest' },
  '2026-10-10': { dateStr: '2026-10-10', name: '国庆补班', type: 'work_compensate' },
};

export const getHolidayInfo = (dateStr: string): HolidayData | null => {
  return NATIONAL_HOLIDAYS_2026[dateStr] || null;
};
