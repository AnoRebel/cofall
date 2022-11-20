import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from "@/App.vue";
import router from "@/router";
import AppLink from "@/components/AppLink.vue";

const piniaPersistence = ({ store }) => {
  const name = store.$id;
  if (sessionStorage.getItem(name)) {
    store.$patch(JSON.parse(sessionStorage.getItem(name)));
    // Quickfix
    store.search.date = new Date(store.search.date);
    store.loading = false;
    store.splashLoading = false;
    store.searchLoading = false;
    // store.$patch(localForage.getItem(name));
  }
  store.$subscribe((mutation, state) => {
    // localForage.setItem(name, state);
    sessionStorage.setItem(name, JSON.stringify(state));
  });
};
const piniaLogger = ({ store }) => {
  store.$subscribe((mutation, state) => {
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
  locale: "sw",
  fallbackLocale: "en",
  messages,
});

const app = createApp(App);
const pinia = createPinia();

pinia.use(piniaLogger);
pinia.use(piniaPersistence);
// Adding Router to store for easy routing
pinia.use(({ store }) => {
  store.router = markRaw(router);
});

app.component("AppLink", AppLink);
app.use(pinia);
app.use(router);

router.isReady().then(() => app.mount("#app"));
