import {ElMessage} from "element-plus";
import {nextTick} from "vue";
export const 取url根入口路径 = ()=> {
    return window.location.pathname.endsWith('/') ? window.location.pathname.slice(0, -1) : window.location.pathname
}
export const is移动端 = ()=> {
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        return true
    }
    return false
}
export const is苹果端 = ()=> {
    if (navigator.userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)) {
        return true
    }
    return false
    /*    let u = navigator.userAgent;
        //var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端

        return  !!u.match(); //ios终端*/
}

//从1970年开始的毫秒数然后截取10位变成 从1970年开始的秒数
export const 时间_取现行时间戳 = (): number => {
    let outcome = Math.round(new Date().getTime() / 1000).toString();
    return Number(outcome)
}

/**获取前monthNum个月的月份 */
export const 获取前几个个月的月份 = (monthNum): any => {
    let datelist = [""]
    datelist = []
    let date = new Date()
    let M = date.getMonth() + 1
    if (M - monthNum < 0) {
        let begin = 12 + (M - monthNum)
        for (let i = begin + 1; i <= begin + monthNum; i++) {
            if (i > 12) {
                datelist.push(`${i % 12 || 12}月`)
            } else {
                datelist.push(`${i}月`)
            }
        }
    } else {
        let begin = M - monthNum
        for (let i = begin + 1; i <= begin + monthNum; i++) {
            datelist.push(`${i}月`)
        }
    }
    return datelist
}

export const 获取前几个小时的小时 = (monthNum): any => {
    let datelist = [""]
    datelist = []
    let date = new Date()
    let M = date.getHours() + 1
    if (M - monthNum < 0) {
        let begin = 24 + (M - monthNum)
        for (let i = begin + 1; i <= begin + monthNum; i++) {
            if (i > 24) {
                datelist.push(`${i % 24}时`)
            } else {
                datelist.push(`${i}时`)
            }
        }
    } else {
        let begin = M - monthNum
        for (let i = begin + 1; i <= begin + monthNum; i++) {
            datelist.push(`${i}时`)
        }
    }
    return datelist
}
export const 时间_时间戳到时间 = (Time: number) => {
    var date = new Date(Time * 1000);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    var Y = date.getFullYear() + '-';
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var D = date.getDate() + ' ';

    if (D.length == 2) {
        D = "0" + D
    }

    var h = date.getHours() + ':';
    if (h.length == 2) {
        h = "0" + h
    }
    var m = date.getMinutes() + ':';
    if (m.length == 2) {
        m = "0" + m
    }

    var s = date.getSeconds().toString();
    if (s.length == 1) {
        s = "0" + s
    }
    return Y + M + D + h + m + s;
}


//这个复制到剪辑版,可以在非https情况下复制成功
export const 置剪辑版文本2 = (text: string, 成功提示: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {

    }
    document.body.removeChild(textarea);
    if (success) {
        ElMessage.success((成功提示 + text) ?? "复制成功")
    } else {
        ElMessage.error("复制失败")
    }

}


//这个置剪辑版必须 https或本地才正常  因为 window.isSecureContext 这个值真才可以使用,安全上下文
export const 置剪辑版文本 = (text: string, 成功提示: string) => {
    console.log(text)
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
            // 复制成功callback
            function () {
                ElMessage.success(成功提示 ?? "复制成功")
            },
            // 复制失败callback
            function () {
                ElMessage.error("复制失败无操作剪辑版权限")
            },
        )
    } else {
        置剪辑版文本2(text, 成功提示)
    }
}
//Element-Plus 只能传入这个ui库的表格 并激活下载
export const 表格导出csv文本并下载 = (tableRef: any, 文件名称: string, 默认键名数组: any): void => {
    const csvContent = 表格导出csv文本(tableRef, 默认键名数组);
    const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 文件名称 + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};


