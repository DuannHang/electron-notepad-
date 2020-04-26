var { Menu, shell, ipcMain, BrowserWindow, app, Tray } = require('electron');
var path = require('path')

var template = [{
        label: '文件',
        submenu: [{
                label: '新建',
                accelerator: 'Ctrl+N',
                click: function() {
                    // 广播新建
                    BrowserWindow.getFocusedWindow().webContents.send('action', 'new')

                }

            },
            {
                label: '打开',
                accelerator: 'Ctrl+E',
                click: function() {
                    // 通知渲染进程操作文件
                    BrowserWindow.getFocusedWindow().webContents.send('action', 'open')
                }
            },

            {
                label: '保存',
                accelerator: 'Ctrl+S',
                click: function() {
                    // 通知渲染进程操作文件
                    BrowserWindow.getFocusedWindow().webContents.send('action', 'save')
                }
            },
            {
                type: 'separator'
            },


            {
                label: '打印',
                accelerator: 'Ctrl+P',
                click: function() {
                    // 同构webcontence打印--打印当前窗口
                    BrowserWindow.getFocusedWindow().webContents.print();


                }
            },
            {
                label: '退出',
                accelerator: 'Shift+Esc',
                click: function() {
                    //退出--关闭系统
                    // app.quit()
                    // 还要提示用户保存更改文件--这个时候，需要主进程与渲染进程通信，
                    // 点击退出时，广播给渲染进程，拿到这个消息，检查渲染进程里是否未保存，
                    BrowserWindow.getFocusedWindow().webContents.send('action', 'exit')
                }
            }
        ]
    },
    {
        label: '编辑',
        submenu: [{
                label: '撤销',
                role: 'undo'
            },
            {
                label: '恢复',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: '截切',
                role: 'cut'
            },
            {
                label: '复制',
                role: 'copy'
            },
            {
                label: '黏贴',
                role: 'paste'
            },

            {
                label: '删除',
                role: 'delete'
            },
            {
                label: '全选',
                role: 'selectall'
            }
        ]
    },
    {
        label: '视图',
        submenu: [


            {
                label: '缩小',
                role: 'zoomin'
            },
            {
                label: '放大',
                role: 'zoomout'
            },
            {
                label: '重置缩放',
                role: 'resetzoom'
            },
            {
                type: 'separator'
            },
            {
                label: '全屏',
                role: 'togglefullscreen'
            }
        ]
    },
    {
        label: '帮助',
        submenu: [{
                label: '关于',
                click() {
                    // 通过默认浏览器打开
                    shell.openExternal('https://www.baidu.com/');

                }
            },
            {
                label: 'Reload',
                role: 'reload'
            }
        ]
    }
]

var m = Menu.buildFromTemplate(template)

Menu.setApplicationMenu(m)



// 系统托盘
var iconTray = new Tray(path.join(__dirname, '../static/img/666.png'))
var templateTray = [{
        label: '火锅',
        click() {
            // 通过默认浏览器打开
            alert('吃个火锅')
        }
    },
    {
        label: '串串',
        click() {
            // 通过默认浏览器打开
            alert('吃个串串')
        }
    },
    {
        label: '帮助',
        click() {
            // 通过默认浏览器打开
            shell.openExternal('https://www.baidu.com/');

        }
    },
    {
        label: '退出',
        accelerator: 'Shift+Esc',
        click: function() {
            //退出--关闭系统
            // app.quit()
            // 还要提示用户保存更改文件--这个时候，需要主进程与渲染进程通信，
            // 点击退出时，广播给渲染进程，拿到这个消息，检查渲染进程里是否未保存，
            BrowserWindow.getFocusedWindow().webContents.send('action', 'exit')
        }
    }
]
var iconTrayMenu = Menu.buildFromTemplate(templateTray)
    // 绑定托盘菜单
iconTray.setContextMenu(iconTrayMenu)
iconTray.setToolTip('duanhangNotePad')



//实现点击关闭按钮让应用保存在托盘里面 ，双击托盘打开应用
var win = BrowserWindow.getFocusedWindow()
win.on('close', (e) => {
        if (!win.isFocused()) {
            win = null
        } else {
            //阻止窗口的关闭事件
            e.preventDefault()
            win.hide()
        }
    })
    //监听任务栏图标的点击事件
iconTray.on('double-click', function() {
        win.show()
    })
    //闪烁图标
var count = 0
var timer = setInterval(() => {
    count++
    if (count % 2 === 0) {
        iconTray.setImage(path.join(__dirname, '../static/img/666.png'))
    } else {
        iconTray.setImage(path.join(__dirname, '../static/img/empty.png'))
    }
}, 500);


// 右键菜单
const contextMenuTemplate = [{
        label: '撤销',
        role: 'undo'
    },
    {
        label: '恢复',
        role: 'redo'
    },
    {
        type: 'separator'
    },
    {
        label: '截切',
        role: 'cut'
    },
    {
        label: '复制',
        role: 'copy'
    },
    {
        label: '黏贴',
        role: 'paste'
    },
    { type: 'separator' }, //分隔线
    {
        label: '全选',
        role: 'selectall'
    } //Select All菜单项
];

var contextMenu = Menu.buildFromTemplate(contextMenuTemplate)

// 监听通信频道的广播contextMenu--然后加载右键事件
ipcMain.on('contextMenu', function() {
    contextMenu.popup(BrowserWindow.getFocusedWindow())
})


//监听客户端的退出操作
ipcMain.on('exit-app', () => {
    app.quit()
})