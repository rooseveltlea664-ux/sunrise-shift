import { LocalNotifications } from '@capacitor/local-notifications';
import { DayScheduleRecord, AlarmSettings, ShiftDefinition } from '../types/shift';

export const syncAlarmsNatively = async (
  schedules: Record<string, DayScheduleRecord>,
  alarms: AlarmSettings,
  shiftsMap: Record<string, ShiftDefinition>,
  userNames: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' }
) => {
  const { currentUserRole } = userNames;
  // Check if we are running in a Capacitor Native environment
  const isNative = !!(window as any).Capacitor?.isNative;
  if (!isNative) return;

  try {
    // Request permission (Required for iOS 10+)
    const permStatus = await LocalNotifications.requestPermissions();
    if (permStatus.display !== 'granted') return;

    // Clear all existing notifications to avoid duplicates
    await LocalNotifications.cancel({ notifications: [] }); // Canceling empty array doesn't clear all? Wait, usually we need to get pending and cancel.
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notifications: any[] = [];
    let idCounter = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Object.entries(schedules).forEach(([dateStr, record]) => {
      const [yyyy, mm, dd] = dateStr.split('-').map(Number);
      const scheduleDate = new Date(yyyy, mm - 1, dd);
      
      // Only schedule alarms for today and future dates (limit to next 30 days to avoid OS limit)
      const diffDays = Math.floor((scheduleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 30) return;

      const processPerson = (shiftId: string, role: 'A' | 'B', name: string) => {
        if (!shiftId) return;
        const configMap = role === 'A' ? alarms.personA_alarms : alarms.personB_alarms;
        const conf = configMap[shiftId];
        
        // If alarm is enabled for this shift
        if (conf && conf.enabled) {
          // Check strategy
          const isMe = role === currentUserRole;
          if (alarms.target === 'mine_only' && !isMe) return;

          const [hh, min] = conf.time.split(':').map(Number);
          const alarmTime = new Date(yyyy, mm - 1, dd, hh, min, 0);
          
          // Don't schedule if time has passed
          if (alarmTime.getTime() <= new Date().getTime()) return;

          const shiftName = shiftsMap[shiftId]?.name || '班次';

          notifications.push({
            id: idCounter++,
            title: `⏰ 起床啦！(${name}的${shiftName})`,
            body: `准备开启新的一天，别忘了打卡哦。`,
            schedule: { at: alarmTime },
            sound: null, // use default
            smallIcon: 'ic_stat_icon_config_sample' // Optional: Android small icon
          });
        }
      };

      processPerson(record.shiftAId, 'A', '您');
      processPerson(record.shiftBId, 'B', 'TA');
    });

    if (notifications.length > 0) {
      // Schedule in batches to be safe
      await LocalNotifications.schedule({ notifications });
    }

  } catch (error) {
    console.warn("Failed to sync local notifications:", error);
  }
};
