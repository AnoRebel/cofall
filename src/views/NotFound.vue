<script setup>
import { useI18n } from "vue-i18n";
import { PreLoader, Header, MobileMenu, Footer, ScrollToTop } from "@/components";

const { t } = useI18n();
</script>

<template>
  <div class="boxed_wrapper">
    <!-- preloader -->
    <PreLoader />
    <!-- preloader end -->

    <!-- main header -->
    <Header />
    <!-- main-header end -->

    <!-- Mobile Menu  -->
    <MobileMenu />
    <!-- End Mobile Menu -->

    <!-- error-section -->
    <section class="error-section centred bg-darker" style="background-image: url(/images/bg.jpeg)">
      <div class="auto-container">
        <div class="inner-box">
          <h1 class="text-white">404</h1>
          <h2 class="text-white">
            {{ t("not_found.pre") }}
            <code class="text-theme p-1 border rounded">{{ $route.path }}</code>
            {{ t("not_found.post") }} <br />{{ t("not_found.text") }}
          </h2>
          <AppLink :to="{ name: 'Home' }" class="theme-btn">{{ t("not_found.goback") }}</AppLink>
        </div>
      </div>
    </section>
    <!-- error-section end -->

    <!-- main-footer -->
    <Footer />
    <!-- main-footer end -->

    <!--Scroll to top-->
    <ScrollToTop />
  </div>
</template>
