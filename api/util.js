// 图片验证码
var BMP24 = require('gd-bmp').BMP24

// 生成随机数
function rand(min, max) {
    return Math.random() * (max - min + 1) + min | 0 // 特殊的技巧，|0可以强制转换为整数，向下舍入
}

var code=''

// 制造验证码图片
function makeCapcha() {
    let img = new BMP24(100, 40) // 长100， 高40
    // 背景颜色
    img.fillRect(0, 0, 100, 40, 0xffffff) // 白色
    // 画曲线
    var w = img.w / 2
    var h = img.h
    var color = rand(0, 0xffffff)
    var y1 = rand(-5, 5) // Y轴位置调整
    var w2 = rand(10, 15) // 数值越小频率越高
    var h3 = rand(3, 5) //数值越小幅度越大
    var bl = rand(1, 5)
    for (let i = -w; i < w; i += 0.1) {
        var y = Math.floor(h / h3 * Math.sin(i / w2) + h / 2 + y1)
        var x = Math.floor(i + w)
        for (let j = 0; j < bl; j++) {
            img.drawPoint(x, y + j, color)
        }
    }

    // 生成字符
    let p = 'ABCDEFGHKMNPQRSTUVWXYZ1234567890'
    let str = ''
    for (var i = 0; i < 4; i++) { // 生成4个字符
        str += p.charAt(Math.random() * p.length | 0)
    }
    console.log(str)
    code=str
    var fonts = [BMP24.font12x24, BMP24.font16x32]
    var x = 15
    for (var i = 0; i < str.length; i++) {
        let f = fonts[Math.random() * fonts.length | 0]
        y = 8 + rand(-10, 10)
        img.drawChar(str[i], x, y, f, rand(0, 0xffffff))
        x += f.w + rand(2, 8)
    }
    return img
}
function getCode() {
    return code
}


module.exports={
    getCode,
    makeCapcha
}
