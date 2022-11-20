<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useBookingStore } from "@/stores/booking";

const booking = useBookingStore();
const { t, locale, availableLocales } = useI18n();
const isTop = ref(true);

const toggleTop = () => {
  let top = window.scrollY;
  if (top >= 110) {
    isTop.value = false;
  } else {
    isTop.value = true;
  }
};
onMounted(() => {
  window.addEventListener("scroll", toggleTop);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", toggleTop);
});

const toggleLocale = lang => {
  locale.value = lang;
  sessionStorage.setItem("language", lang);
};
</script>

<template>
  <header class="main-header style-one" :class="{ 'fixed-header': !isTop }">
    <!-- header-lower -->
    <div class="header-lower">
      <div class="auto-container">
        <div class="outer-box">
          <div class="logo-box">
            <figure class="logo">
              <AppLink :to="{ name: 'Home' }">
                <img src="/images/logo.png" class="nav-logo" alt="Logo" />
              </AppLink>
            </figure>
          </div>
          <div class="menu-area clearfix">
            <!--Mobile Navigation Toggler-->
            <div class="mobile-nav-toggler">
              <i class="icon-bar"></i>
              <i class="icon-bar"></i>
              <i class="icon-bar"></i>
            </div>
            <nav class="main-menu navbar-expand-md navbar-light">
              <div class="collapse navbar-collapse show clearfix" id="navbarSupportedContent">
                <ul class="navigation clearfix">
                  <li>
                    <AppLink :to="{ name: 'About' }">{{ t("links.about") }}</AppLink>
                  </li>
                  <li>
                    <AppLink :to="{ name: 'Faq' }">{{ t("links.faq") }}</AppLink>
                  </li>
                  <li>
                    <AppLink :to="{ name: 'Contact' }">{{ t("links.contact") }}</AppLink>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <ul class="menu-right-content clearfix">
            <li class="search-box-outer">
              <div class="dropdown">
                <button
                  class="search-box-btn"
                  type="button"
                  id="searchTicket"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i class="far fa-search"></i>
                </button>
                <div class="dropdown-menu search-panel" aria-labelledby="searchTicket">
                  <div class="form-container">
                    <form @submit.prevent="booking.searchAndGo()">
                      <div class="form-group">
                        <input
                          v-model="booking.ticket"
                          type="search"
                          name="search-field"
                          placeholder="Search Ticket..."
                          required
                        />
                        <button type="submit" class="search-btn">
                          <span class="fas fa-search"></span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </li>
            <li class="nav-item dropdown">
              <a
                class="mb-3 mx-3 dropdown-toggle shadow"
                data-toggle="dropdown"
                href="#"
                role="button"
                aria-expanded="false"
              >
                <i class="fas fa-globe text-white"></i>
              </a>
              <div class="dropdown-menu mt-2 bg-darker">
                <a
                  v-for="loc in availableLocales"
                  :key="loc"
                  :href="`#${loc}`"
                  class="dropdown-item text-white"
                  @click="toggleLocale(loc)"
                >
                  <img :src="`/images/${loc}.png`" height="20" width="20" />
                  {{ loc == "sw" ? t("languages.swahili") : t("languages.english") }}
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!--sticky Header-->
    <div class="sticky-header bg-theme">
      <div class="auto-container">
        <div class="outer-box">
          <div class="logo-box">
            <figure class="logo">
              <AppLink :to="{ name: 'Home' }">
                <img src="/images/logo.png" alt="Logo" />
              </AppLink>
            </figure>
          </div>
          <div class="menu-area">
            <nav class="main-menu clearfix">
              <!--Keep This Empty / Menu will come through Javascript-->
              <div class="collapse navbar-collapse show clearfix" id="navbarSupportedContent">
                <ul class="navigation clearfix">
                  <li>
                    <AppLink :to="{ name: 'About' }">{{ t("links.about") }}</AppLink>
                  </li>
                  <li>
                    <AppLink :to="{ name: 'Faq' }">{{ t("links.faq") }}</AppLink>
                  </li>
                  <li>
                    <AppLink :to="{ name: 'Contact' }">{{ t("links.contact") }}</AppLink>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <ul class="menu-right-content clearfix">
            <li class="search-box-outer">
              <div class="dropdown">
                <button
                  class="search-box-btn"
                  type="button"
                  id="searchTicket"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i class="far fa-search"></i>
                </button>
                <div class="dropdown-menu search-panel" aria-labelledby="searchTicket">
                  <div class="form-container">
                    <form @submit.prevent="booking.searchAndGo()">
                      <div class="form-group">
                        <input
                          v-model="booking.ticket"
                          type="search"
                          name="search-field"
                          placeholder="Search Ticket..."
                          required
                        />
                        <button type="submit" class="search-btn">
                          <span class="fas fa-search"></span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </li>
            <li class="nav-item dropdown">
              <a
                class="mb-3 mx-3 dropdown-toggle shadow"
                data-toggle="dropdown"
                href="#"
                role="button"
                aria-expanded="false"
              >
                <i class="fas fa-globe text-white"></i>
              </a>
              <div class="dropdown-menu mt-2 bg-darker">
                <a
                  v-for="loc in availableLocales"
                  :key="loc"
                  :href="`#${loc}`"
                  class="dropdown-item text-white"
                  @click="toggleLocale(loc)"
                >
                  <img :src="`/images/${loc}.png`" height="20" width="20" />
                  {{ loc == "sw" ? t("languages.swahili") : t("languages.english") }}
                </a>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.logo-box {
  padding: 0 !important;
}
.nav-logo {
  height: 100%;
  // height: 3rem;
  width: 100%;
  /*width: 5rem !important;*/
}
.nav-link {
  padding: 0.9rem 1.25rem;
  color: #090909;
  background-color: #eeeeee;
  border-radius: 0.25rem;
  margin: 0 1rem;

  &:hover {
    background-color: #8f2323;
    color: #eeeeee;
  }
}
.dropdown-item {
  &:hover {
    background-color: #8f2323;
    color: #eeeeee;
  }
  & > img {
    height: 24px;
    margin-right: 1rem;
  }
}
</style>
