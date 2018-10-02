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

//查询当前用户的购物车数据
router.get('/cartList', function (req, res, next) {
	var userId = req.cookies.userId;
	Users.findOne({userId: userId}, function (err, doc) {
		if (err) {
			res.json({
				status: "1",
				msg: err.message,
				result: ""
			});
		} else {
			if (doc) {
				res.json({
					status: "0",
					msg: "",
					result: doc.cartList
				});
			}

		}
	})
});
//购物车删除
router.post('/cartDel', function (req, res, next) {
	var userId = req.cookies.userId, productId = req.body.productId;
	//新版本里面$pull已被废除，使用pull代替
	Users.update({userId: userId}, {
		$pull: {
			'cartList': {
				'productId': productId
			}
		}
	}, function (err, doc) {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			})
		} else {
			res.json({
				status: '0',
				msg: '',
				result: 'suc'
			})
		}
	});

});
//购物车修改商品数量
router.post('/cartEdit', function (req, res, next) {
	let userId = req.cookies.userId,
		productId = req.body.productId,
		productNum = req.body.productNum,
		checked = req.body.checked;
	//更新子文档的方式
	Users.update({'userId': userId, 'cartList.productId': productId}, {
		'cartList.$.productNum': productNum,
		'cartList.$.checked': checked,
	}, function (err, doc) {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else {
			res.json({
				status: '0',
				msg: '',
				result: 'suc'
			});
		}
	})
});
//商品全选
router.post('/editCheckAll', function (req, res, next) {
	var userId = req.cookies.userId,
		checkAll = req.body.checkAll ? '1' : '0';

	Users.findOne({userId:userId},function (err,user) {
		if(err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		}else{
			if(user){
				user.cartList.forEach((item)=>{
					item.checked = checkAll;
				})
				user.save(function (err1,doc) {
					if(err){
						res.json({
							status:'1',
							msg:err1.message,
							result:''
						});
					}else{
						res.json({
							status:'0',
							msg:'',
							result:'suc'
						});
					}
				})
			}
		}
	});

	//批量更新的方法没有调通
	/*Users.update({
		'userId': userId
	}, {
		'cartList.$.checked': checkAll
	}, {
		multi: true
	}, function (err, doc) {
		if (err) {
			res.json({
				status: '1',
				msg: err.message,
				result: ''
			});
		} else {
			res.json({
				status: '0',
				msg: '',
				result: 'suc'
			});
		}
	})*/
});
module.exports = router;
