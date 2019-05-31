var MongoClient = require('mongodb').MongoClient;
var db_name = 'runoob';
var url = "mongodb://localhost:27017/" + db_name;

MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    console.log("数据库已创建!");
    db.close();
});


var express = require('express');
var router = express();
var multer = require('multer');
var UUID = require('uuid')
var path = require('path')

var util = require('./util')


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public'))
    },
    filename: function (req, file, cb) {

        var str = file.originalname.split('.');
        cb(null, UUID.v1() + '.' + str[1]);
    }
})
var upload = multer({ storage: storage })



var jsonWrite = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '1',
            msg: '操作失败'
        });
    } else {
        res.json(ret);
    }
};

// 更新操作还是得走update
router.post('/insert', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var p = req.body;
        var dbo = db.db(db_name);
        var myobj = p.data;
        dbo.collection(p.table).save(myobj, function (err, result) {
            if (err) throw err;
            console.log("文档插入成功");
            jsonWrite(res, result);
            db.close();
        });
    });
});

// 大于：$gt

// 　　小于：$lt

// 　　大于等于：$gte

// 　　小于等于：$lte

// 　　非等于：$ne 
router.post('/search', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var p = req.body;
        var dbo = db.db(db_name);
        var whereStr = p.data == undefined ? {} : p.data;  // 查询条件
        dbo.collection(p.table).find(whereStr).toArray(function (err, result) {
            if (err) throw err;
            jsonWrite(res, result);
            db.close();
        });
    });
});

router.post('/page', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var p = req.body;
        var skip = (p.pageSize - 1) * p.pageNum
        var dbo = db.db(db_name);
        var whereStr = p.data == undefined ? {} : p.data;  // 查询条件
        dbo.collection(p.table).find(whereStr).skip(skip).limit(p.pageSize).toArray(function (err, result) {
            if (err) throw err;
            var data = {}
            dbo.collection(p.table).count(whereStr, (err, count) => {
                data.data = result
                data.total = count
                jsonWrite(res, data);
                db.close();
            })

        });
    });
});

router.post('/delete', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var p = req.body;
        var dbo = db.db(db_name);
        var whereStr = p.data == undefined ? {} : p.data;  //条件
        dbo.collection(p.table).remove(whereStr, function (err, result) {
            if (err) throw err;
            jsonWrite(res, result);
            db.close();
        });
    });
});

router.post('/update', (req, res) => {
    MongoClient.connect(url, { useNewUrlParser: true }, function (err, db) {
        if (err) throw err;
        var p = req.body;
        var dbo = db.db(db_name);
        var whereStr = p.data == undefined ? {} : p.data;  //条件
        dbo.collection(p.table).updateMany(whereStr, p.set, function (err, result) {
            if (err) throw err;
            jsonWrite(res, result);
            db.close();
        });
    });
});


router.get('/code', (req, res) => {
    let img = util.makeCapcha()
    res.setHeader('Content-Type', 'image/bmp')
    res.end(img.getFileData())

});

router.get('/getcode', (req, res) => {
    res.end(util.getCode())
});



router.post('/upload', upload.array('file', 10), async (req, res, next) => {

    var sql = 'insert into resource(filePath,fileName,originalname) values(?,?,?)'
    let fileIdList = []
    for (var i = 0; i < req.files.length; i++) {
        var file = req.files[i]
        // goods_picture += req.files[i].filename+'#'
        var result = await query(sql, [file.path, file.filename, file.originalname])

        fileIdList.push(result.insertId)

    }
    jsonWrite(res, fileIdList);

})





module.exports = router;
