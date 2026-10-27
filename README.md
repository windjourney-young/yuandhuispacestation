# yuandhuispacestation

星空主题单页空间站：地球相册、火星 2048、土星留言板。

纯静态网站（HTML + CSS + JS），无需后端、无需构建，可直接用 **GitHub Pages** 免费部署上线。

## 项目结构

```
yuandhuispacestation/
├── index.html          # 主页面
├── style.css           # 样式
├── js/
│   ├── starfield.js     # 闪烁星星 + 流星背景
│   ├── music.js         # 程序化合成的宇宙 BGM
│   ├── game2048.js      # 2048 小游戏
│   ├── messageboard.js  # 土星留言板
│   └── main.js          # 主逻辑（相册配置在文件顶部）
└── .nojekyll            # 告诉 GitHub Pages 不要走 Jekyll 处理
```

## 部署到 GitHub Pages（3 步搞定）

### 第 1 步：新建仓库

1. 打开 https://github.com/new
2. Repository name 填 `yuandhuispacestation`（名字随意）
3. 选 **Public**（公开仓库才能免费用 GitHub Pages）
4. 勾选 **Add a README file**（可选）
5. 点 **Create repository**

### 第 2 步：上传文件

**方式 A — 网页直接上传（最简单）**

1. 进入刚建好的仓库页面，点 **Add file → Upload files**
2. 把本压缩包里的**所有文件**（index.html、style.css、js 文件夹、.nojekyll）拖进去
   - 注意：`.nojekyll` 是隐藏文件，可能需要在拖拽时单独确认；如果网页上传丢了它也没关系，可后面用第 3 步里的 Settings 确认
3. 填个 commit message，点 **Commit changes**

**方式 B — 用 Git 命令（推荐长期维护）**

```bash
# 解压本压缩包后进入目录
cd yuandhuispacestation
git init
git add .
git commit -m "init: yuandhuispacestation"
git branch -M main
git remote add origin https://github.com/你的用户名/yuandhuispacestation.git
git push -u origin main
```

### 第 3 步：开启 GitHub Pages

1. 进入仓库，点 **Settings → Pages**（左侧菜单 Pages）
2. 在 **Build and deployment** 下：
   - Source 选 **Deploy from a branch**
   - Branch 选 **main**，文件夹选 **/(root)**
   - 点 **Save**
3. 等待 1~2 分钟，页面顶部会出现你的网址：

```
https://你的用户名.github.io/yuandhuispacestation/
```

刷新几次，等部署完成后即可访问。每次 `git push` 更新代码，Pages 会自动重新发布。

## 自定义相册图片

打开 `js/main.js`，修改顶部的 `albumImages` 数组，把示例占位图换成你的图片链接即可：

```js
const albumImages = [
  'https://你的图片地址1.jpg',
  'https://你的图片地址2.jpg',
  // ...
];
```

建议用横图（900×600 左右）。图片可放在仓库里，也可用外链（如 GitHub 图床、图床网站等）。

## 备注

- 留言板和 2048 最高分都用 `localStorage` 保存，每位访客的数据存在各自浏览器里，互不影响。
- 背景音乐用 Web Audio API 程序化合成，无需任何音频文件；默认静音，点击右上角按钮播放。
- `.nojekyll` 文件确保 GitHub Pages 原样输出，不跳过下划线开头的文件。
