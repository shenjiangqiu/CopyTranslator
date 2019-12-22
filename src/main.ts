import Vue from "vue";
import router from "./router";
import store from "./store";
import { ipcRenderer } from "electron";
import { MessageType } from "./tools/enums";

import {
  Button,
  Select,
  Switch,
  Tooltip,
  Row,
  Col,
  Tabs,
  TabPane,
  Option,
  Input
} from "element-ui";
import "normalize.css/normalize.css";
import "../theme/index.css";
import App from "./App.vue";
import { constants, versionString } from "./core/constant";
import { IProxy } from "./core/iproxy";
import { createService } from "./tools/create";
import { authorizeKey } from "./tools/types";

const proxy = createService<IProxy>(authorizeKey);

Vue.use(Button);
Vue.use(Select);
Vue.use(Tooltip);
Vue.use(Switch);
Vue.use(Col);
Vue.use(Row);
Vue.use(Tabs);
Vue.use(TabPane);
Vue.use(Option);
Vue.use(Input);

const remote = require("electron").remote;
const controller = remote.getGlobal("controller");

Vue.prototype.$t = controller.getT();
Vue.prototype.$proxy = proxy;

new Vue({
  router,
  store,
  render: h => h(App),
  created: function() {
    ipcRenderer.setMaxListeners(100);
    ipcRenderer.on(
      MessageType.TranslateResult.toString(),
      (event: any, arg: any) => {
        store.commit("setShared", arg);
        if (arg.notify && arg.result.length > 0) {
          new Notification(constants.appName + " " + versionString, {
            body: arg.result
          });
        }
      }
    );
    ipcRenderer.on(
      MessageType.DictResult.toString(),
      (event: any, arg: any) => {
        store.commit("setDictResult", arg);
      }
    );
    ipcRenderer.on(MessageType.UpdateT.toString(), (event: any, arg: any) => {
      Vue.prototype.$t = controller.getT();
    });
    proxy.checkSync();
  }
}).$mount("#app");
