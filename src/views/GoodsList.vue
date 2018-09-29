<template>
    <div>
        <nav-header></nav-header>
        <nav-bread>
            <span>Goods</span>
        </nav-bread>
        <div class="accessory-result-page accessory-page">
            <div class="container">
                <div class="filter-nav">
                    <span class="sortby">Sort by:</span>
                    <a href="javascript:void(0)" class="default cur">Default</a>
                    <a href="javascript:void(0)" class="price" @click="sortGoods">Price
                        <svg class="icon icon-arrow-short" v-bind:class="{'sort-up':!sortFlag}">
                            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-short">
                                <svg id="icon-arrow-short" viewBox="0 0 25 32" width="100%" height="100%"><title>
                                    arrow-short</title>
                                    <path d="M24.487 18.922l-1.948-1.948-8.904 8.904v-25.878h-2.783v25.878l-8.904-8.904-1.948 1.948 12.243 12.243z"
                                          class="path1"></path>
                                </svg>
                            </use>
                        </svg>
                    </a>
                    <a href="javascript:void(0)" class="filterby stopPop" @click="showFilterPop">Filter by</a>
                </div>
                <div class="accessory-result">
                    <!-- filter -->
                    <div class="filter stopPop" id="filter" :class="{'filterby-show':filterBy}">
                        <dl class="filter-price">
                            <dt>Price:</dt>
                            <dd>
                                <a href="javascript:void(0)" :class="{'cur':priceChecked==='all'}"
                                   @click="setPriceFilterAll">All</a>
                            </dd>
                            <dd v-for="(price,index) in priceFilter">
                                <a href="javascript:void(0)" @click="setPriceFilter(index)"
                                   :class="{'cur':priceChecked===index}">{{price.startPrice}} - {{price.endPrice}}</a>
                            </dd>
                        </dl>
                    </div>

                    <!-- search result accessories list -->
                    <div class="accessory-list-wrap">
                        <div class="accessory-list col-4">
                            <ul>
                                <li v-for="(item,index) in goodsList">
                                    <div class="pic">
                                        <a href="#">
                                            <img v-lazy="'/static/'+item.productImage" alt="">
                                        </a>
                                    </div>
                                    <div class="main">
                                        <div class="name">{{item.productName}}</div>
                                        <div class="price">{{item.salePrice}}</div>
                                        <div class="btn-area">
                                            <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
                                        </div>
                                    </div>
                                </li>
                            </ul>
                            <div class="load-more" v-infinite-scroll="loadMore" infinite-scroll-disabled="busy"
                                 infinite-scroll-distance="30">
                                <img src="../assets/loading-spinning-bubbles.svg" v-show="loading">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="md-overlay" v-show="overLayFlag" @click="closePop"></div>
        <!--这里是未登录时加入购物车modal-->
        <modal v-bind:mdShow="mdShow1" v-on:close="closeModal">
            <p slot="message">
                请先登录，否则无法加入到购物车
            </p>
            <div slot="btnGroup">
                <a class="btn btn--m" href="javascript:;" @click="mdShow1=false">关闭</a>
            </div>
        </modal>
        <!--这里是加入购物车成功时modal-->
        <modal v-bind:mdShow="mdShowCart" v-on:close="closeModal">
            <p slot="message">
                <svg class="icon-status-ok">
                    <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
                </svg>
                <span>加入购物车成功!</span>
            </p>
            <div slot="btnGroup">
                <a class="btn btn--m" href="javascript:;" @click="mdShowCart=false">继续购物</a>
                <router-link class="btn btn--m" href="javascript:;" to="/cart">查看购物车</router-link>
            </div>
        </modal>
        <nav-footer></nav-footer>
    </div>
</template>
<style>
    .load-more {
        height: 100px;
        line-height: 100px;
        text-align: center;
    }

    .sort-up {
        transform: rotate(180deg);
        transition: all .3s ease-out;
    }
</style>
<script>
    import "../assets/css/base.css";
    import "../assets/css/product.css";
    import NavHeader from "@/components/NavHeader";
    import NavFooter from "@/components/NavFooter";
    import NavBread from "@/components/NavBread";
    import Modal from "@/components/Modal";
    import axios from "axios";

    export default {
        data() {
            return {
                goodsList: [],
                mdShow1: false,
                mdShowCart:false,
                sortFlag: true,
                loading: false,//默认不显示
                page: 1,
                pageSize: 5,
                busy: false,//为true表示可以禁用，失灵的，也就是往下滑的时候不加载
                priceFilter: [
                    {
                        startPrice: 0,
                        endPrice: 100
                    },
                    {
                        startPrice: 100,
                        endPrice: 500
                    },
                    {
                        startPrice: 500,
                        endPrice: 1000
                    },
                    {
                        startPrice: 1000,
                        endPrice: 5000
                    }
                ],
                priceChecked: 'all',
                filterBy: false,
                overLayFlag: false
            };
        },
        components: {
            NavHeader,
            NavFooter,
            NavBread,
            Modal
        },
        mounted() {
            this.getGoodsList();
        },
        methods: {
            getGoodsList(flag) {
                this.loading = true;
                let param = {
                    page: this.page,
                    pageSize: this.pageSize,
                    sort: this.sortFlag ? 1 : -1,
                    priceLevel: this.priceChecked
                };
                axios.get("/goods/list", {
                    params: param
                }).then(result => {
                    this.loading = false;
                    let res = result.data;
                    if (res.status === "0") {
                        if (flag) {
                            this.goodsList = this.goodsList.concat(res.result.list);
                            if (res.result.count < this.pageSize) {
                                this.busy = true;
                            } else {
                                this.busy = false;
                            }
                        } else {
                            this.goodsList = res.result.list;
                            if (res.result.count < this.pageSize) {
                                this.busy = true;
                            } else {
                                this.busy = false;
                            }
                        }
                    } else {
                        this.goodsList = [];
                    }

                });
            },
            addCart(productId) {
                axios.post("/goods/addCart", {
                    productId: productId
                }).then((res) => {
                    if (res.status == 0) {
                        this.mdShowCart=true;
                    } else {
                        this.mdShow1 = true;
                    }
                })
            },
            closeModal() {
                this.mdShow1 = false;
            },
            sortGoods() {
                this.sortFlag = !this.sortFlag;
                this.page = 1;
                this.getGoodsList();
            },
            loadMore() {
                this.busy = true;

                //这里为什么要用setTimeout，因为这样可以在第一个请求成功之后再去请求第二个，防抖动
                setTimeout(() => {
                    this.page++;
                    this.getGoodsList(true);//这里的true表示需要累加第二次加载出来的数据，即第一次和第二次的合集
                }, 500);
            },
            showFilterPop() {
                this.filterBy = true;
                this.overLayFlag = true;
            },
            closePop() {
                this.filterBy = false;
                this.overLayFlag = false;
            },
            setPriceFilter(index) {
                this.priceChecked = index;
                this.page = 1;
                this.closePop();
                this.getGoodsList();
            },
            setPriceFilterAll() {
                this.priceChecked = 'all';
                this.page = 1;
                this.closePop();
                this.getGoodsList();
            }
        }

    };
</script>
