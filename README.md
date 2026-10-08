# 日出排班 (Sunrise Shift)

> 专为双人（情侣、夫妻、值班搭档、医护/公安/厂线同事）打造的极简流体液态玻璃排班日历系统 App。  
> 完美适配 iOS 与 Android，支持自定义班次、自由组合循环排班、中国法定节假日与调休补班自动识别、精准工时统计及桌面小组件联动。

---

## 🌟 核心特性全景

### 1. 经典黄金比例日历与双轨排班
- **48px 标准黄金比例单元格**：严格遵循自然微长方形排布，告别拉伸失真。
- **双轨平行视图**：同屏对比双方班次，智能识别“同休好日子（☀️ 小太阳高亮）”与“黑白颠倒错峰预警”。
- **多维度透视过滤胶囊**：一键切换 `👥 双人并列`、`👦 仅看我`、`👧 仅看TA` 以及 `☀️ 仅看同休`。

### 2. 国务院法定节假日与调休补班智能引擎
- 内置国务院法定节假日日历，自动识别清明、五一、中秋、国庆以及**周末调休补班日（印章标注 `[休]` 与 `[班]`）**。
- 支持三套排班策略：
  - **模式 A（遇节假日自动顺延/休息）**：行政/常白班模式，节假日自动设休，调休日自动补班。
  - **模式 B（轮班优先，节日津贴加权）**：倒班周期不中断，法定节日出勤自动打上 3x 加班津贴标签并核算入薪。

### 3. 双轨备注系统
- **💼 个人工作专属备注 (Personal Work Notes)**：记录工作交接、设备巡检、病历交接待办清单，支持快速勾选划线。
- **💬 双人交班生活留言板 (Shared Partner Memo)**：夫妻/情侣/搭档日常温馨叮嘱（如带饭、热茶、纪念日）。

### 4. 极致风格化 UI 与动效设计
- **iOS 18+ 液态玻璃 (Liquid Glass)**：基于 `Kyant0/AndroidLiquidGlass` 物理光学原理打造，具备真实菲涅尔边缘高光、透镜微折射与色散彩虹微光。
- **Sunrise Fluid Motion System**：阻尼弹簧物理学微交互、水银拉伸滑块、琴键波浪刷班动效与同休呼吸微晕。
- **个性化装扮实验室**：支持现代无衬线、霞鹜文楷、典雅宋体、治愈圆体、极客等宽 5 款字体实时换肤；支持本地相册上传壁纸与毛玻璃透明度滑块调节。

### 5. 跨端系统联动与统计看板
- **工时与津贴统计**：月度总工时、白夜班占比、夜班津贴核算及精美战报长图一键生成。
- **iOS WidgetKit & Android AppWidget**：桌面 2x2 与 2x4 小组件预览。
- **班次动态闹钟联动**：按班次类型自适应设定系统原生闹钟。

---

## 🛠️ 技术架构

- **前端核心**：React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons
- **跨平台容器**：Capacitor 6.x (可一键编译生成 iOS Xcode 工程与 Android Studio APK)
- **动效引擎**：Sunrise Fluid Motion (物理阻尼弹簧与着色器光学渲染)
- **数据存储**：Local-First 离线数据库架构

---

## 🚀 快速上手与本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 生产打包构建
npm run build
```

---

## 📱 跨端真机打包指南 (iOS / Android)

### 打包 Android APK:
```bash
npx cap add android
npm run build
npx cap sync android
npx cap open android
```
*在打开的 Android Studio 中点击 `Build > Generate Signed Bundle / APK` 即可打包生成安卓安装包。*

### 打包 iOS App (Xcode):
```bash
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios
```
*在打开的 Xcode 中配置开发者账号，即可部署至 iPhone 真机或提交 TestFlight。*

---

## 📄 开源许可
MIT License.
