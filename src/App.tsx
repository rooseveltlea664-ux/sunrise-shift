import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShiftDefinition,
  DayScheduleRecord,
  ViewPerspective,
  AppFontFamily,
  CalendarDisplayStyle,
  AlarmSettings,
  ThemeMode
} from './types/shift';
import {
  loadShifts,
  saveShifts,
  loadSchedules,
  saveSchedules,
  loadDisplayStyle,
  saveDisplayStyle,
  loadUserSettings,
  saveUserSettings,
  loadAlarms,
} from './services/storageService';
import { syncAlarmsNatively } from './services/alarmService';
import { pushToCloud, pullFromCloud, getSyncRoomCode } from './services/syncService';
import { Keyboard } from '@capacitor/keyboard';
import { Preferences } from '@capacitor/preferences';
import { LiquidNavbar } from './components/LiquidNavbar';
import { ShiftFilterBar } from './components/ShiftFilterBar';
import { CalendarGrid } from './components/CalendarGrid';
import { SelectedDaySheet } from './components/SelectedDaySheet';
import { FullMonthOverview } from './components/FullMonthOverview';
import { ShiftDesignerModal } from './components/ShiftDesignerModal';
import { CycleSchedulerModal } from './components/CycleSchedulerModal';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { WidgetsAndSettings } from './components/WidgetsAndSettings';
import { AlarmSettingsModal } from './components/AlarmSettingsModal';
import { Calendar, Repeat, BarChart2, Settings, Palette } from 'lucide-react';

