const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, // 게임 해상도 가로
    height: 720, // 게임 해상도 세로
    resizable: false, // 창 크기 조절 금지 (싱크 유지용)
    fullscreen: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // 상단 메뉴바 제거 (진짜 게임처럼 보이게)
  win.setMenuBarVisibility(false);

  // 메인 파일 로드
  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
