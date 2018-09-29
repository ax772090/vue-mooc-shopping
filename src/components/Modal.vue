<template>
    <div>
        <div class="md-modal modal-msg md-modal-transition" v-bind:class="{'md-show':mdShow}">
            <div class="md-modal-inner">
                <div class="md-top">
                    <button class="md-close" @click="closeModal">Close</button>
                </div>
                <div class="md--content">
                    <div class="confirm-tips">
                        <!--这里挖个槽，外面应用该modal的就可以往里面填东西-->
                        <slot name="message"></slot>
                    </div>
                    <div class="btn-wrap">
                        <slot name="btnGroup"></slot>
                    </div>
                </div>
            </div>
        </div>
        <div class="md-overlay" v-if="mdShow" @click="closeModal"></div>
    </div>
</template>

<script>
    export default {
        props: ['mdShow'],
        data() {
            return {
                msg: 'hello vue'
            }
        },
        methods: {
            closeModal() {
                //触发父组件的close事件
                this.$emit('close');
            }
        }
    }
</script>