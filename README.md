# 手工活小助手 (Handworker)

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF.svg)](https://vitejs.dev/)
[![Material-UI](https://img.shields.io/badge/MUI-6.4.5-0081CB.svg)](https://mui.com/)

一个简单、高效、易用的手工活记录工具，帮助你科学管理时间。

## 特点 | Features

- 🔒 **数据安全**: 所有数据完全存储在本地，无需担心隐私泄露

- 📊 **数据可视化**: 直观的图表展示统计信息

- 📱 **响应式设计**: 支持各种设备尺寸

- 🌐 **无需后端**: 纯前端应用，无需服务器

## 本地部署 | Local Deployment

如果你想在本地运行此项目，请按照以下步骤操作：

If you want to run this project locally, follow these steps:

```bash
# 克隆项目 | Clone the repository
git clone https://github.com/dabenlee/Handworker.git

# 进入项目目录 | Enter the project directory
cd Handworker

# 安装依赖 | Install dependencies
npm install

# 启动开发服务器 | Start development server
npm run dev
```

## 云端部署 | Cloud Deployment

本项目是纯前端应用，可以轻松部署到各种静态网站托管平台。

### Vercel

1. 在 GitHub上Fork本仓库


2. 登录 [Vercel](https://vercel.com)


3. 点击 "New Project" 并导入你的 GitHub 仓库


4. 保持默认配置即可，Vercel 会自动检测 Vite 项目


5. 点击 "Deploy"
   
部署完成后，Vercel会提供一个可访问的URL。中国大陆地区污染了Vercel的默认域名，你可以通过绑定自己的域名来解决这个问题。

### Cloudflare Pages [参考文档](https://vitejs.cn/vite3-cn/guide/static-deploy.html#cloudflare-pages)

1. 在 GitHub上Fork本仓库

2. 登录 [Cloudflare](https://dash.cloudflare.com/)

3. 在"Workers & Pages" 中点击 "Create" , 类型选择 "Pages" 并导入你的 GitHub 仓库

4. 在"Framework preset" 中选择 "React(Vite)"

5. 点击 "Deploy"

部署完成后，Cloudflare Pages 会提供一个可访问的URL。中国大陆地区污染了 Cloudflare Pages 的默认域名，你可以通过绑定自己的域名来解决这个问题。

### 自行构建镜像 | Build Your Own Image
如果您想自行构建Docker镜像，可以按照以下步骤操作：

```bash
# 构建镜像 | Build image
docker build -t handworker .

# 运行容器 | Run container
docker run -d -p 80:80 --name handworker handworker
```

## 技术栈 | Tech Stack

- React 19.0.0
- TypeScript 5.7.2
- Vite 6.1.0
- Material-UI 6.4.5
- Chart.js 4.4.7

## 隐私说明 | Privacy Statement

本项目基于纯前端技术构建，默认情况下，所有的数据会根据域名保存在您的浏览器当中，未经您允许，我们不会收集并使用您的任何信息。在后续开发当中，可能会有部分功能需要联网并且上传数据，在此之前，我们会征得您的同意，如果您拒绝上传数据，您将无法访问少数功能，但这不会对您正常使用程序造成任何影响。


## 项目维护说明 | Maintenance Statement

⚠️ 请注意：本项目由AI工具Trae编写，原作者可能没有持续维护的能力。欢迎社区贡献者参与改进。


## 许可证 | License

GPL-3.0（GNU General Public License v3.0）

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=dabenlee/Handworker&type=Timeline)](https://www.star-history.com/#dabenlee/Handworker&Timeline)
