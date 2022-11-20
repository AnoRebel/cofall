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

    <!-- about-style-two -->
    <section class="about-style-two bg-darker" style="background-image: url(/images/bg.jpeg)">
      <div class="pattern-layer" style="background-image: url(/images/shape/shape-2.png)"></div>
      <div class="auto-container">
        <div class="row clearfix">
          <div class="col-lg-6 col-md-12 col-sm-12 content-column">
            <div class="content_block_1">
              <div class="content-box">
                <div class="sec-title">
                  <p class="text-danger">{{ t("about.title") }}</p>
                  <h2 class="text-white">{{ t("about.subtitle") }}</h2>
                </div>
                <div class="text">
                  <p class="text-white">
                    {{ t("about.content") }}
                  </p>
                </div>
                <div class="btn-box">
                  <AppLink :to="{ name: 'Home' }" class="theme-btn btn-anim">
                    {{ t("about.button") }}
                  </AppLink>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6 col-md-6 col-sm-12 image-column">
            <div class="image_block_2">
              <div class="image-box">
                <div class="shape">
                  <div
                    class="shape-1"
                    style="background-image: url(/images/shape/shape-13.png)"
                  ></div>
                  <div
                    class="shape-2"
                    style="background-image: url(/images/shape/shape-12.png)"
                  ></div>
                  <div
                    class="shape-3"
                    style="background-image: url(/images/shape/shape-12.png)"
                  ></div>
                </div>
                <figure class="image">
                  <img src="/images/resource/about.webp" alt="About Image" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- about-style-two end -->

    <!-- main-footer -->
    <Footer />
    <!-- main-footer end -->

    <!--Scroll to top-->
    <ScrollToTop />
  </div>
</template>