//Element-Plus 只能传入这个ui库的表格   默认键名数组 因为有时column.property 为空, 所以备用
export const 表格导出csv文本 = (tableRef: any, 默认键名数组: string[]): string => {
    console.log(tableRef); // 检查tableRef的值
    const tableData = tableRef.data;
    const tableColumns = tableRef.store.states.columns._rawValue;
    const labels = tableColumns.map(column => column.label);
    console.log(labels); // 输出：["日期", "姓名", "地址"]

    const csvRows: string[] = [];

    // 获取表头数据
    const headerRow = tableColumns.map((column: any) => column.label);
    headerRow.shift()  //删除数组第一个元素选择框列 因为这个是 空
    csvRows.push(headerRow.join(','));

    // 获取表格数据
    for (const row of tableData) {
        const csvColumns: string[] = [];
        let i = 0
        for (const column of tableColumns) {
            let 局_键名 = column.property
            if (默认键名数组[i]) { //优先使用提供的键值,更准确
                局_键名 = 默认键名数组[i]
            }
            if (column.label && column.label.includes("时间")) {

                csvColumns.push(`"` + 时间_时间戳到时间(row[局_键名]) + `"`);
            } else {
                csvColumns.push(`"${row[局_键名]}"`);
            }
            i++
        }
        csvColumns.shift()//删除数组第一个元素选择框 因为这个是 空
        csvRows.push(csvColumns.join(','));
    }

    return csvRows.join('\n');
};


//Element-Plus 只能传入这个ui库的表格  读取列宽数组  返回整数数组
export const 表格读取列宽数组 = (tableRef: any): any => {
    const tableColumns = tableRef.store.states.columns._rawValue;
    const widths = tableColumns.map(column => column.width);
    return widths
};

// utils.ts 改进版
export const 表格写入列宽数组 = (tableRef:any,widths:number[]) => {
    if (tableRef.data.length===0){  //如果没有数据不改变列宽,因为会出现列宽异常的状况
        return
    }
    console.log("准备执行修改列宽");
    for (var i = 0, len = tableRef.store.states.columns._rawValue.length; i < len; i = i + 1) {
        if (widths[i]!=undefined){
            tableRef.store.states.columns._rawValue[i].width=widths[i]
        }
    }
};

export const 时间_计算分钟提示 = (Time: number) => {
    if (Time === 0) {
        return ""
    }
    let time: number = 时间_取现行时间戳()
    time = time - Time //看剩余秒数
    if ((time === 0)) {
        return time + "刚刚\n"
    }

    if (time < 0) {
        time = parseInt((-time / 60).toString())//看剩余分钟数
        if (time > 60) {
            return 时间_时间戳到时间(Time)
        }
        return time + "分钟后\n" + 时间_时间戳到时间(Time)
    } else {
        time = parseInt((time / 60).toString())  //看剩余分钟数
        if (time > 60) {
            return 时间_时间戳到时间(Time)
        }
        return time + "分钟前"
    }
}

export const 时间_计算天时分秒提示 = (val) => {
    let str = "",
        day,
        hour,
        minute,
        seconds;
    if (val > 0) {
        day = Math.floor(val / 60 / 60 / 24) || 0;
        hour = Math.floor((val - day * 3600 * 24) / 60 / 60) || 0;
        minute = Math.floor((val - day * 3600 * 24 - hour * 3600) / 60) || 0;
        seconds = Math.floor(val - day * 3600 * 24 - hour * 3600 - minute * 60) || 0;
        str = ''
        if (day != 0) {
            str += `${day}天`
        }

        if (hour != 0) {
            str += `${hour}小时`
        }
        if (minute != 0) {
            str += `${minute}分钟`
        }
        if (seconds != 0) {
            str += `${seconds}秒`
        }
        if (str == '') {
            str = '0天'
        }
        return str
    } else {
        return "0天"
    }
}

export const Is卡号 = (AppType: number) => {
    return AppType === 3 || AppType === 4
}


