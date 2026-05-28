const { app, BrowserWindow } = require('electron/main')
// 引入 Node.js 内置 http 模块
import http from "http"
import { AddressInfo } from "net";
// 引入 serve-handler
const handler = require('serve-handler');
console.log(process.env.MODE)
// 创建服务器
const server = http.createServer((request, response) => {
  // 核心：用 serve-handler 处理请求
  return handler(request, response, {
    // 配置项（可选）
    public: './web',         // 静态文件根目录（默认当前文件夹）
    cleanUrls: true,     // 去掉 .html 后缀（访问 /about 等于 /about.html）
    // directoryListing: true // 开启目录浏览,
  });
});

server.listen(0, () => {
  console.log('✅ 静态服务已启动：http://localhost:6600');
});
console.log("port", (server.address() as AddressInfo)?.port)


const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600
  })

  win.loadURL('http://localhost:8000')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})