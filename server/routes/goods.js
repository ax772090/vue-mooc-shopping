var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var Goods = require('../models/goods')
var Users = require('../models/users')

//连接MongoDB数据库
mongoose.connect('mongodb://127.0.0.1:27017/dbmooc')

mongoose.connection.on("connected", function () {
    console.log("MongoDB connected success")
})
mongoose.connection.on("error", function () {
    console.log("MongoDB connected error")
})
mongoose.connection.on("disconnected", function () {
    console.log("MongoDB connected disconnected")
})

//这里是二级路由的开始
//查询商品列表
router.get("/list", function (req, res, next) {
    let page = parseInt(req.query.page);
    let pageSize = parseInt(req.query.pageSize);
    let sort = req.query.sort;
    let priceLevel = req.query.priceLevel;
    let skip = (page - 1) * pageSize;
    var priceGt = "",
        priceLte = "";
    let param = {};
    if (priceLevel !== 'all') {
        switch (priceLevel) {
            case '0':
                priceGt = 0;
                priceLte = 100;
                break;
            case '1':
                priceGt = 100;
                priceLte = 500;
                break;
            case '2':
                priceGt = 500;
                priceLte = 1000;
                break;
            case '3':
                priceGt = 1000;
                priceLte = 5000;
                break;
        }
        param = {
            salePrice: {
                $gt: priceGt,
                $lte: priceLte
            }
        }
    }

    let goodsModel = Goods.find(param).skip(skip).limit(pageSize);
    goodsModel.sort({
        'salePrice': sort
    });

    goodsModel.exec(function (err, docs) {
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            });
        } else {
            res.json({
                status: '0',
                msg: '',
                result: {
                    count: docs.length,
                    list: docs
                }
            });
        }
    });
});
// 加入到购物车
router.post("/addCart", function (req, res, next) {
    //拿到用户信息，判断用户是否存在
    var userId = "100000077", productId = req.body.productId;
	Users.findOne({userId: userId}, function (err, userDoc) {
        //这个userDoc是从User表中根据userId拿到的所有数据
        if (err) {
            res.json({
                status: '1',
                msg: err.message
            })
        } else {
            console.log("userDoc" + userDoc);
            if (userDoc) {
                let goodsItem = '';
                //先去循环遍历下是否在购物车里面有该商品，如果有，直接给productNum++，然后保存即可
                userDoc.cartList.forEach(function (item, index) {
                    if (item.productId === productId) {
                        goodsItem = item;
                        item.productNum++;
                    }
                });
                if (goodsItem) {
                    userDoc.save(function (err2, doc2) {
                        if (err2) {
                            res.json({
                                status: '1',
                                msg: err2.message
                            })
                        } else {
                            res.json({
                                status: '0',
                                msg: "",
                                result: "success"
                            })
                        }
                    })
                } else {
                    //如果userDoc存在，那么根据产品Id拿到该产品
                    Goods.findOne({productId: productId}, function (err1, doc1) {
                        if (err1) {
                            res.json({
                                status: '1',
                                msg: err1.message
                            })
                        } else {
                            if (doc1) {
                                //该产品添加产品数量和是否选中的属性
                                doc1.productNum = 1;
                                doc1.checked = 1;
                                userDoc.cartList.push(doc1);//然后将该产品放入用户的购物车里面
                                userDoc.save(function (err2, doc2) {
                                    if (err2) {
                                        res.json({
                                            status: '1',
                                            msg: err2.message
                                        })
                                    } else {
                                        res.json({
                                            status: '0',
                                            msg: "",
                                            result: "success"
                                        })
                                    }
                                })
                            }
                        }
                    })
                }

            }
        }
    })


});

module.exports = router;
