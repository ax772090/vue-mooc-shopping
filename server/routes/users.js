var express = require('express');
var router = express.Router();
var Users = require('../models/users')

router.get('/', function (req, res, next) {
    res.send('respond with a resource')
});
router.get('/test', function (req, res, next) {
    res.send('test');
});

//指定二级路由
//登录
router.post('/login', function (req, res, next) {
    let param = {
        userName: req.body.userName,
        userPwd: req.body.userPwd
    }
    Users.findOne(param, (err, doc) => {
        if (err) {
            //这里是报错处理，不是密码不对处理
            res.json({
                status: '1',
                msg: err.message
            });
        } else {
            //这里是登录成功,返回userName,并且保存在cookie中
            if (doc) {
                //往客户端写cookie
                res.cookie("userId", doc.userId, {
                    path: '/',
                    maxAge: 1000 * 60 * 60
                });
                res.cookie("userName", doc.userName, {
                    path: '/',
                    maxAge: 1000 * 60 * 60
                });
                res.json({
                    status: '0',
                    msg: '',
                    result: {
                        userName: doc.userName
                    }
                })
            }
        }
    })
});
//登出接口
router.post('/logout', function (req, res, next) {
    //退出时清除cookie
    /*res.cookie('userId', '', {
        path: '/',
        maxAge: -1
    });*/
    res.clearCookie('userId', {
        path: '/',
        maxAge: -1
    });
    res.json({
        status: '0',
        msg: '',
        result: ''
    })
});
//校验登录
router.get('/checkLogin', function (req, res, next) {
    //如果已经登录了，会在客户端cookie中存在userId，然后返回userName
    if (req.cookies.userId) {
        res.json({
            status: '0',
            msg: '',
            result: {
                userName: req.cookies.userName
            } || {}
        })
    } else {
        res.json({
            status: '1',
            msg: '未登录',
            result: ''
        })
    }
});

module.exports = router;