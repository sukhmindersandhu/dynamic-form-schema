import * as url from "url";
import * as path from "path";
import { app, BrowserWindow } from "electron";

let mainWindow: BrowserWindow;

function createWindow () {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600
    })
  
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/../../dist/angular-test1/index.html`),
            protocol: "file:",
            slashes: true
        })
    );
    
    mainWindow.on('closed', function () {
        mainWindow = null;
    })
}

app.on("ready", createWindow);

app.on("activate", () => {
    if (mainWindow === null) {
      createWindow();
    }
});


app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})