import React, { useState } from 'react';
import { AppFontFamily, CalendarDisplayStyle, ThemeMode } from '../types/shift';
import { Layout, Sliders, Type, Image, Smartphone, LayoutGrid, Layers, Columns2, Sparkles, CircleDot, Clock, Moon } from 'lucide-react';
import { pushToCloud, pullFromCloud, getSyncRoomCode, setSyncRoomCode, clearSyncRoomCode } from '../services/syncService';

interface Props {
  currentFont: AppFontFamily;
  onFontChange: (f: AppFontFamily) => void;
  bgOpacity: number;
  onBgOpacityChange: (val: number) => void;
  bgBlur: number;
  onBgBlurChange: (val: number) => void;
  onUploadWallpaper: (file: File) => void;
  displayStyle: CalendarDisplayStyle;
  onDisplayStyleChange: (style: CalendarDisplayStyle) => void;
  userNames: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' };
  onUserNamesChange: (names: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' }) => void;
  onOpenAlarmModal: () => void;
  themeMode: ThemeMode;
  onThemeModeChange: (mode: ThemeMode) => void;
  onCloudDataReceived: (schedules: any, shifts: any) => void;
}

export const WidgetsAndSettings: React.FC<Props> = ({
  currentFont,
  onFontChange,
  bgOpacity,
  onBgOpacityChange,
  bgBlur,
  onBgBlurChange,
  onUploadWallpaper,
  displayStyle,
  onDisplayStyleChange,
  userNames,
  onUserNamesChange,
  onOpenAlarmModal,
  themeMode,
  onThemeModeChange,
  onCloudDataReceived,
}) => {
  const [syncCode, setSyncCode] = useState(getSyncRoomCode() || '');
  const [isSyncing, setIsSyncing] = useState(false);
  return (
    <div className="space-y-3 pb-6">
      {/* 自定义称呼设置 */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg">
        <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <Type className="w-4 h-4 text-sunrise-500" />
          <span>自定义双人专属称呼 (Custom Names)</span>
        </h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">主视角称呼</label>
            <input
              type="text"
              value={userNames.userNameA}
              onChange={e => onUserNamesChange({ ...userNames, userNameA: e.target.value.slice(0, 4) })}
              className="w-full bg-white/70 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sunrise-500 font-bold text-gray-800"
              placeholder="如：小王、老公"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1">TA的称呼</label>
            <input
              type="text"
              value={userNames.userNameB}
              onChange={e => onUserNamesChange({ ...userNames, userNameB: e.target.value.slice(0, 4) })}
              className="w-full bg-white/70 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-tealpartner-500 font-bold text-gray-800"
              placeholder="如：小李、老婆"
            />
          </div>
        </div>
      </div>

      {/* 云端双向同步 (架构预留) */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg bg-gradient-to-br from-white/80 to-blue-50/50">
        <h3 className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-blue-500" />
          <span>云端互联与主视角 (Cloud Sync)</span>
        </h3>
        <p className="text-[10px] text-gray-500 mb-3">
          通过匹配码绑定两台设备，实现排班和留言板双向实时同步。
        </p>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-blue-100 bg-white/70">
            <div>
              <div className="text-[11px] font-bold text-gray-800">当前设备主视角</div>
              <div className="text-[9px] text-gray-500">选择当前手机是哪一方</div>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => onUserNamesChange({ ...userNames, currentUserRole: 'A' })}
                className={`px-3 py-1 rounded-md text-[10px] motion-press ${userNames.currentUserRole === 'A' ? 'font-bold bg-white text-blue-600 shadow-sm' : 'font-medium text-gray-500'}`}
              >
                我是 {userNames.userNameA}
              </button>
              <button
                onClick={() => onUserNamesChange({ ...userNames, currentUserRole: 'B' })}
                className={`px-3 py-1 rounded-md text-[10px] motion-press ${userNames.currentUserRole === 'B' ? 'font-bold bg-white text-blue-600 shadow-sm' : 'font-medium text-gray-500'}`}
              >
                我是 {userNames.userNameB}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2 p-2.5 rounded-xl border border-blue-100 bg-white/70">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[11px] font-bold text-gray-800">家庭云端配对</div>
                <div className="text-[9px] text-gray-500">连接后实现排班数据双向实时同步</div>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-500 border border-gray-200">
                本地离线模式
              </span>
            </div>
            <div className="flex gap-2 mt-1">
              <button 
                onClick={async () => {
                  if (syncCode) {
                    if (confirm('是否断开当前连接？')) {
                      clearSyncRoomCode();
                      setSyncCode('');
                    }
                    return;
                  }
                  setIsSyncing(true);
                  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
                  const success = await pushToCloud(code);
                  setIsSyncing(false);
                  
                  if (success) {
                    setSyncRoomCode(code);
                    setSyncCode(code);
                    alert(`✅ 您的专属配对码是：【${code}】\n\n请让您的伴侣在他的手机上的此界面，点击“输入连接码”并填入此码，即可完成账号绑定。`);
                  } else {
                    alert('❌ 生成配对码失败，请检查网络或联系开发者（可能是云端数据库 RLS 权限拦截了写入）。');
                  }
                }}
                disabled={isSyncing}
                className="flex-1 py-1.5 bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-md motion-press disabled:opacity-50"
              >
                {isSyncing ? '请稍候...' : (syncCode ? `已绑定: ${syncCode} (点击断开)` : '生成我的连接码')}
              </button>
              
              {!syncCode && (
                <button 
                  onClick={async () => {
                    const code = prompt('请输入伴侣分享给您的 6 位配对码：');
                    if (code) {
                      setIsSyncing(true);
                      const data = await pullFromCloud(code.toUpperCase());
                      if (data) {
                        setSyncRoomCode(code.toUpperCase());
                        setSyncCode(code.toUpperCase());
                        if (data.schedules_json || data.shifts_json) {
                          onCloudDataReceived(data.schedules_json, data.shifts_json);
                        }
                        alert(`🎉 恭喜！已成功与配对码【${code.toUpperCase()}】的设备绑定，并成功拉取数据！`);
                      } else {
                        alert('连接失败：未找到该配对码的数据，请检查是否输入正确。');
                      }
                      setIsSyncing(false);
                    }
                  }}
                  disabled={isSyncing}
                  className="flex-1 py-1.5 bg-white text-blue-600 border border-blue-200 rounded-lg text-[11px] font-bold shadow-sm motion-press hover:bg-blue-50 disabled:opacity-50"
                >
                  输入TA的连接码
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 双人排班展示风格设置 */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg">
        <h3 className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
          <LayoutGrid className="w-4 h-4 text-sunrise-500" />
          <span>月历双人排班展示风格 (Calendar Style)</span>
        </h3>
        <p className="text-[10px] text-gray-500 mb-2.5">
          自定义两人在日历单元格中的分工展示形态，轻松区分双方班次
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            {
              id: 'split_vertical',
              label: '上下对半分栏',
              desc: '上排小王/下排小李，极高对比清晰区分',
              icon: <Layers className="w-3.5 h-3.5 text-sunrise-500" />,
            },
            {
              id: 'side_by_side',
              label: '左右并列胶囊',
              desc: '左我右TA双胶囊徽章，紧凑均衡',
              icon: <Columns2 className="w-3.5 h-3.5 text-tealpartner-500" />,
            },
            {
              id: 'slash_text',
              label: '极简纯粹斜杠',
              desc: '左我/右TA极简文本分隔，苹果原生质感',
              icon: <Type className="w-3.5 h-3.5 text-amber-500" />,
            },
            {
              id: 'pill_minimal',
              label: '极简双色微标',
              desc: '悬浮微圆点，清爽不遮挡日期',
              icon: <CircleDot className="w-3.5 h-3.5 text-indigo-500" />,
            },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => onDisplayStyleChange(opt.id as CalendarDisplayStyle)}
              className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between motion-press transition-all ${
                displayStyle === opt.id
                  ? 'bg-black text-white border-black shadow-md dark:bg-white dark:text-black dark:border-white'
                  : 'bg-white/80 text-gray-800 border-gray-200/80 hover:bg-white dark:bg-zinc-800/80 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-[11px] flex items-center gap-1">
                  {opt.icon}
                  <span>{opt.label}</span>
                </span>
                {displayStyle === opt.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sunrise-400"></span>
                )}
              </div>
              <p className={`text-[9px] leading-tight ${displayStyle === opt.id ? 'text-gray-300' : 'text-gray-500'}`}>
                {opt.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 自适应智能闹钟 */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg bg-gradient-to-br from-white/80 to-amber-50/50">
        <h3 className="text-xs font-bold text-gray-900 mb-1 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>自适应智能闹钟设置 (Adaptive Alarms)</span>
        </h3>
        <p className="text-[10px] text-gray-500 mb-3">
          根据每天的不同班次自动调用系统原生闹钟，支持双人不同时段唤醒。
        </p>
        <button
          onClick={onOpenAlarmModal}
          className="w-full py-2 bg-amber-500 text-white rounded-xl text-[11px] font-bold shadow-md motion-press flex items-center justify-center gap-1.5"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>进入排班专属闹钟管家</span>
        </button>
      </div>

      {/* 桌面小组件预览区 (iOS WidgetKit & Android AppWidget) */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg">
        <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-sunrise-500" />
          <span>手机桌面与锁屏小组件 (Widget Preview)</span>
        </h3>
        
        {/* 小号小组件 2x2 模拟卡 */}
        <div className="p-3 rounded-2xl bg-white/90 border border-gray-200 shadow-md flex items-center justify-between">
          <div>
            <div className="text-[10px] text-gray-400 font-mono">今日双人班次 (2x2)</div>
            <div className="text-[11px] font-bold text-gray-900 mt-1">
              👦{userNames.userNameA}: 白班 | 👧{userNames.userNameB}: 大夜
            </div>
            <div className="text-[10px] text-rose-500 font-semibold mt-0.5">☀️ 离最近同休还有 2 天</div>
          </div>
          <span className="text-xs bg-black text-white px-2 py-1 rounded-lg font-bold shadow-sm">已同步</span>
        </div>
      </div>

      {/* 字体切换 */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg">
        <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <Type className="w-4 h-4 text-tealpartner-500" />
          <span>全局字体风格切换</span>
        </h3>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {[
            { id: 'modern', label: '无衬线现代' },
            { id: 'wenkai', label: '霞鹜文楷' },
            { id: 'serif', label: '典雅宋体' },
            { id: 'round', label: '治愈圆体' },
            { id: 'mono', label: '极客等宽' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => onFontChange(f.id as AppFontFamily)}
              className={`py-1.5 rounded-xl border text-[11px] font-medium motion-press ${
                currentFont === f.id
                  ? 'bg-black text-white font-bold border-black shadow dark:bg-white dark:text-black dark:border-white'
                  : 'bg-white/70 text-gray-700 border-gray-200 dark:bg-zinc-800/70 dark:text-gray-300 dark:border-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 白天与夜间模式切换 */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg">
        <h3 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
          <Moon className="w-4 h-4 text-indigo-500" />
          <span>白天与夜间模式 (Theme)</span>
        </h3>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {[
            { id: 'light', label: '🌞 恒定白天' },
            { id: 'dark', label: '🌙 恒定黑夜' },
            { id: 'system', label: '⚙️ 跟随系统切换' },
            { id: 'auto', label: '🌅 跟随日出日落' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onThemeModeChange(t.id as ThemeMode)}
              className={`py-2 rounded-xl border text-[11px] font-bold motion-press ${
                themeMode === t.id
                  ? 'bg-black text-white border-black shadow dark:bg-white dark:text-black dark:border-white'
                  : 'bg-white/70 text-gray-700 border-gray-200 dark:bg-zinc-800/70 dark:text-gray-300 dark:border-zinc-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 壁纸与透明度 */}
      <div className="liquid-card rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <Image className="w-4 h-4 text-sunrise-500" />
            <span>自定义壁纸与透明度</span>
          </h3>
          <label className="text-[10px] text-sunrise-600 font-bold cursor-pointer hover:underline">
            <span>+ 上传本地合照</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && onUploadWallpaper(e.target.files[0])}
            />
          </label>
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-gray-600 mb-1">
            <span>卡片不透明度:</span>
            <span className="font-mono font-bold text-sunrise-500">{bgOpacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={bgOpacity}
            onChange={e => onBgOpacityChange(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg accent-sunrise-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-gray-600 mb-1">
            <span>背景虚化 (毛玻璃):</span>
            <span className="font-mono font-bold text-tealpartner-500">{bgBlur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={bgBlur}
            onChange={e => onBgBlurChange(Number(e.target.value))}
            className="w-full h-1 bg-gray-200 rounded-lg accent-tealpartner-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
