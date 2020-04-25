var { ipcRenderer, remote } = require('electron')
var fs = require('fs')


document.title = '新建文件'

//获取文本框dom
var textAreaDom = document.querySelector("#textArea");


//全局变量
var isSave = true //判断文件是否保存
var currentFile = '' //保存当前文件的路径

//内容变化的时候 让isSave等于false
textAreaDom.oninput = function() {
    if (isSave) {
        document.title += "*"
    }
    isSave = false
}








// 右键菜单
document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    ipcRenderer.send('contextMenu')
})




// 监听主进程的操作

ipcRenderer.on('action', function(event, action) {
    console.log(action);
    switch (action) {
        case 'new':
            // 判断文件是否已经保存
            askSaveDialog()
                //置空新文件
            textAreaDom.value = ''
            break;
        case 'open':
            //判断文件是否保存  如果没有保存提示   并保存
            askSaveDialog()
                //通过dialog打开文件

            var dir = remote.dialog.showOpenDialog({
                    properties: ['openFile']
                })
                // 如果选择了文件，点击取消，那么就不执行readFile方法
            if (dir) {
                //替换当前文件的显示标题
                currentFile = dir
                document.title = dir

                //读入文件
                var fsData = fs.readFileSync(dir[0])
                textAreaDom.value = fsData
            }
            break;
        case 'save':
            saveCurrentFile()
            break;
        case 'exit':
            // 判断是否保存了
            askSaveDialog()
                //通知主进程退出应用
            ipcRenderer.send('exit-app')
            break;
    }

})


// 判断文件是否保存
function askSaveDialog() {
    if (!isSave) {
        //开启提示保存的对话框
        var index = remote.dialog.showMessageBox({
            type: 'question',
            message: '老铁，你是否要保存此文件？',
            buttons: ['要呐！', '保存个锤锤']
        })
        if (index === '0') {
            //保存文件
            saveCurrentFile()
        }
    }
}



//保存当前文件
function saveCurrentFile() {
    //如果当前文件的路径不存在。提示保存
    if (!currentFile) {
        var dir = remote.dialog.showSaveDialog({
            defaultPath: "aaa.txt",
            // 打开文件类型设置
            filters: [
                { name: 'All Files', extensions: ['*'] }
            ]
        })

        //写入文件
        if (dir) {
            //重新赋值currentFile当前文件名
            currentFile = dir
            fs.writeFileSync(currentFile, textAreaDom.value)
            isSave = true
                //改变文件标题
            document.title = currentFile
        }
    } else {
        //如果当前文件之前已经保存过，那么就直接保存，不比再提示
        fs.writeFileSync(currentFile, textAreaDom.value)
        isSave = true
        document.title = currentFile
    }
}