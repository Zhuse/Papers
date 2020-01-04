import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.use(Vuetify);

const opts = {
    icons: {
        iconfont: 'mdiSvg'
    }
}
export default new Vuetify(opts);
