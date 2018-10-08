// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import Vuex from 'vuex'
import VueLazyload from 'vue-lazyload'
import infiniteScroll from 'vue-infinite-scroll'
import {currency} from './util/currency'
import ElementUI from "element-ui"

import './assets/css/base.css'
import './assets/css/checkout.css'
import './assets/css/login.css'
import './assets/css/product.css'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(infiniteScroll);
Vue.use(Vuex);
Vue.use(VueLazyload, {
    loading: 'static/loading-svg/loading-bars.svg',
    try: 3 // default 1
})

Vue.use(ElementUI);
Vue.filter("currency", currency);//注册全局过滤器
Vue.config.productionTip = false;//设置为false，以阻止vue在启动时生成生产提示

const store = new Vuex.Store({
    state: {
        nickName: '',
        cartCount: 0
    },
    mutations: {
        //更新用户信息
        updateUserInfo(state, nickName) {
            state.nickName = nickName;
        },
        updateCartCount(state, cartCount) {
            state.cartCount += cartCount;
        }
    }
});
/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    mounted() {
        this.checkLogin();
        this.getCartCount();
    },
    methods: {
        checkLogin() {
            axios.get("users/checkLogin").then(response => {
                let res = response.data;
                if (res.status === "0") {
                    this.$store.commit("updateUserInfo", res.result);
                } else {
                    if (this.$route.path !== "/goods") {
                        this.$router.push("/goods");
                    }
                }
            });
        },
        getCartCount() {
            axios.get("users/getCartCount").then(response => {
                let res = response.data;
                if (res.status === "0") {
                    this.$store.commit("updateCartCount", res.result);
                }
            });
        }
    },
    template: '<App/>',
    //render: h => h(App),
    components: {App}
});//.$mount('#app')
