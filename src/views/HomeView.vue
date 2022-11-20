<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { PreLoader, Header, MobileMenu, Footer, ScrollToTop } from "@/components";

const { t } = useI18n();

onMounted(() => {
  $(".three-item-carousel").owlCarousel({
    loop: true,
    margin: 30,
    nav: true,
    smartSpeed: 1000,
    autoplay: 500,
    navText: [
      '<span class="far fa-long-arrow-alt-left"></span>',
      '<span class="far fa-long-arrow-alt-right"></span>',
    ],
    responsive: {
      0: {
        items: 1,
      },
      480: {
        items: 1,
      },
      600: {
        items: 2,
      },
      800: {
        items: 2,
      },
      1024: {
        items: 3,
      },
    },
  });

  const wow = new WOW({
    mobile: false,
  });
  wow.init();
});
</script>

<template>
  <main>
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

      <!-- banner-section -->
      <section
        class="banner-section px-1 px-md-9 px-lg-12"
        style="background-image: url(/images/bg.jpeg)"
      >
        <div class="pattern-layer" style="background-image: url(/images/shape/shape-1.png)"></div>
        <router-view v-slot="{ Component, route }" :key="$route.path">
          <!-- Use any custom transition and fallback to `fade` -->
          <transition :name="route.meta.transition || 'slide'" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </section>
      <!-- banner-section end -->

      <!-- feature-section -->
      <section class="feature-section centred bg-color-1 sec-pad">
        <div class="auto-container">
          <div class="sec-title text-center">
            <p>How To Use</p>
            <h2>It's that easy</h2>
          </div>
          <div class="row clearfix">
            <div class="col-lg-3 col-md-6 col-sm-12 feature-block">
              <div
                class="feature-block-one wow fadeInUp animated"
                data-wow-delay="00ms"
                data-wow-duration="1500ms"
              >
                <div class="inner-box">
                  <figure class="image-box">
                    <img src="/images/resource/feature-1.jpeg" alt="Search Destination" />
                  </figure>
                  <div class="lower-content">
                    <div class="icon-box"><i class="icon-1"></i></div>
                    <h4>Search Destination</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-12 feature-block">
              <div
                class="feature-block-one wow fadeInUp animated"
                data-wow-delay="200ms"
                data-wow-duration="1500ms"
              >
                <div class="inner-box">
                  <figure class="image-box">
                    <img src="/images/resource/feature-2.jpeg" alt="Select From Available Routes" />
                  </figure>
                  <div class="lower-content">
                    <div class="icon-box"><i class="icon-2"></i></div>
                    <h4>Select From Available Routes</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-12 feature-block">
              <div
                class="feature-block-one wow fadeInUp animated"
                data-wow-delay="400ms"
                data-wow-duration="1500ms"
              >
                <div class="inner-box">
                  <figure class="image-box">
                    <img src="/images/resource/feature-3.jpeg" alt="" />
                  </figure>
                  <div class="lower-content">
                    <div class="icon-box"><i class="icon-3"></i></div>
                    <h4>Enter Personal Details</h4>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-lg-3 col-md-6 col-sm-12 feature-block">
              <div
                class="feature-block-one wow fadeInUp animated"
                data-wow-delay="600ms"
                data-wow-duration="1500ms"
              >
                <div class="inner-box">
                  <figure class="image-box">
                    <img src="/images/resource/feature-4.jpg" alt="" />
                  </figure>
                  <div class="lower-content">
                    <div class="icon-box"><i class="icon-4"></i></div>
                    <h4>Pay and Get Ticket</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- feature-section end -->

      <!-- team-section -->
      <section class="team-section sec-pad bg-color-1 centred">
        <div class="auto-container">
          <div class="sec-title text-center">
            <p>Companies Available</p>
            <h2>You can book from a variety of buses</h2>
          </div>
          <div class="three-item-carousel owl-carousel owl-theme owl-dots-none owl-nav-none">
            <div class="team-block-one">
              <div class="inner-box">
                <figure class="image-box">
                  <img src="/images/logo_alt.png" alt="Company Logo" />
                </figure>
                <div class="lower-content">
                  <h3><AppLink :to="{ name: 'About' }">Company Name</AppLink></h3>
                  <span class="designation">4 Buses</span>
                  <ul class="social-links clearfix">
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-facebook-f"></i></AppLink>
                    </li>
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-twitter"></i></AppLink>
                    </li>
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-instagram"></i></AppLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="team-block-one">
              <div class="inner-box">
                <figure class="image-box">
                  <img src="/images/logo_alt.png" alt="Company Logo" />
                </figure>
                <div class="lower-content">
                  <h3><AppLink :to="{ name: 'About' }">Company Name</AppLink></h3>
                  <span class="designation">1 Bus</span>
                  <ul class="social-links clearfix">
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-facebook-f"></i></AppLink>
                    </li>
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-twitter"></i></AppLink>
                    </li>
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-instagram"></i></AppLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div class="team-block-one">
              <div class="inner-box">
                <figure class="image-box">
                  <img src="/images/logo_alt.png" alt="Company Logo" />
                </figure>
                <div class="lower-content">
                  <h3><AppLink :to="{ name: 'About' }">Company Name</AppLink></h3>
                  <span class="designation">2 Buses</span>
                  <ul class="social-links clearfix">
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-facebook-f"></i></AppLink>
                    </li>
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-twitter"></i></AppLink>
                    </li>
                    <li>
                      <AppLink :to="{ name: 'Home' }"><i class="fab fa-instagram"></i></AppLink>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <!-- team-section end -->

      <!-- main-footer -->
      <Footer />
      <!-- main-footer end -->

      <!--Scroll to top-->
      <ScrollToTop />
    </div>
  </main>
</template>

<style lang="scss">
@media (min-width: 768px) {
  .px-md-9 {
    padding-left: 6rem !important;
    padding-right: 6rem !important;
  }
}
@media (min-width: 992) {
  .px-lg-12 {
    padding-left: 9rem !important;
    padding-right: 9rem !important;
  }
}
</style>