export const App: React.FC = () => {
  const [shifts, setShifts] = useState<ShiftDefinition[]>(loadShifts());
  const shiftsMap = React.useMemo(() => {
    return shifts.reduce((acc, s) => {
      acc[s.id] = s;
      return acc;
    }, {} as Record<string, ShiftDefinition>);
  }, [shifts]);

  const today = new Date();
  const initYear = today.getFullYear();
  const initMonth = today.getMonth() + 1;
  const initDateStr = `${initYear}-${String(initMonth).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [currentYear, setCurrentYear] = useState(initYear);
  const [currentMonth, setCurrentMonth] = useState(initMonth);
  const [monthDirection, setMonthDirection] = useState(0);
  const [schedules, setSchedules] = useState<Record<string, DayScheduleRecord>>({});
  const [selectedDate, setSelectedDate] = useState(initDateStr);
  const [perspective, setPerspective] = useState<ViewPerspective>('both');
  const [activeTab, setActiveTab] = useState<'calendar' | 'cycle' | 'analytics' | 'settings'>('calendar');

  // 双人排班在月历中的自定义展示风格
  const [displayStyle, setDisplayStyle] = useState<CalendarDisplayStyle>(loadDisplayStyle());
  const handleDisplayStyleChange = (style: CalendarDisplayStyle) => {
    setDisplayStyle(style);
    saveDisplayStyle(style);
  };

  const [userNames, setUserNames] = useState(loadUserSettings());
  const handleUserNamesChange = (names: { userNameA: string; userNameB: string; currentUserRole: 'A'|'B' }) => {
    setUserNames(names);
    saveUserSettings(names);
  };

  // 弹窗状态
  const [isShiftDesignerOpen, setIsShiftDesignerOpen] = useState(false);
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [alarms, setAlarms] = useState<AlarmSettings>(() => loadAlarms());

  // 外观个性化状态
  const [font, setFont] = useState<AppFontFamily>('modern');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => (localStorage.getItem('sunrise_theme_mode') as ThemeMode) || 'auto');

  const [bgOpacity, setBgOpacity] = useState(94);
  const [bgBlur, setBgBlur] = useState(16);
  const [wallpaperUrl, setWallpaperUrl] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [screenMetrics, setScreenMetrics] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    // 锁定初始屏幕尺寸，防止键盘弹出导致背景重绘形变
    setScreenMetrics({ w: window.innerWidth, h: window.innerHeight });

    const loadPrefs = async () => {
      const { value: op } = await Preferences.get({ key: 'sunrise_bg_opacity' });
      if (op !== null) setBgOpacity(Number(op));
      const { value: bl } = await Preferences.get({ key: 'sunrise_bg_blur' });
      if (bl !== null) setBgBlur(Number(bl));
      const { value: wp } = await Preferences.get({ key: 'sunrise_wallpaper' });
      if (wp) setWallpaperUrl(wp);
      
      // 等待配置加载完毕再揭开界面，防止闪烁
      setIsBooting(false);
    };
    loadPrefs();

    Keyboard.addListener('keyboardWillShow', () => setIsKeyboardVisible(true));
    Keyboard.addListener('keyboardWillHide', () => setIsKeyboardVisible(false));
    return () => {
      Keyboard.removeAllListeners();
    };
  }, []);

  // Debounce save for opacity and blur to avoid Capacitor bridge spamming
  useEffect(() => {
    const timer = setTimeout(() => {
      Preferences.set({ key: 'sunrise_bg_opacity', value: bgOpacity.toString() });
      Preferences.set({ key: 'sunrise_bg_blur', value: bgBlur.toString() });
    }, 500);
    return () => clearTimeout(timer);
  }, [bgOpacity, bgBlur]);

  // Theme effect
  useEffect(() => {
    localStorage.setItem('sunrise_theme_mode', themeMode);
    
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'dark') isDark = true;
      else if (themeMode === 'light') isDark = false;
      else if (themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      else if (themeMode === 'auto') {
        const hour = new Date().getHours();
        isDark = hour < 6 || hour >= 18; // Sunset at 18:00, sunrise at 6:00
      }
      
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };
    applyTheme();
    
    // Setup listener for system changes if needed
    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme();
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [themeMode]);

  // 同步原生闹钟
  useEffect(() => {
    syncAlarmsNatively(schedules, alarms, shiftsMap, userNames);
  }, [alarms, schedules]);

  // 初始化排班
  useEffect(() => {
    const loaded = loadSchedules();
    if (Object.keys(loaded).length > 0) {
      // 兼容性清理：如果存在之前的假数据，自动清空
      let hasDummy = false;
      Object.keys(loaded).forEach(k => {
        if (loaded[k].sharedMemo === '下班顺路取顺丰快递，玄关泡好了菊花枸杞茶❤️') {
          loaded[k].sharedMemo = '';
          hasDummy = true;
        }
        const origLen = loaded[k].personalNotes.length;
        loaded[k].personalNotes = loaded[k].personalNotes.filter(n => !n.text.includes('车间2号') && !n.text.includes('早班医生'));
        if (loaded[k].personalNotes.length !== origLen) hasDummy = true;
      });
      if (hasDummy) {
        saveSchedules(loaded);
      }
      setSchedules(loaded);
      
      const rc = getSyncRoomCode();
      if (rc) {
        pullFromCloud(rc).then(data => {
          if (data && data.schedules_json) {
            setSchedules(data.schedules_json);
            saveSchedules(data.schedules_json);
          }
          if (data && data.shifts_json) {
            setShifts(data.shifts_json);
            saveShifts(data.shifts_json);
          }
        });
      }
    } else {
      const initData: Record<string, DayScheduleRecord> = {};
      const dDate = new Date();
      const iY = dDate.getFullYear();
      const iM = String(dDate.getMonth() + 1).padStart(2, '0');
      for (let i = 1; i <= 31; i++) {
        const dStr = `${iY}-${iM}-${String(i).padStart(2, '0')}`;
        let sA = 'shift_morning';
        let sB = 'shift_middle';
        if (i === 2 || i === 3 || i === 9 || i === 16 || i === 17 || i === 24) {
          sA = 'shift_rest';
          sB = 'shift_rest';
        } else if (i === 4) {
          sA = 'shift_morning';
          sB = 'shift_night';
        } else if (i === 8 || i === 10) {
          sA = 'shift_compensate';
          sB = 'shift_compensate';
        }
        initData[dStr] = {
          dateStr: dStr,
          shiftAId: sA,
          shiftBId: sB,
          personalNotes: [],
          sharedMemo: '',
          alarmEnabled: true,
        };
      }
      setSchedules(initData);
      saveSchedules(initData);
    }
  }, []);

  const handleUpdateRecord = (updated: DayScheduleRecord) => {
    const next = { ...schedules, [updated.dateStr]: updated };
    setSchedules(next);
    saveSchedules(next);
    pushToCloud(getSyncRoomCode() || '', next, shifts);
  };

  const handleSaveShifts = (updatedShifts: ShiftDefinition[]) => {
    setShifts(updatedShifts);
    saveShifts(updatedShifts);
    pushToCloud(getSyncRoomCode() || '', schedules, updatedShifts);
  };

  const handleApplyGenerated = (newRecords: Record<string, DayScheduleRecord>, applyToA: boolean, applyToB: boolean) => {
    const merged = { ...schedules };
    for (const [dateStr, newRec] of Object.entries(newRecords)) {
      if (!merged[dateStr]) {
        merged[dateStr] = {
          ...newRec,
          shiftAId: applyToA ? newRec.shiftAId : 'shift_rest',
          shiftBId: applyToB ? newRec.shiftBId : 'shift_rest'
        };
      } else {
        merged[dateStr] = {
          ...merged[dateStr],
          shiftAId: applyToA ? newRec.shiftAId : merged[dateStr].shiftAId,
          shiftBId: applyToB ? newRec.shiftBId : merged[dateStr].shiftBId,
        };
      }
    }
    setSchedules(merged);
    saveSchedules(merged);
    syncAlarmsNatively(merged, alarms, shiftsMap, userNames);
    pushToCloud(getSyncRoomCode() || '', merged, shifts);
  };

  const handleUploadWallpaper = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 1080;
          if (width > height && width > max_size) {
            height *= max_size / width;
            width = max_size;
          } else if (height > max_size) {
            width *= max_size / height;
            height = max_size;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL('image/jpeg', 0.6); // 60% quality JPEG
          
          setWallpaperUrl(compressedUrl);
          Preferences.set({ key: 'sunrise_wallpaper', value: compressedUrl });
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBgOpacityChange = (val: number) => {
    setBgOpacity(val);
  };

  const handleBgBlurChange = (val: number) => {
    setBgBlur(val);
  };

  const handlePrevMonth = () => {
    setMonthDirection(-1);
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    setMonthDirection(1);
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setMonthDirection(0);
    const t = new Date();
    setCurrentYear(t.getFullYear());
    setCurrentMonth(t.getMonth() + 1);
    setSelectedDate(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`);
  };

  const fontClassMap: Record<AppFontFamily, string> = {
    modern: 'font-modern',
    wenkai: 'font-wenkai',
    serif: 'font-serif',
    round: 'font-round',
    mono: 'font-mono',
  };

  if (isBooting) {
    return <div className="h-dvh w-screen bg-[#09090b]"></div>;
  }

  return (
    <div
      className={`h-full w-full flex flex-col ${fontClassMap[font]}`}
      style={{
        ['--card-bg-opacity' as any]: bgOpacity / 100,
        ['--card-blur' as any]: `${bgBlur}px`,
      }}
    >
      {/* 绝对固定、不受键盘挤压影响的沉浸式全局壁纸层 */}
      <div
        className="fixed top-0 left-0 bg-cover bg-center z-0 transition-opacity duration-700 pointer-events-none"
        style={{ 
          backgroundImage: `url('${wallpaperUrl}')`,
          width: screenMetrics.w,
          height: screenMetrics.h
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/35 pointer-events-none"></div>
      </div>

      <div className="flex-1 w-full overflow-hidden flex flex-col relative select-none z-10">
        {/* 原生系统状态栏占位区 (留白给手机真实的顶部状态栏) */}
        <div style={{ paddingTop: 'env(safe-area-inset-top, 24px)' }}></div>

        {/* 液态玻璃顶栏 (纯净月历导航) */}
        <LiquidNavbar
          currentMonthText={`${currentYear}年${currentMonth}月`}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        {/* 视角透视过滤胶囊 */}
        {activeTab === 'calendar' && (
          <ShiftFilterBar currentPerspective={perspective} onChange={setPerspective} userNames={userNames} />
        )}

        {/* 核心主展示区：纯净专注的单一大月历 + 当日深度抽屉 */}
        <div className="flex-1 px-4 overflow-y-auto relative z-10 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              style={{ willChange: 'transform, opacity' }}
            >
              {activeTab === 'calendar' && (
                <div className="space-y-2.5">
                  {/* 1. 经典 68px 标准黄金比例 31 天整月大网格 */}
                  <CalendarGrid
                    year={currentYear}
                    month={currentMonth}
                    monthDirection={monthDirection}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    schedules={schedules}
                    shiftsMap={shiftsMap}
                    perspective={perspective}
                    displayStyle={displayStyle}
                    onDisplayStyleChange={handleDisplayStyleChange}
                    userNames={userNames}
                  />

                  {/* 2. 选中日期详情抽屉：整合个人专属工作待办清单、双人便签、动态闹钟 */}
                  <SelectedDaySheet
                    dateStr={selectedDate}
                    record={schedules[selectedDate]}
                    shiftsMap={shiftsMap}
                    onUpdateRecord={handleUpdateRecord}
                    userNames={userNames}
                  />

                  {/* 3. 全月双人考勤与津贴协同速报 */}
                  <FullMonthOverview
                    year={currentYear}
                    month={currentMonth}
                    schedules={schedules}
                    shiftsMap={shiftsMap}
                    userNames={userNames}
                  />
                </div>
              )}

              {/* Tab 2: 自定义班次库 + 自由组合轮班 */}
              {activeTab === 'cycle' && (
                <div className="space-y-3">
                  <div className="liquid-card rounded-3xl p-4 shadow-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                        <Palette className="w-4 h-4 text-sunrise-500" />
                        <span>自定义班次设计管理</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        添加/修改早中夜班、副岗，设置时段、跨天与津贴 (当前共 {shifts.length} 个)
                      </p>
                    </div>
                    <button
                      onClick={() => setIsShiftDesignerOpen(true)}
                      className="px-3 py-1.5 bg-black text-white text-[11px] rounded-xl font-bold motion-press"
                    >
                      管理班次
                    </button>
                  </div>

                  <div className="liquid-card rounded-3xl p-4 shadow-lg text-center">
                    <Repeat className="w-8 h-8 text-sunrise-500 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-gray-900">自由组合轮班生成器</h3>
                    <p className="text-[11px] text-gray-500 mt-1 mb-3">
                      为双方自由编排专属轮班序列（如两早两夜两休等），自动联动法定节假日
                    </p>
                    <button
                      onClick={() => setIsCycleModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-sunrise-500 to-sunrise-600 text-white text-xs font-bold shadow-lg motion-press"
                    >
                      进入自由轮班设计器
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <AnalyticsDashboard
                  year={currentYear}
                  month={currentMonth}
                  schedules={schedules}
                  shiftsMap={shiftsMap}
                  userNames={userNames}
                />
              )}

              {activeTab === 'settings' && (
                <WidgetsAndSettings
                  currentFont={font}
                  onFontChange={setFont}
                  bgOpacity={bgOpacity}
                  onBgOpacityChange={setBgOpacity}
                  bgBlur={bgBlur}
                  onBgBlurChange={setBgBlur}
                  onUploadWallpaper={handleUploadWallpaper}
                  displayStyle={displayStyle}
                  onDisplayStyleChange={handleDisplayStyleChange}
                  userNames={userNames}
                  onUserNamesChange={handleUserNamesChange}
                  onOpenAlarmModal={() => setIsAlarmModalOpen(true)}
                  themeMode={themeMode}
                  onThemeModeChange={setThemeMode}
                  onCloudDataReceived={(cloudSchedules, cloudShifts) => {
                    if (cloudSchedules) {
                      setSchedules(cloudSchedules);
                      saveSchedules(cloudSchedules);
                    }
                    if (cloudShifts) {
                      setShifts(cloudShifts);
                      saveShifts(cloudShifts);
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 底部悬浮底栏 */}
        <footer className={`fixed bottom-0 left-0 right-0 p-3 z-50 pointer-events-none transition-opacity duration-200 ${isKeyboardVisible ? 'opacity-0 pointer-events-none hidden' : 'opacity-100'}`}>
          <nav className="pointer-events-auto bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-full border border-gray-200/50 dark:border-zinc-800/50 shadow-sm">
            <div className="grid grid-cols-4 gap-1 text-center">
              <motion.button
                onClick={() => setActiveTab('calendar')}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className={`flex flex-col items-center gap-1 py-2 rounded-full transition-colors ${
                  activeTab === 'calendar' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <Calendar className="size-5" />
                <span className="text-[10px]">日历</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('cycle')}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className={`flex flex-col items-center gap-1 py-2 rounded-full transition-colors ${
                  activeTab === 'cycle' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <Repeat className="size-5" />
                <span className="text-[10px]">轮班</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('analytics')}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className={`flex flex-col items-center gap-1 py-2 rounded-full transition-colors ${
                  activeTab === 'analytics' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <BarChart2 className="size-5" />
                <span className="text-[10px]">统计</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('settings')}
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                className={`flex flex-col items-center gap-1 py-2 rounded-full transition-colors ${
                  activeTab === 'settings' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                <Settings className="size-5" />
                <span className="text-[10px]">设置</span>
              </motion.button>
            </div>
          </nav>
          <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-2 mb-1"></div>
          <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}></div>
        </footer>

        {/* 自定义班次设计器弹窗 */}
        <ShiftDesignerModal
          isOpen={isShiftDesignerOpen}
          onClose={() => setIsShiftDesignerOpen(false)}
          shifts={shifts}
          onSaveShifts={handleSaveShifts}
        />

        {/* 自由组合轮班序列弹窗 */}
        <CycleSchedulerModal
          isOpen={isCycleModalOpen}
          onClose={() => setIsCycleModalOpen(false)}
          shifts={shifts}
          onApplySchedule={handleApplyGenerated}
          userNames={userNames}
        />

        {/* 闹钟管理弹窗 */}
        <AlarmSettingsModal
          isOpen={isAlarmModalOpen}
          onClose={() => setIsAlarmModalOpen(false)}
          shifts={shifts}
          userNames={userNames}
          alarms={alarms}
          setAlarms={setAlarms}
        />
      </div>
    </div>
  );
};
