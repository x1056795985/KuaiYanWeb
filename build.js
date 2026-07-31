//打包预构建,删除编译目录下,含子目录后缀非.go的文件
import fs from 'fs';
import path from 'path';

const distPath = 'E:\\yun\\project\\TY通用后台管理系统\\server2\\app\\web\\VueAdmin';

if (fs.existsSync(distPath)) {
    fs.readdirSync(distPath).forEach((file) => {
        const filePath = path.join(distPath, file);
        const isGoFile = file.endsWith('.go');

        if (!isGoFile) {
            if (fs.lstatSync(filePath).isDirectory()) {
                deleteNonGoFiles(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        }
    });
}

function deleteNonGoFiles(directoryPath) {
    fs.readdirSync(directoryPath).forEach((file) => {
        const filePath = path.join(directoryPath, file);
        const isGoFile = file.endsWith('.go');

        if (!isGoFile) {
            if (fs.lstatSync(filePath).isDirectory()) {
                deleteNonGoFiles(filePath);
            } else {
                fs.unlinkSync(filePath);
            }
        }
    });

    //fs.rmdirSync(directoryPath);
}
