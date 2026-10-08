import { supabase } from './supabaseClient';
import { ShiftDefinition, DayScheduleRecord } from '../types/shift';
import { loadShifts, loadSchedules } from './storageService';

export const getSyncRoomCode = (): string | null => {
  return localStorage.getItem('sunrise_sync_room');
};

export const setSyncRoomCode = (code: string) => {
  localStorage.setItem('sunrise_sync_room', code);
};

export const clearSyncRoomCode = () => {
  localStorage.removeItem('sunrise_sync_room');
};

export const pushToCloud = async (roomCode: string, schedules?: Record<string, DayScheduleRecord>, shifts?: ShiftDefinition[]) => {
  if (!roomCode) return false;
  try {
    const currentSchedules = schedules || loadSchedules();
    const currentShifts = shifts || loadShifts();
    
    const { error } = await supabase
      .from('sync_rooms')
      .upsert({
        room_code: roomCode,
        schedules_json: currentSchedules,
        shifts_json: currentShifts,
        updated_at: new Date().toISOString()
      }, { onConflict: 'room_code' });
      
    if (error) {
      console.error('Cloud Push Error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Push exception:', err);
    return false;
  }
};

export const pullFromCloud = async (roomCode: string) => {
  if (!roomCode) return null;
  try {
    const { data, error } = await supabase
      .from('sync_rooms')
      .select('*')
      .eq('room_code', roomCode)
      .single();
      
    if (error) {
      console.error('Cloud Pull Error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.error('Pull exception:', err);
    return null;
  }
};