export const 金额整数转中文 = (money) => {
    if (money === null) {
        return ""
    }

    // 接收数字或者字符串数字
    if (typeof money === "string") {
        if (money === '') return ''
        if (isNaN(parseFloat(money))) {
            throw Error(`参数有误：${money}，请输入数字或字符串数字`)
        } else {
            // 去掉分隔符(,)
            money = money.replace(/,/g, '')
        }
    } else if (typeof money === "number") {
        // 去掉分隔符(,)
        money = money.toString().replace(/,/g, '')
    } else {
        throw Error(`参数有误：${money}，请输入数字或字符串数字`)
    }
    // 汉字的数字
    const cnNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
    // 基本单位
    const cnIntRadice = ['', '十', '百', '千']
    // 对应整数部分扩展单位
    const cnIntUnits = ['', '万', '亿', '兆']
    // 对应小数部分单位
    const cnDecUnits = ['角', '分', '毫', '厘']
    // 整数金额时后面跟的字符
    const cnInteger = '整'
    // 整型完以后的单位
    const cnIntLast = '元'
    // 金额整数部分
    let IntegerNum
    // 金额小数部分
    let DecimalNum
    // 输出的中文金额字符串
    let ChineseStr = ''
    // 正负值标记
    let Symbol = ''
    // 转成浮点数
    money = parseFloat(money)
    // 如果是0直接返回结果
    if (money === 0) {
        ChineseStr = cnNums[0] + cnIntLast + cnInteger
        return ChineseStr
    }
    // 如果小于0，则将Symbol标记为负，并转为正数
    if (money < 0) {
        money = -money
        Symbol = '负 '
    }
    // 转换为字符串
    money = money.toString()
    // 将整数部分和小数部分分别存入IntegerNum和DecimalNum
    if (money.indexOf('.') === -1) {
        IntegerNum = money
        DecimalNum = ''
    } else {
        const moneyArr = money.split('.')
        IntegerNum = moneyArr[0]
        DecimalNum = moneyArr[1].substr(0, 4)
    }
    // 获取整型部分转换
    if (parseInt(IntegerNum, 10) > 0) {
        let zeroCount = 0
        let IntLen = IntegerNum.length
        for (let i = 0; i < IntLen; i++) {
            // 获取整数的每一项
            let term = IntegerNum.substr(i, 1)
            // 剩余待处理的数量
            let surplus = IntLen - i - 1
            // 用于获取整数部分的扩展单位
            // 剩余数量除以4，比如12345，term为1时，expandUnit则为1，
            // cnIntUnits[expandUnit]对应得到的单位为万
            let expandUnit = surplus / 4
            // 用于获取整数部分的基本单位
            // 剩余数量取余4，比如123，那么第一遍遍历term为1，surplus为2，baseUnit则为2，
            // 所以cnIntRadice[baseUnit]对应得到的基本单位为'佰'
            let baseUnit = surplus % 4
            if (term === '0') {
                zeroCount++
            } else {
                // 连续存在多个0的时候需要补'零'
                if (zeroCount > 0) {
                    ChineseStr += cnNums[0]
                }
                // 归零
                zeroCount = 0
                /*
                cnNums是汉字的零到玖组成的数组，term则是阿拉伯0-9，
                直接将阿拉伯数字作为下标获取中文数字
                例如term是0则cnNums[parseInt(term)]取的就是'零'，9取的就是'玖'
                最后加上单位就转换成功了！
                这里只加十百千的单位
                */
                ChineseStr += cnNums[parseInt(term)] + cnIntRadice[baseUnit]
            }
            /*
              如果baseUnit为0，意味着当前项和下一项隔了一个节权位即隔了一个逗号
              扩展单位只有大单位进阶才需要，判断是否大单位进阶，则通过zeroCount判断
              baseUnit === 0即存在逗号，baseUnit === 0 && zeroCount < 4 意为大单位进阶
            */
            if (baseUnit === 0 && zeroCount < 4) {
                ChineseStr += cnIntUnits[expandUnit]
            }
        }
        ChineseStr += cnIntLast
    }
    // 小数部分转换
    if (DecimalNum !== '') {
        let decLen = DecimalNum.length
        for (let i = 0; i < decLen; i++) {
            // 同理，参考整数部分
            let term = DecimalNum.substr(i, 1)
            if (term !== '0') {
                ChineseStr += cnNums[Number(term)] + cnDecUnits[i]
            }
        }
    }
    ChineseStr = Symbol + ChineseStr
    return ChineseStr
}

function 文本_取出中间文本(text, startKeyword, endKeyword) {
    const startIndex = text.indexOf(startKeyword);
    const endIndex = text.indexOf(endKeyword);

    if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
        return "";
    }

    return text.substring(startIndex + startKeyword.length, endIndex);
}

