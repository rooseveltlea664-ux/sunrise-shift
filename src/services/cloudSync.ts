import { createClient } from '@supabase/supabase-js';
import { DayScheduleRecord } from '../types/shift';

// 注意：由于是MVP版本，此处预留 Supabase 真实环境地址。
// 在实际部署时，将替换为真实的 SUPABASE_URL 和 SUPABASE_KEY
const SUPABASE_URL = 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export interface CloudHousehold {
  id: string;
  pair_code: string; // 家庭共享码，比如 "123456"
  created_at: string;
}

export interface CloudSchedule {
  pair_code: string;
  date_str: string; // "2026-10-04"
  shift_a_id: string;
  shift_b_id: string;
  shared_memo: string;
}

/**
 * 将本地的数据推送到云端 (Mock接口)
 */
export const pushScheduleToCloud = async (pairCode: string, records: Record<string, DayScheduleRecord>) => {
  // 真实场景：
  // 1. 将 records 转换为 CloudSchedule 数组
  // 2. await supabase.from('schedules').upsert(data)
  console.log(`[CloudSync] 推送本地排班至家庭群组 ${pairCode}...`, records);
  return { success: true };
};

/**
 * 监听云端的数据变化，实现两人互通 (Mock接口)
 */
export const subscribeToCloudChanges = (pairCode: string, onUpdate: (newRecords: Record<string, DayScheduleRecord>) => void) => {
  console.log(`[CloudSync] 开始监听家庭群组 ${pairCode} 的排班变化...`);
  
  // 真实场景：
  // const channel = supabase.channel(`household_${pairCode}`)
  //   .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules', filter: `pair_code=eq.${pairCode}` }, payload => {
  //      // parse payload and onUpdate(...)
  //   })
  //   .subscribe();
  // return () => supabase.removeChannel(channel);

  return () => {
    console.log(`[CloudSync] 取消监听家庭群组 ${pairCode}`);
  };
};
