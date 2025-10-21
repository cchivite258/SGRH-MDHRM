import pinia from "@/store/index";
import vuetify from "@/plugins/vuetify";
import router from "@/router/index";

import type { App } from "vue";

export function registerPlugins(app: App) {
  app.use(router).use(pinia).use(vuetify);
}
