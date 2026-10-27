# yuandhuispacestation 项目长期记忆

## 项目概况
- 名称：yuandhuispacestation 星空主题单页站
- 路径：E:/App/love/
- 技术栈：纯 HTML + CSS + JS，零外部依赖（无框架/无字体/无音频文件）
- 文件结构：index.html、style.css、js/{album-manifest,starfield,music,game2048,messageboard,main}.js、images/、tools/gen_album_manifest.py

## 功能模块
- 背景：深空黑 + CSS 星云光晕 + Canvas 闪烁星星/流星
- 太阳系视图：中心太阳 + 八条轨道 + 八大行星（水/金/地/火/木/土/天/海）按不同周期公转；地球/火星/土星保留点击弹窗（相册/2048/留言板），其余装饰运行
- 相册工作流：图片放 images/ → 跑 tools/gen_album_manifest.py → 自动生成 js/album-manifest.js → 网页加载清单渲染。main.js 读取 window.ALBUM_IMAGES，清单空时回退 picsum 占位
- BGM：Web Audio API 程序化合成，默认静音
- 移动端适配：vmin 自适应太阳系容器、touch-action、hover 媒体查询

## 部署信息
- 托管：GitHub Pages（免费版，仓库需 Public）
- 域名：阿里云购买（DNS 解析配置在阿里云控制台）
- 部署指南：E:/App/love/部署上线指南.html（首次部署）
- 日常同步指南：E:/App/love/日常更新同步指南.html（三方法：Git 命令/网页拖拽/整包上传）
- GitHub Pages A 记录 IP：185.199.108.153 / .109 / .110 / .111
- CNAME 记录值：用户名.github.io
- 关键约束：GitHub Pages 是纯静态托管，无法运行时扫描文件夹，必须本地预生成清单

## 备用包
- _github_pkg/yuandhuispacestation/ 始终与项目根同步，可直接打包上传
