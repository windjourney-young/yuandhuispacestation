# yuandhuispacestation

星空主题单页空间站：太阳系八大行星绕日运行 · 地球相册 · 火星 2048 · 土星留言板。

纯静态网站（HTML + CSS + JS），无需后端、无需构建，可直接用 **GitHub Pages** 免费部署上线。

## 项目结构

```
yuandhuispacestation/
├── index.html              # 主页面（太阳系视图 + 三个弹窗）
├── style.css               # 样式（含太阳系轨道/行星公转动画）
├── js/
│   ├── album-manifest.js   # 相册图片清单（由脚本自动生成，勿手改）
│   ├── starfield.js        # 闪烁星星 + 流星背景
│   ├── music.js            # 程序化合成的宇宙 BGM
│   ├── game2048.js         # 2048 小游戏
│   ├── messageboard.js     # 土星留言板
│   └── main.js             # 主逻辑（弹窗控制、相册渲染）
├── images/                 # 相册图片放这里（增减即同步）
│   └── README.txt          # 图片使用说明
├── tools/
│   └── gen_album_manifest.py   # 扫描 images/ 生成 js/album-manifest.js
└── .nojekyll               # 告诉 GitHub Pages 不要走 Jekyll 处理
```

## 页面内容

- **太阳系视图**：以太阳为中心，八大行星（水星 / 金星 / 地球 / 火星 / 木星 / 土星 / 天王星 / 海王星）按真实顺序分布在 8 条轨道上，各自不同速度公转
- **🌏 地球（可点击）**：打开星际相册，支持左右切换、键盘 ←/→
- **🔴 火星（可点击）**：打开 2048 小游戏，带计分与重置
- **🪐 土星（可点击）**：打开留言板（localStorage 本地存储）
- 其他行星为装饰运行，不可点击
- 背景音乐用 Web Audio API 程序化合成，默认静音

## 部署到 GitHub Pages（3 步搞定）

### 第 1 步：新建仓库

1. 打开 https://github.com/new
2. Repository name 填 `yuandhuispacestation`（名字随意）
3. 选 **Public**（公开仓库才能免费用 GitHub Pages）
4. 点 **Create repository**

### 第 2 步：上传文件

**方式 A — 网页直接上传（最简单）**

1. 进入仓库页面，点 **Add file → Upload files**
2. 把本压缩包里的**所有文件和文件夹**（index.html、style.css、js/、images/、tools/、.nojekyll）拖进去
3. 填 commit message，点 **Commit changes**

**方式 B — 用 Git 命令（推荐长期维护）**

```bash
cd yuandhuispacestation
git init
git add .
git commit -m "init: yuandhuispacestation"
git branch -M main
git remote add origin https://github.com/你的用户名/yuandhuispacestation.git
git push -u origin main
```

### 第 3 步：开启 GitHub Pages

1. 仓库 → **Settings → Pages**
2. Source 选 **Deploy from a branch**，Branch 选 **main / (root)**，**Save**
3. 等 1~2 分钟，访问：

```
https://你的用户名.github.io/yuandhuispacestation/
```

## 自定义相册图片（重要）

相册图片通过 `images/` 文件夹管理，**不再需要改代码**：

1. 把图片（.jpg / .png / .webp 等，建议横图 900×600）放进 `images/` 文件夹
2. 运行 `python tools/gen_album_manifest.py`（双击即可）
   → 脚本自动扫描 `images/`，更新 `js/album-manifest.js`
3. 把 `images/` 和 `js/album-manifest.js` 一起提交到 GitHub
4. 刷新网页即可看到新相册

删除图片：从 `images/` 删掉对应文件 → 再跑一次脚本 → 提交。

> 静态网站无法在运行时扫描文件夹，必须用脚本本地预先生成清单。
> 详细操作与排错见项目根目录的 `日常更新同步指南.html`。

## 日常更新同步

每次改动后推送到 GitHub 的三种方法（命令行 Git / 网页拖拽 / 整包上传），
详见项目根目录的 `日常更新同步指南.html`。GitHub Pages 会在 1-2 分钟内自动重新部署。

## 备注

- 留言板和 2048 最高分用 `localStorage` 保存，每位访客数据独立
- 背景音乐用 Web Audio API 程序化合成，无需音频文件
- `.nojekyll` 确保 GitHub Pages 原样输出
