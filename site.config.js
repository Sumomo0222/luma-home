/* ═══════════════════════════════════════════════════════════════════════════
   Luma Home 落地页 · 站点配置
   ───────────────────────────────────────────────────────────────────────────
   上线只做两件事：
     ① 把 assets/img 里的图片换成「同名」的真实图片（尺寸建议见 README）
     ② 修改本文件里的信息
   然后运行  npm run build  （或 node build.mjs）重新生成页面，部署整个目录即可。

   标有【必改】的是占位信息，构建时会逐项提醒；带可选字段的留空即可。
   商品、场景、评价、常见问题都是数组：增删条目后重新构建，页面自动跟着变。
   ═══════════════════════════════════════════════════════════════════════════ */

export default {
  /* ── 页面信息（浏览器标题、搜索结果摘要、分享卡片）────────────────────── */
  meta: {
    lang: 'zh-CN',
    title: 'Luma Home｜让房间跟随生活变化 · 智能光影家居',
    description: 'Luma Home 智能光影家居：极简智能灯具与家居设备，随一天的作息自然改变光线。支持日光感应、本地联动与上门安装，5 年整件质保。',
    keywords: '智能灯具,落地灯,吸顶灯,灯带,智能窗帘,智能家居,Matter',
    url: 'https://sumomo0222.github.io/luma-home',   // 【必改】正式域名（不带结尾斜杠），用于 canonical、分享卡片与站点地图
    ogImage: 'assets/img/hero/og.jpg',               // 分享缩略图，建议 1200×630
    // 搜索引擎收录开关。示例数据不该被收录，所以默认不收录；
    // 正式上线、信息全部替换为真实内容后，改成 'index, follow'
    robots: 'noindex, follow',
    themeColor: '#f4f1eb',
  },

  brand: {
    name: 'Luma Home',
    slogan: '让房间跟随生活变化',
    sloganEn: 'Let the room follow your life.',
    logoImage: '',                                   // 可选：logo 图片路径（如 assets/img/logo.svg），填写后替换文字标识
    since: 2021,
  },

  /* ── 联系方式：页脚、客服浮窗、表单兜底都会用到这里 ─────────────────────── */
  contact: {
    phone: '400-000-0000',                           // 【必改】客服电话，页面上会生成一键拨号
    email: 'service@luma-home.example',              // 【必改】接收预约与订单意向的邮箱
    serviceHours: '09:00 – 22:00',
    address: '上海市徐汇区示例路 88 号',               // 【必改】门店或办公地址
    wechatQr: '',                                    // 可选：客服二维码，如 assets/img/contact/wechat-qr.png（建议 480×480）
    onlineUrl: '',                                   // 可选：在线客服链接（企业微信 / 第三方客服系统）
  },

  company: {
    legalName: '流光智能家居（上海）有限公司',          // 【必改】营业执照名称，显示在页脚
    icp: '沪ICP备2026XXXXXX号',                       // 【必改】ICP 备案号
    police: '',                                      // 可选：公安备案号，如 '沪公网安备 31010102000000号'
    copyrightSince: 2021,
  },

  /* ── 统计、表单与下单 ─────────────────────────────────────────────────── */
  integrations: {
    analytics: { baidu: '', gtag: '' },              // 可选：百度统计站点 ID / Google 标签 ID，留空则不加载任何统计脚本
    forms: { mode: 'email', endpoint: '' },          // 预约表单：'email' 调起访客的邮件应用（不需要后端）｜'api' 提交到 endpoint
    checkout: { mode: 'email', endpoint: '', storeUrl: '' }, // 下单：'email' 邮件下单｜'api' 提交订单到 endpoint｜'link' 跳转外部商城（storeUrl 或商品各自的 buyUrl）
    trackHook: true,                                 // 所有按钮点击都会调用 window.lumaTrack(event, data)，可接任意统计系统
  },

  /* ── 配色与字体：改这里即可整站换肤 ────────────────────────────────────── */
  theme: {
    colors: {
      bg: '#f4f1eb', bgSoft: '#ebe6dc', bgCard: '#fbf9f5',
      ink: '#201e1b', ink2: '#56514a', ink3: '#8a847a', accent: '#c98a4c',
    },
    fonts: {
      display: '"Newsreader", "Noto Serif SC", "Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", serif',
      body: '"Geologica", -apple-system, BlinkMacSystemFont, "PingFang SC", "HarmonyOS Sans SC", "MiSans", "Microsoft YaHei", sans-serif',
      mono: '"DM Mono", ui-monospace, "SF Mono", Menlo, monospace',
    },
  },

  /* ── 导航 ─────────────────────────────────────────────────────────────── */
  nav: {
    links: [
      { label: '产品系列', href: '#collection' },
      { label: '空间搭配', href: '#space' },
      { label: '设计理念', href: '#design' },
      { label: '智能联动', href: '#smart' },
      { label: '安装与服务', href: '#install' },
    ],
    cta: { label: '选购', href: '#buy' },
  },

  /* ── 首屏 ─────────────────────────────────────────────────────────────── */
  hero: {
    eyebrow: '智能光影家居 · 2026 系列',
    title: ['让房间，', '跟随生活{变化}。'],            // 每个数组项是一行；{…} 里的文字带光谱下划线
    sloganEn: 'Let the room follow your life.',
    lead: '从清晨的第一缕日光，到睡前最后一盏 1800K 的灯。Luma Home 用一组懂得时间的灯具与设备，让光线跟着你的作息自然流转。',
    ctaPrimary: { label: '探索系列', href: '#collection' },
    ctaSecondary: { label: '预约灯光顾问', href: '#care' },
    sliderLabel: '拖动时间，在四个场景之间切换',
    /* 四个时段各一张图。建议三脚架固定同一机位拍摄，拖动滑块时空间才不会跳动。
       image 桌面用（建议 2400×1350），imageMobile 手机用（建议 1350×1800，可留空），
       position 是裁切焦点，theme 决定文字用深色还是浅色，glow 是叠加的环境光颜色。 */
    scenes: [
      {
        id: 'dawn', name: '清晨', en: 'Dawn', time: '06:30', theme: 'light', glow: '#ffb27a', glowX: 82, glowY: 30,
        title: '比闹钟早 20 分钟的日出',
        caption: '纱帘升起 45%，Halo Orb 从 1800K 开始慢慢变亮、变冷。你在光里醒来，而不是在铃声里。',
        readout: { kelvin: 2700, daylight: 35, lamp: 25, power: 64 },
        image: 'assets/img/hero/dawn.jpg', imageMobile: 'assets/img/hero/dawn-m.jpg', position: '64% 50%',
        alt: '清晨的客厅，落地窗外是粉色的天空，台灯亮着暖光',
      },
      {
        id: 'day', name: '工作', en: 'Focus', time: '10:30', theme: 'light', glow: '#dfeaf8', glowX: 84, glowY: 22,
        title: '日光接管，灯光退后',
        caption: 'Luma Sense 读到窗外已有 32,000 lux，把主灯降到 1%。灯带只负责补足书桌上的阴影。',
        readout: { kelvin: 5200, daylight: 100, lamp: 4, power: 11 },
        image: 'assets/img/hero/day.jpg', imageMobile: 'assets/img/hero/day-m.jpg', position: '64% 50%',
        alt: '上午的客厅，阳光从落地窗照进来，灯光处于关闭状态',
      },
      {
        id: 'dinner', name: '晚餐', en: 'Dinner', time: '19:30', theme: 'dark', glow: '#ff9a52', glowX: 60, glowY: 34,
        title: '餐桌成为房间的中心',
        caption: '日落前 30 分钟，吊灯自己亮起，降到 2400K。灯带在墙上升起一层暖色，像退潮后的余温。',
        readout: { kelvin: 2400, daylight: 10, lamp: 62, power: 70 },
        image: 'assets/img/hero/dinner.jpg', imageMobile: 'assets/img/hero/dinner-m.jpg', position: '64% 50%',
        alt: '傍晚的客厅，夕阳把窗格的影子投在墙上，落地灯和灯带亮起',
      },
      {
        id: 'night', name: '夜间', en: 'Night', time: '23:00', theme: 'dark', glow: '#ff9d4d', glowX: 80, glowY: 46,
        title: '只剩一盏 1800K 的夜灯',
        caption: '所有灯在 10 分钟里退到 3%，纱帘合拢。夜里的房间知道你要睡了。',
        readout: { kelvin: 1800, daylight: 0, lamp: 6, power: 12 },
        image: 'assets/img/hero/night.jpg', imageMobile: 'assets/img/hero/night-m.jpg', position: '64% 50%',
        alt: '深夜的客厅，纱帘合拢，只留落地灯的一盏暖色夜灯',
      },
    ],
  },

  statement: {
    eyebrow: '品牌主张',
    title: ['光，是房间里', '另一种{材质}。'],
    text: '我们不做更亮的灯，而是做更懂时间的灯。它知道你几点醒来，知道窗外的日光什么时候够用，也知道该在什么时候安静下来。于是房间不再需要被「打开」，它只是跟随你的生活，自然地变化。',
    facts: [
      { value: 'CRI 98', label: '高显色指数' },
      { value: '< 0.5%', label: '频闪深度' },
      { value: '0.3W', label: '整机待机' },
      { value: '5 年', label: '整件质保' },
    ],
  },

  /* ── 产品系列 ─────────────────────────────────────────────────────────── */
  collection: {
    eyebrow: '产品系列', eyebrowEn: 'The Collection',
    title: '每一件，都为某一刻的光而生',
    lead: '4 个系列，8 件灯具与设备。悬停查看光线参数、材质与尺寸；按住拖动，让产品旋转。',
    filtersLabel: '按系列筛选',
    series: [
      { id: 'halo', name: 'Halo', cn: '光环' },
      { id: 'veil', name: 'Veil', cn: '柔幕' },
      { id: 'tide', name: 'Tide', cn: '潮汐' },
      { id: 'luma', name: 'Luma', cn: '智能设备' },
    ],
    /* 材质选项：id 与商品 finishes 对应；color 用于没有材质图时给 3D 占位图换色，可忽略 */
    finishes: [
      { id: 'champagne', name: '香槟', en: 'Champagne', desc: '温润的暖金属，与原木、米色最相衬', swatch: 'linear-gradient(135deg,#f1e3c9 0%,#d2b88c 48%,#b99c6d 100%)' },
      { id: 'silver', name: '月银', en: 'Silver', desc: '喷砂哑光银灰，冷静而克制', swatch: 'linear-gradient(135deg,#fbfbfa 0%,#d3d4d2 48%,#a9aaa8 100%)' },
      { id: 'graphite', name: '曜石', en: 'Graphite', desc: '深灰近黑，吸光而低调', swatch: 'linear-gradient(135deg,#6a6c70 0%,#3a3c40 48%,#1f2023 100%)' },
      { id: 'pearl', name: '珍珠白', en: 'Pearl', desc: '釉面陶瓷白，柔软的哑光', swatch: 'linear-gradient(135deg,#ffffff 0%,#efe9df 48%,#d6cec1 100%)' },
    ],
    /* 商品。images.main 必填；其余可选，没有就自动退化为普通图片展示：
         images.lit      悬停时切换的「开灯 / 使用中」照片
         images.finishes 按材质切换的照片（键名对应 finishes 里的 id）
         spin            360° 旋转序列图（从左到右、从上到下排列），有则悬停可拖动旋转
       kind: 'light' 灯具（显示光线参数）｜'device' 家居设备（显示 sensors 或 motor）
       symbol: 空间示意图里使用的图例：floor｜table｜pendant｜panel｜mirror｜strip｜hub｜shade */
    products: [
      {
        id: 'halo-floor', name: 'Halo Floor', cn: '光环落地灯', tag: '落地灯', series: 'halo', kind: 'light', symbol: 'floor',
        price: 2980, powerW: 38, sku: 'LH-HF-01',
        desc: '一枚悬浮的光环，随一天的光线改变色温与角度。',
        story: '灯杆由整根铝材拉伸成型，灯头以磁吸对接，轻轻一拨就能转向沙发、书页或角落。Halo Floor 没有开关，它读得懂时间。',
        light: { kelvin: '1800–6500K', lumens: '2200 lm', cri: '97', dim: '1–100%', power: '38W' },
        materials: ['一体成型阳极氧化铝', '吹制蛋白石玻璃', '编织包覆电源线'],
        size: 'Ø340 × H1620 mm', weight: '4.6 kg',
        install: '落地放置，即插即用', installTime: '2 分钟',
        control: ['触控', 'App', '语音', 'Matter'],
        finishes: ['champagne', 'silver', 'graphite'], finish: 'champagne',
        rating: 4.9, reviews: 1286,
        images: {
          main: 'assets/img/products/halo-floor.webp',
          lit: 'assets/img/products/halo-floor-lit.webp',
          finishes: { champagne: 'assets/img/products/halo-floor-champagne.webp', silver: 'assets/img/products/halo-floor-silver.webp', graphite: 'assets/img/products/halo-floor-graphite.webp' },
        },
        spin: { sheet: 'assets/img/products/spin/halo-floor.webp', frames: 24, cols: 6, rows: 4, width: 240, height: 300 },
      },
      {
        id: 'halo-orb', name: 'Halo Orb', cn: '光环台灯', tag: '台灯', series: 'halo', kind: 'light', symbol: 'table',
        price: 1280, powerW: 12, sku: 'LH-HO-01',
        desc: '掌心大小的一颗日出，轻触即从 1800K 慢慢醒来。',
        story: '蛋白石玻璃球体罩住一整圈灯珠，光线在球内被反射两次才离开，所以没有刺眼的高光。底座是实心铝，旋转即可调节色温。',
        light: { kelvin: '1800–5000K', lumens: '800 lm', cri: '95', dim: '1–100%', power: '12W' },
        materials: ['吹制蛋白石玻璃', '实心喷砂铝底座', '黄铜配重环'],
        size: 'Ø160 × H230 mm', weight: '1.4 kg',
        install: '桌面摆放，插电即用', installTime: '即放即用',
        control: ['触控', 'App', '语音', 'Matter'],
        finishes: ['champagne', 'silver', 'graphite'], finish: 'silver',
        rating: 4.8, reviews: 2314,
        images: {
          main: 'assets/img/products/halo-orb.webp',
          lit: 'assets/img/products/halo-orb-lit.webp',
          finishes: { champagne: 'assets/img/products/halo-orb-champagne.webp', silver: 'assets/img/products/halo-orb-silver.webp', graphite: 'assets/img/products/halo-orb-graphite.webp' },
        },
        spin: { sheet: 'assets/img/products/spin/halo-orb.webp', frames: 24, cols: 6, rows: 4, width: 240, height: 300 },
      },
      {
        id: 'halo-pendant', name: 'Halo Pendant', cn: '光环吊灯', tag: '吊灯', series: 'halo', kind: 'light', symbol: 'pendant',
        price: 3480, powerW: 42, sku: 'LH-HP-01',
        desc: '餐桌上方的一轮细环，把晚餐照成暖色。',
        story: '18 mm 厚的旋压铝环内嵌一圈扩散片，向下打出均匀的光，向上的部分只留一点轮廓光。吊线可裁，距桌面 700–750 mm 时效果最好。',
        light: { kelvin: '2200–5000K', lumens: '2400 lm', cri: '98', dim: '1–100%', power: '42W' },
        materials: ['旋压铝灯体', '亚克力柔光片', '不锈钢包纤吊线'],
        size: 'Ø600 × H18 mm', sizeNote: '吊线最长 2000 mm', weight: '2.8 kg',
        install: '吊装（需预留顶面电源）', installTime: '25 分钟', wiring: true,
        control: ['墙壁开关', 'App', '语音', 'Matter'],
        finishes: ['champagne', 'silver', 'graphite'], finish: 'champagne',
        rating: 4.9, reviews: 642,
        images: {
          main: 'assets/img/products/halo-pendant.webp',
          lit: 'assets/img/products/halo-pendant-lit.webp',
          finishes: { champagne: 'assets/img/products/halo-pendant-champagne.webp', silver: 'assets/img/products/halo-pendant-silver.webp', graphite: 'assets/img/products/halo-pendant-graphite.webp' },
        },
        spin: { sheet: 'assets/img/products/spin/halo-pendant.webp', frames: 24, cols: 6, rows: 4, width: 240, height: 300 },
      },
      {
        id: 'veil-panel', name: 'Veil Panel', cn: '柔幕面板灯', tag: '吸顶灯', series: 'veil', kind: 'light', symbol: 'panel',
        price: 1680, powerW: 36, sku: 'LH-VP-01',
        desc: '薄得像一片天花。亮起时，天花板整片发光。',
        story: '8 mm 厚的铝框内嵌扩散面，边缘的磁吸条可以秒拆。接入日光感应后，它在白天几乎不工作，只在阴天补光。',
        light: { kelvin: '2700–6500K', lumens: '3200 lm', cri: '92', dim: '5–100%', power: '36W' },
        materials: ['超薄铝合金框', '扩散 PC 面', '磁吸边框'],
        size: '600 × 600 × 8 mm', weight: '2.1 kg',
        install: '吸顶明装或嵌入吊顶', installTime: '15 分钟',
        control: ['墙壁开关', 'App', '语音', 'Matter'],
        finishes: ['pearl', 'silver'], finish: 'pearl',
        rating: 4.8, reviews: 987,
        images: {
          main: 'assets/img/products/veil-panel.webp',
          lit: 'assets/img/products/veil-panel-lit.webp',
          finishes: { pearl: 'assets/img/products/veil-panel-pearl.webp', silver: 'assets/img/products/veil-panel-silver.webp' },
        },
        spin: { sheet: 'assets/img/products/spin/veil-panel.webp', frames: 24, cols: 6, rows: 4, width: 240, height: 300 },
      },
      {
        id: 'veil-mirror', name: 'Veil Mirror', cn: '柔幕镜灯', tag: '镜前灯', series: 'veil', kind: 'light', symbol: 'mirror',
        price: 1880, powerW: 18, sku: 'LH-VM-01',
        desc: '晨光先落在镜子上：模拟日出的背光，让起床变得温柔。',
        story: '5 mm 银镜四周嵌一圈背发光，色温分日光、暖光、化妆三档。防雾膜在浴室里也不会起雾。',
        light: { kelvin: '3000–5700K', lumens: '1100 lm', cri: '96', dim: '10–100%', power: '18W' },
        materials: ['5 mm 防雾银镜', '铝合金背板', '背发光灯带'],
        size: 'Ø500 × D45 mm', weight: '3.2 kg',
        install: '壁挂（打孔 2 点或无痕胶）', installTime: '8 分钟',
        control: ['触控', 'App', '语音', 'Matter'],
        finishes: ['silver', 'champagne'], finish: 'silver',
        rating: 4.7, reviews: 453,
        images: {
          main: 'assets/img/products/veil-mirror.webp',
          lit: 'assets/img/products/veil-mirror-lit.webp',
          finishes: { silver: 'assets/img/products/veil-mirror-silver.webp', champagne: 'assets/img/products/veil-mirror-champagne.webp' },
        },
        spin: { sheet: 'assets/img/products/spin/veil-mirror.webp', frames: 24, cols: 6, rows: 4, width: 240, height: 300 },
      },
      {
        id: 'tide-strip', name: 'Tide Strip', cn: '潮汐灯带', tag: '灯带套装', series: 'tide', kind: 'light', symbol: 'strip',
        price: 680, powerW: 10, sku: 'LH-TS-02',
        desc: '一条会涨落的光：睡前像退潮一样慢慢暗下去。',
        story: '铝合金 U 型槽里的灯带可延长到 10 m，硅胶柔光罩让光没有颗粒感。贴在橱柜、床头或电视墙后，它是房间最安静的背景光。',
        light: { kelvin: '1800–6500K', lumens: '480 lm/m', cri: '90', dim: '1–100%', power: '10W/m' },
        materials: ['铝合金 U 型槽', '硅胶柔光罩', '无痕背胶'],
        size: '宽 17 × 高 8 mm', sizeNote: '每套 2 m', weight: '0.3 kg / m',
        install: '嵌入或表贴，可裁剪', installTime: '6 分钟 / 米',
        control: ['App', '语音', 'Matter'],
        finishes: ['silver'], finish: 'silver',
        rating: 4.8, reviews: 3102,
        images: { main: 'assets/img/products/tide-strip.webp', lit: 'assets/img/products/tide-strip-lit.webp' },
        spin: { sheet: 'assets/img/products/spin/tide-strip.webp', frames: 24, cols: 6, rows: 4, width: 240, height: 300 },
      },
      {
        id: 'luma-sense', name: 'Luma Sense', cn: '流光中枢', tag: '智能中枢 · 环境感应', series: 'luma', kind: 'device', symbol: 'hub',
        price: 899, powerW: 2, sku: 'LH-LS-01',
        desc: '房间的感官：它读出光线、温度与人的在场，再替你把灯调好。',
        story: '陶瓷上盖下藏着光照、温湿度、毫米波存在与噪声四组传感器，同时也是 Thread 边界路由器。断电后内置电池还能撑 6 小时。',
        sensors: ['光照 0–120,000 lux', '温度 / 湿度', '毫米波人体存在', '噪声'],
        connect: ['Thread 边界路由', 'Matter', 'Wi-Fi', '蓝牙'],
        materials: ['陶瓷上盖', '铝合金底座', '织物包覆'],
        size: 'Ø92 × H38 mm', weight: '220 g',
        install: '桌面平放，接入家庭网络', installTime: '1 分钟',
        control: ['App', '语音', 'Matter'],
        finishes: ['pearl'], finish: 'pearl',
        rating: 4.7, reviews: 1568,
        images: { main: 'assets/img/products/luma-sense.webp' },
        spin: { sheet: 'assets/img/products/spin/luma-sense.webp', frames: 24, cols: 6, rows: 4, width: 240, height: 300 },
      },
      {
        id: 'luma-shade', name: 'Luma Shade', cn: '流光纱帘', tag: '电动纱帘', series: 'luma', kind: 'device', symbol: 'shade',
        price: 2400, powerW: 0.3, sku: 'LH-LH-01',
        desc: '窗帘懂日出时间。它先于闹钟 20 分钟把房间慢慢点亮。',
        story: '静音电机运行只有 29 dB，电池版充电一次用 8 个月。纱帘透光率 62%，可选全遮光帘。拉一下窗帘，电机会自动接手。',
        motor: ['静音电机 ≤ 29 dB', '手拉启动', '续航 8 个月', '断电手拉'],
        standby: '0.3W 待机',
        materials: ['再生聚酯纱', '铝合金轨道', '磁吸充电'],
        size: '轨道宽 ≤ 3500 mm', sizeNote: '纱帘下垂 ≤ 2800 mm', weight: '—',
        install: '顶装或侧装', installTime: '30 分钟',
        control: ['App 定时', '语音', 'Matter'],
        finishes: ['silver'], finish: 'silver',
        rating: 4.8, reviews: 377,
        images: { main: 'assets/img/products/luma-shade.webp' },
        spin: { sheet: 'assets/img/products/spin/luma-shade.webp', frames: 24, cols: 6, rows: 4, width: 240, height: 300 },
      },
    ],
  },

  /* ── 设计理念：滚动时逐张切换细节图；finishImages 可选，按材质切换细节图 ── */
  design: {
    eyebrow: '设计理念', eyebrowEn: 'Design',
    title: '把工艺，藏进光里',
    lead: '以 Halo Floor 为例。向下滚动，看每一处细节；也可以选择表面材质。',
    product: 'halo-floor',                              // 以哪件商品为例（对应 products 里的 id）
    hint: '滚动查看细节',
    steps: [
      { title: '一体成型的铝', text: '灯杆由整根铝材旋压、拉伸而成，没有一颗可见的螺丝。表面经过 12 道喷砂与阳极氧化，摸起来像温润的石头。',
        specs: [['灯杆壁厚', '2.4 mm'], ['表面处理', '阳极氧化']],
        image: 'assets/img/design/step-1.jpg',
        finishImages: { champagne: 'assets/img/design/step-1-champagne.jpg', silver: 'assets/img/design/step-1-silver.jpg', graphite: 'assets/img/design/step-1-graphite.jpg' },
        alt: '落地灯铝合金灯杆的细节' },
      { title: '吹制的蛋白石玻璃', text: '每一只灯罩都由工匠吹制，壁厚误差小于 0.3 mm。光线穿过时被均匀打散，直视也不刺眼。',
        specs: [['眩光指数', 'UGR < 10'], ['壁厚误差', '< 0.3 mm']],
        image: 'assets/img/design/step-2.jpg',
        finishImages: { champagne: 'assets/img/design/step-2-champagne.jpg', silver: 'assets/img/design/step-2-silver.jpg', graphite: 'assets/img/design/step-2-graphite.jpg' },
        alt: '落地灯蛋白石玻璃灯头的细节' },
      { title: '磁吸模块', text: '灯头与灯杆以磁吸对接，咔哒一声即到位。换灯罩、换角度，不需要任何工具。',
        specs: [['吸合力', '18 N'], ['调节角度', '0–120°']],
        image: 'assets/img/design/step-3.jpg',
        finishImages: { champagne: 'assets/img/design/step-3-champagne.jpg', silver: 'assets/img/design/step-3-silver.jpg', graphite: 'assets/img/design/step-3-graphite.jpg' },
        alt: '落地灯灯头与灯杆的磁吸接口' },
      { title: '无频闪驱动', text: '自主研发的恒流驱动，频闪深度低于 0.5%。即使放进慢镜头，光也是静止的。',
        specs: [['频闪深度', '< 0.5%'], ['调光范围', '1–100%']],
        image: 'assets/img/design/step-4.jpg',
        finishImages: { champagne: 'assets/img/design/step-4-champagne.jpg', silver: 'assets/img/design/step-4-silver.jpg', graphite: 'assets/img/design/step-4-graphite.jpg' },
        alt: '落地灯底座与触控区域的细节' },
    ],
  },

  /* ── 空间搭配：layout 对应示意图的房间类型（living / bedroom / dining / study）
       每件商品放在哪个 slot（图例位）上由 slot 指定；fixed 的商品不可在预览里关闭 ── */
  space: {
    eyebrow: '空间搭配', eyebrowEn: 'Space Pairing',
    title: '为每个房间，配一组光',
    lead: '选一个房间，勾选要加入的灯具，房间示意图会实时亮起或熄灭。白天看造型，夜晚看光线。',
    addLabel: '把这套搭配加入购物袋',
    moreLabel: '安装点位说明',
    rooms: [
      { id: 'living', name: '客厅', en: 'Living', area: 28, layout: 'living',
        note: 'Halo Floor 做晚间主光，面板灯只在阴天补光，灯带藏在电视墙后做背光。',
        items: [
          { product: 'halo-floor', qty: 1, slot: 'floor', fixed: true },
          { product: 'veil-panel', qty: 1, slot: 'panel' },
          { product: 'tide-strip', qty: 2, slot: 'strip', note: '电视墙' },
          { product: 'luma-sense', qty: 1, slot: 'hub', fixed: true },
          { product: 'halo-orb', qty: 1, slot: 'table', note: '边几' },
        ] },
      { id: 'bedroom', name: '卧室', en: 'Bedroom', area: 16, layout: 'bedroom',
        note: '两颗 Halo Orb 轮流值日：左边负责唤醒，右边负责睡前。灯带贴在床头背后。',
        items: [
          { product: 'halo-orb', qty: 2, slot: 'bedside', fixed: true, note: '床头两侧' },
          { product: 'tide-strip', qty: 1, slot: 'strip', note: '床头背景' },
          { product: 'luma-shade', qty: 1, slot: 'shade' },
          { product: 'luma-sense', qty: 1, slot: 'hub' },
        ] },
      { id: 'dining', name: '餐厨', en: 'Dining', area: 12, layout: 'dining',
        note: '吊灯距桌面 720 mm，2400K 下的菜色最接近真实。橱柜下的灯带负责备餐。',
        items: [
          { product: 'halo-pendant', qty: 1, slot: 'pendant', fixed: true },
          { product: 'tide-strip', qty: 2, slot: 'strip', note: '橱柜下' },
          { product: 'veil-panel', qty: 1, slot: 'panel' },
          { product: 'luma-sense', qty: 1, slot: 'hub' },
        ] },
      { id: 'study', name: '书房', en: 'Study', area: 10, layout: 'study',
        note: '面板灯与台灯同为 5000K，双重照明让书页没有阴影；书架上的灯带减轻视觉疲劳。',
        items: [
          { product: 'halo-orb', qty: 1, slot: 'table', fixed: true, note: '桌面' },
          { product: 'veil-panel', qty: 1, slot: 'panel' },
          { product: 'tide-strip', qty: 1, slot: 'strip', note: '书架' },
          { product: 'luma-sense', qty: 1, slot: 'hub' },
        ] },
    ],
  },

  /* ── 智能联动：点选左侧的联动场景，右侧的 App 示意会同步变化 ───────────── */
  smart: {
    eyebrow: '智能联动', eyebrowEn: 'Smart Linkage',
    title: ['不需要你去开灯，', '光自己知道时间'],
    lead: 'Luma Sense 是房间的大脑：感知日光、温度与人的在场，通过 Thread 在本地完成联动。断网、断云，照常工作。',
    roomName: '客厅',
    capabilities: [
      { title: '本地联动', text: '规则存在中枢里，不经过云端，响应 80 ms。' },
      { title: '开放协议', text: '支持 Matter，可接入你正在使用的智能家居平台。' },
      { title: '存在感应', text: '毫米波识别静止的人，坐着读书灯也不会熄灭。' },
      { title: '日光跟随', text: '每 30 秒读取窗外照度，自动把灯降到刚好够用。' },
    ],
    /* icon: sun｜focus｜sunset｜moon｜away；level 是亮度百分比，on: false 表示关闭 */
    automations: [
      { id: 'wake', name: '清晨唤醒', trigger: '闹钟前 20 分钟', icon: 'sun', summary: '用光把你叫醒，而不是铃声。',
        devices: [
          { product: 'luma-shade', on: true, level: 45 },
          { product: 'halo-orb', on: true, level: 60, kelvin: '4500K' },
          { product: 'veil-panel', on: true, level: 20, kelvin: '2700K' },
          { product: 'halo-floor', on: false },
          { product: 'tide-strip', on: false },
        ] },
      { id: 'focus', name: '专注时刻', trigger: '工作日 09:00 – 18:00 · 人在书房', icon: 'focus', summary: '人在，灯才亮；日光够，灯就退。',
        devices: [
          { product: 'veil-panel', on: true, level: 80, kelvin: '5000K' },
          { product: 'halo-orb', on: true, level: 60, kelvin: '5000K' },
          { product: 'tide-strip', on: true, level: 40, kelvin: '4000K' },
          { product: 'luma-shade', on: true, level: 100 },
          { product: 'halo-floor', on: false },
        ] },
      { id: 'dinner', name: '晚餐氛围', trigger: '日落前 30 分钟（自动计算）', icon: 'sunset', summary: '太阳落下去，暖光升起来。',
        devices: [
          { product: 'halo-pendant', on: true, level: 70, kelvin: '2400K' },
          { product: 'tide-strip', on: true, level: 30, kelvin: '2200K' },
          { product: 'halo-floor', on: true, level: 40, kelvin: '2400K' },
          { product: 'veil-panel', on: false },
          { product: 'luma-shade', on: true, level: 70 },
        ] },
      { id: 'sleep', name: '夜间安眠', trigger: '23:00 · 手机充电中', icon: 'moon', summary: '十分钟后，房间和你一起入睡。',
        devices: [
          { product: 'halo-floor', on: true, level: 3, kelvin: '1800K' },
          { product: 'tide-strip', on: true, level: 3, kelvin: '1800K' },
          { product: 'halo-orb', on: false },
          { product: 'veil-panel', on: false },
          { product: 'luma-shade', on: true, level: 0 },
        ] },
      { id: 'away', name: '离家节能', trigger: '最后一人离开（中枢感应）', icon: 'away', summary: '全部熄灭，只留 0.3W 的待机。',
        devices: [
          { product: 'halo-floor', on: false },
          { product: 'halo-orb', on: false },
          { product: 'halo-pendant', on: false },
          { product: 'tide-strip', on: false },
          { product: 'luma-shade', on: true, level: 0 },
        ] },
    ],
  },

  /* ── 节能：数字会滚动显示；bars 是年度耗电对比；lampOn / lampOff 是一天中的灯光输出曲线 ── */
  energy: {
    eyebrow: '节能', eyebrowEn: 'Energy',
    title: '更亮，却更省',
    lead: '日光感应让灯在白天退后，只补足阴影。一天下来，照明的耗电比常规 LED 方案少 62%。',
    chartTitle: '一年要多少度电', chartNote: '8 个灯位 · 每天 5 小时',
    switch: { title: '日光感应', text: '窗外够亮时，自动降低灯光输出' },
    curveTitle: '一天的光线曲线', curveNote: '橙色是窗外日光，浅色是灯光输出',
    note: '按 8 个常用灯位、每天 5 小时、电价 0.6 元 / 度估算。',
    pricePerKwh: 0.6,
    stats: [
      { value: 62, unit: '%', label: '更少的电', note: '对比同等亮度的常规 LED 方案（开启日光感应）' },
      { value: 0.3, unit: 'W', label: '待机功耗', note: '全部灯具与电机的待机功率总和' },
      { value: 50000, unit: 'h', label: '光源寿命', note: '按每天 5 小时计算，约 27 年' },
      { value: 1.6, unit: '年', label: '平均回本', note: '按 0.6 元 / 度估算' },
    ],
    bars: [
      { id: 'incandescent', name: '白炽灯方案', kwh: 876, note: '8 × 60W' },
      { id: 'led', name: '常规 LED 方案', kwh: 146, note: '8 × 10W' },
      { id: 'luma', name: 'Luma 全屋方案', kwh: 55, kwhAlt: 96, note: '日光感应开启', noteAlt: '日光感应关闭' },
    ],
    summaryOn: '开启日光感应后，Luma 全屋方案每年约用电 {kwh} 度（约 {cost}），比常规 LED 方案少 62%。',
    summaryOff: '关闭日光感应后，Luma 全屋方案每年约用电 {kwh} 度（约 {cost}），与常规 LED 方案接近。',
  },

  install: {
    eyebrow: '安装方式', eyebrowEn: 'Installation',
    title: '十分钟，不用重新布线',
    lead: '磁吸底座加无痕胶，租房也能装。不想自己动手？120 城可预约上门。',
    steps: [
      { title: '定位', text: '把定位纸贴在墙上，两个孔位一目了然。不想打孔？无痕胶同样牢固。', icon: 'locate' },
      { title: '固定', text: '拧入两颗螺丝，或直接粘贴磁吸底座。', icon: 'mount' },
      { title: '吸合', text: '灯体靠近底座会被轻轻吸住，咔哒一声到位，不需要工具。', icon: 'snap' },
      { title: '配对', text: '打开 App 扫一扫灯体上的码，10 秒接入 Thread 网络。', icon: 'pair' },
    ],
    tableHead: ['产品', '安装方式', '用时', '是否需要布线'],
    wiringYes: '需要', wiringNo: '不需要',
  },

  reviews: {
    eyebrow: '用户评价', eyebrowEn: 'Reviews',
    title: '他们家的光，也在变化',
    score: 4.9, count: 12860, recommend: 98,
    scoreLabel: '条评价', recommendLabel: '会推荐', verifiedLabel: '已验证购买',
    seo: false,                                     // 评价为真实数据时可设为 true，会输出搜索引擎可读的评价结构化数据
    list: [
      { name: '林嘉宜', city: '上海', set: '客厅套装 · 入住 3 个月', stars: 5,
        title: '搬进新家的第一个月，我没有再手动开过灯。',
        text: '早上是纱帘和台灯把我叫醒的。以前闹钟一响就要摸黑开灯，刺眼；现在是光先到，人后醒。' },
      { name: '周予安', city: '成都', set: 'Halo Pendant · 入住 5 个月', stars: 5,
        title: '餐桌上方那圈光，让晚饭多坐了半小时。',
        text: '2400K 的时候菜的颜色最真实，孩子说像餐厅。无频闪不是噱头，录视频完全没有条纹。' },
      { name: '陈牧遥', city: '深圳', set: '卧室套装 · 入住 2 个月', stars: 5,
        title: '租的房子，全部免打孔装完，退租能带走。',
        text: '灯带是贴的，镜灯是无痕胶，纱帘轨道是顶装。整个过程一个人，一个下午。' },
      { name: '苏晚', city: '杭州', set: '全屋 10 件 · 入住 1 年', stars: 5,
        title: '电费单是有说服力的评价。',
        text: '白天灯基本不亮，Sense 会跟着日光调。两个月下来，照明这块的电费比之前少了六成。' },
    ],
  },

  buy: {
    eyebrow: '选购', eyebrowEn: 'Buy',
    title: '从一个房间开始',
    lead: '套装额外 88 折，满 ¥3,000 赠上门安装。也可以在上方逐件加入购物袋。',
    addLabel: '加入购物袋', buyNowLabel: '立即购买',
    bundleAddLabel: '套装加入购物袋',
    bundleDiscount: 0.88,                            // 凑齐整套搭配时的折扣
    freeInstallThreshold: 3000,
    perks: [
      { icon: 'truck', text: '48 小时发货 · 全场包邮' },
      { icon: 'return', text: '30 天住着试' },
      { icon: 'shield', text: '5 年整件质保' },
    ],
    /* items: [商品 id, 数量] */
    bundles: [
      { id: 'living', name: '客厅光', en: 'Living Set', tag: '热门套装', room: 'living',
        items: [['halo-floor', 1], ['veil-panel', 1], ['tide-strip', 1], ['luma-sense', 1]] },
      { id: 'bedroom', name: '卧室安睡', en: 'Sleep Set', tag: '日出唤醒', room: 'bedroom',
        items: [['halo-orb', 2], ['tide-strip', 1], ['luma-shade', 1]] },
      { id: 'whole', name: '全屋', en: 'Whole Home', tag: '更划算', room: null, featured: true,
        items: [['halo-floor', 1], ['halo-orb', 2], ['halo-pendant', 1], ['veil-panel', 2], ['veil-mirror', 1], ['tide-strip', 3], ['luma-sense', 1], ['luma-shade', 1]] },
    ],
  },

  care: {
    eyebrow: '售后服务', eyebrowEn: 'Care',
    title: '买走之后，我们仍在',
    /* icon: shield｜return｜tools｜refresh｜chat｜truck */
    services: [
      { icon: 'shield', title: '5 年整件质保', text: '灯具与电机整件包换，不含糊。' },
      { icon: 'return', title: '30 天住着试', text: '装上住 30 天，不合适免费取回。' },
      { icon: 'tools', title: '上门安装', text: '120 城预约，师傅带鞋套和工具。' },
      { icon: 'refresh', title: '以旧换新', text: '任意品牌的旧灯抵 ¥50–¥300。' },
      { icon: 'chat', title: '一对一灯光顾问', text: '帮你规划每个房间的色温与照度。' },
    ],
    advisor: {
      eyebrow: '预约灯光顾问', title: '聊聊你家的光',
      lead: '告诉我们房间和困扰，顾问会为你规划每个房间的色温、照度与安装点位。30 分钟，免费。',
      submitLabel: '提交预约', doneTitle: '预约已提交',
      consent: '我已阅读并同意《隐私政策》',
      cities: ['上海', '北京', '深圳', '成都', '杭州', '广州', '武汉', '南京'],
      rooms: ['客厅', '卧室', '餐厨', '书房', '全屋'],
    },
    faqTitle: '常见问题',
    faq: [
      { q: '需要重新布线吗？', a: '不需要。除 Halo Pendant 吊灯需要预留顶面电源外，其余产品都使用原有插座或灯位。灯带与中枢附 3 m 电源线，可藏进家具背后。' },
      { q: '我家已经有智能平台，可以接入吗？', a: '全部产品支持 Matter 协议，可以桥接进入你正在使用的主流智能家居平台，也可以只用 Luma App——不依赖任何云端，断网时本地联动照常工作。' },
      { q: '租房可以安装吗？', a: '可以。灯带使用无痕背胶，镜灯可选免打孔支架，纱帘轨道为顶装免钉件。搬家时拆下即可，不留下痕迹。' },
      { q: '灯带可以自己裁剪吗？', a: '可以。灯带每 5 cm 有一个裁切标记，用普通剪刀即可。套装内附对接头与尾塞，延长到 10 m 仍能保持亮度一致。' },
      { q: '保修怎么算？', a: '自签收日起 5 年内，灯具、电机与驱动出现非人为故障，我们整件换新，往返物流由我们承担。' },
      { q: '多久能送到并安装？', a: '现货商品 48 小时内发出。预约上门安装通常在送达后 3 天内，可在结算时选择时间段。' },
    ],
  },

  footer: {
    blurb: '让房间跟随生活变化。',
    columns: [
      { title: '产品', links: [ { label: 'Halo 光环系列', href: '#collection' }, { label: 'Veil 柔幕系列', href: '#collection' }, { label: 'Tide 潮汐系列', href: '#collection' }, { label: '智能设备', href: '#collection' } ] },
      { title: '服务', links: [ { label: '安装方式', href: '#install' }, { label: '质保与退换', href: '#care' }, { label: '以旧换新', href: '#care' }, { label: '灯光顾问', href: '#care' } ] },
      { title: '了解', links: [ { label: '设计理念', href: '#design' }, { label: '智能联动', href: '#smart' }, { label: '节能', href: '#energy' }, { label: '用户评价', href: '#reviews' } ] },
    ],
  },

  /* ── 法务页面（privacy.html / terms.html）：上线前请由法务核对 ─────────── */
  legal: {
    updated: '2026-11-01',
    privacy: {
      title: '隐私政策',
      intro: '我们深知个人信息对你的重要性，会按照法律法规与行业标准，以安全可靠的方式收集、使用、存储与保护你的信息。',
      sections: [
        { h: '我们收集的信息', p: ['当你预约灯光顾问或提交订单意向时，我们会收集你主动填写的称呼、手机号、收货地址与备注。', '当你浏览本站时，我们的统计服务可能记录访问页面、访问时长与设备类型等去标识化信息。'] },
        { h: '信息的使用', p: ['用于联系你、安排上门服务、处理订单与售后，以及改进页面内容。未经你的同意，我们不会将信息用于上述之外的目的。'] },
        { h: '信息的共享', p: ['仅在配送、安装与售后服务必需的范围内，向承担相应服务的合作方提供必要的收货信息，并要求其承担保密义务。我们不会出售你的个人信息。'] },
        { h: '存储与安全', p: ['你的信息存储于中华人民共和国境内的服务器，保存期限为完成服务目的所必需的期间。我们采用加密传输与访问权限控制等措施保护信息安全。'] },
        { h: '你的权利', p: ['你可以随时查询、更正、删除你的个人信息，或撤回授权同意。可通过页脚的客服电话或邮箱与我们联系，我们将在 15 个工作日内答复。'] },
      ],
    },
    terms: {
      title: '购买与服务条款',
      intro: '在本站提交订单即表示你已阅读并同意以下条款。如条款更新，我们会在页面上公布。',
      sections: [
        { h: '下单', p: ['本站接受订单意向。提交后，顾问会在工作时间内与你确认商品、数量、价格与安装时间，最终订单以双方确认为准。'] },
        { h: '价格与支付', p: ['页面价格均为含税零售价。促销与套装折扣以提交时页面显示为准，确认订单时会再次核对。'] },
        { h: '配送与安装', p: ['现货商品 48 小时内发货，全场包邮。上门安装服务覆盖范围以预约时确认的城市为准。'] },
        { h: '退换货', p: ['签收日起 30 天内，商品完好、配件齐全可申请无理由退货，往返运费由我们承担。定制类商品除外。'] },
        { h: '质保', p: ['自签收日起 5 年内，灯具、电机与驱动出现非人为故障，我们提供整件换新服务。'] },
      ],
    },
  },
};
