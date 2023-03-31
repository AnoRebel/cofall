import { createApp, markRaw } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import messages from "@intlify/unplugin-vue-i18n/messages";

import App from "@/App.vue";
import router from "@/router";
import AppLink from "@/components/AppLink.vue";
import { createTheme, Theme } from "@/composables/theme";

// const piniaPersistence = ({ store }) => {
//   const name = store.$id;
//   if (sessionStorage.getItem(name)) {
//     store.$patch(JSON.parse(sessionStorage.getItem(name)));
//     // store.$patch(localForage.getItem(name));
//   }
//   store.$subscribe((_, state) => {
//     // localForage.setItem(name, state);
//     sessionStorage.setItem(name, JSON.stringify(state));
//   });
// };
const piniaLogger = ({ store }) => {
  store.$subscribe((mutation, _) => {
    const mut = `{ "store": ${mutation.storeId}, "type": ${mutation.type}, "payload": ${mutation.payload} }`;
    console.log(JSON.parse(JSON.stringify(mut)));
  });
  store.$onAction(action => {
    const act = `{ "store": ${action.store.$id}, "action": ${action.name}, "payload": ${action.args} }`;
    console.log(JSON.parse(JSON.stringify(act)));
  });
};

const i18n = createI18n({
  legacy: false,
  locale: "en",
  fallbackLocale: "en",
  messages,
});

const app = createApp(App);
const pinia = createPinia();
const theme = createTheme(Theme.Dark);

pinia.use(piniaLogger);
// pinia.use(piniaPersistence);
// Adding Router to store for easy routing
pinia.use(({ store }) => {
  store.router = markRaw(router);
});

app.component("AppLink", AppLink);
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(theme);

router.isReady().then(() => app.mount("#app"));
