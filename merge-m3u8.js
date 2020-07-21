var path = require('path');
var join = require('path').join;
var fs = require('fs');
var http = require('http');
var exec = require('child_process').exec;
// 引入readline模块
var readline = require('readline');

//创建readline接口实例
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let targetFiles = [];

function findFiles(path) {
    // path = encodeURI(path);
    let files = fs.readdirSync(path);
    files.forEach(function (item, index) {
        let fPath = join(path, item);
        // fPath = encodeURI(fPath);
        let stat = fs.statSync(fPath);
        if (stat.isDirectory() === true) {
            findFiles(fPath);
        }
        if (stat.isFile() === true && confirmEnding(fPath, '.m3u8')) {
            targetFiles.push(fPath);
            console.log(targetFiles.length, fPath);
        }
    });
}

// close事件监听
rl.on("close", function () {
    // 结束程序
    process.exit(0);
});

// question方法
function selectOption() {
    rl.question("选项：\n1. 合并m3u8缓存\n2. 下载m3u8\n请选择：", function (index) {

        switch (index) {
            case '1':
                console.log("你选择：合并m3u8缓存");
                gotoOption1();
                break;
            case '2':
                console.log("你选择：下载m3u8");
                gotoOption2();
                break;

            default:
                console.log("无效选择，请重新选择：");
                selectOption();
                break;
        }
    });
}

selectOption();

function gotoOption1() {
    rl.question("请输入m3u8缓存目录或其父目录完整路径：", function (path) {

        if (!path) {
            console.log('输入无效。');
            gotoOption1()
            return;
        }

        console.log("开始扫描：" + path);

        // 扫描目录
        findFiles(path);

        console.log(`一共找到${targetFiles.length}个符合的目标文件。`);
        if (targetFiles.length < 1) rl.close();

        mergeInput();

        // 不加close，则不会结束
        // rl.close();
    });
}

function gotoOption2() {

    rl.question("请输入m3u8地址：", function (uri) {

        if (!uri) {
            gotoOption2()
            return;
        }

        function inputSaveDir() {
            rl.question("请输入保存目录：", function (path) {

                if (!path) {
                    inputSaveDir();
                    return;
                }

                fs.mkdir(path, () => {
                    console.log('开始下载...');
                        // downloadFileAsync(uri,path);
                });

            });
        }

        inputSaveDir();

    });

}

function mergeInput() {
    var question = targetFiles.length == 1 ?
        `请输入需要合并的文件序号1或直接回车即可：` :
        `请输入需要合并的文件序号[1,${targetFiles.length}]，如果需要全部合并直接回车即可：`;
    rl.question(question, function (index) {
        if (!index) {
            console.log("已选择全部合并。");
            mergeM3u8(targetFiles);
        } else {
            if (index <= targetFiles.length) {
                var selectedPath = targetFiles[index - 1];
                console.log("已选择合并：", index, selectedPath);
                targetFiles.length = 0;
                targetFiles.push(selectedPath);
                mergeM3u8(targetFiles);
            } else {
                console.log(`无效序号，请检查，序号范围在[1-${targetFiles.length}],请重新输入：`);
                mergeInput();
            }
        }

    });
}

function mergeM3u8(targetFiles) {
    if (targetFiles.length > 0) {
        targetFiles.forEach((path) => {
            console.log("正在合并：", path);

            var input = fs.createReadStream(path);
            readLines(path, input, writeLines);

        });
    }
}


function readLines(path, input, writeLines) {
    var remaining = '';
    input.on('data', function (data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        while (index > -1) {
            var line = remaining.substring(0, index);
            remaining = remaining.substring(index + 1);
            writeLines(path, line);
            index = remaining.indexOf('\n');
        }

        readFileEnd(mergeM3u8Map[path]);
    });

    input.on('end', function () {
        if (remaining.length > 0) {
            writeLines(path, remaining);

            readFileEnd(mergeM3u8Map[path]);
        }
    });
}


var mergeM3u8Map = {};

function writeLines(path, lineString) {
    var key = path;
    var dirPath = path.substring(0, path.lastIndexOf("\\"));
    var fileFullName = path.substring(path.lastIndexOf("\\") + 1);
    var fileName = fileFullName.substring(0, fileFullName.lastIndexOf("."));

    if (!mergeM3u8Map.hasOwnProperty(key)) {
        mergeM3u8Map[key] = {
            m3u8Path: key,
            dirPath: dirPath,
            fileName: fileName,
            ts: []
        }
    }

    if (confirmEnding(lineString, '.ts')) {
        var tsFileFullName = lineString.substring(lineString.lastIndexOf("/") + 1);
        mergeM3u8Map[key].ts.push(tsFileFullName);
    }
}


function readFileEnd(fileData) {
    // console.log(fileData);
    // copy/b 0.ts+1.ts+2.ts+3.ts+4.ts+5.ts+6.ts+7.ts+...ts new.ts
    var mergeExec = 'copy/b ';
    var isFrist = true;
    fileData.ts.forEach((fileFullName) => {
        if (isFrist) {
            mergeExec += `${fileFullName}`;
            isFrist = false;
        } else mergeExec += `+${fileFullName}`;
    });
    var targeFileName = `${fileData.fileName}.ts`
    mergeExec += ` ${targeFileName}`;
    // console.log(mergeExec);
    // 写入bat文件
    fs.writeFile(`${fileData.dirPath}\\compile.bat`, mergeExec, function (err) {
        if (err) throw err;
        exec(`cd ${fileData.dirPath} & call compile.bat`,
            function (error, stdout, stderr) {
                if (error !== null) {
                    throw error;
                } else {
                    console.log('合并完成', `${fileData.dirPath}/${targeFileName}`);
                }
            });
    });
}

/**
 * 判断字符串以某个字符串结尾
 */
function confirmEnding(str, target) {
    var start = str.length - target.length;
    var arr = str.substr(start, target.length);
    if (arr == target) {
        return true;
    }
    return false;
}


function downloadFileAsync(uri, dest) {
    return new Promise((resolve, reject) => {
        // 确保dest路径存在
        const file = fs.createWriteStream(dest);

        http.get(uri, (res) => {
            if (res.statusCode !== 200) {
                reject(response.statusCode);
                return;
            }

            res.on('end', () => {
                console.log('download end');
            });

            // 进度、超时等

            file.on('finish', () => {
                console.log('finish write file')
                file.close(resolve);
            }).on('error', (err) => {
                fs.unlink(dest);
                reject(err.message);
            })

            res.pipe(file);
        });
    });
}