<!-- eslint-disable no-undef -->
<script setup>
import { onMounted } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

onMounted(() => {
  //Mobile Nav Hide Show
  $(".mobile-menu .menu-box").mCustomScrollbar();

  //Dropdown Button
  $(".mobile-menu li.dropdown .dropdown-btn").on("click", function () {
    $(this).toggleClass("open");
    $(this).prev("ul").slideToggle(500);
  });
  //Dropdown Button
  $(".mobile-menu li.dropdown .dropdown-btn").on("click", function () {
    $(this).prev(".megamenu").slideToggle(900);
  });
  //Menu Toggle Btn
  $(".mobile-nav-toggler").on("click", () => {
    $("body").addClass("mobile-menu-visible");
  });

  //Menu Toggle Btn
  $(".mobile-menu .menu-backdrop,.mobile-menu .close-btn").on("click", () => {
    $("body").removeClass("mobile-menu-visible");
  });
});
</script>

<template>
  <div class="mobile-menu">
    <div class="menu-backdrop"></div>
    <div class="close-btn"><i class="fas fa-times"></i></div>

    <nav class="menu-box">
      <div class="nav-logo">
        <AppLink :to="{ name: 'Home' }">
          <img src="/images/logo.png" alt="Logo" title="Yako" />
        </AppLink>
      </div>
      <div class="menu-outer">
        <!--Here Menu Will Come Automatically Via Javascript / Same Menu as in Header-->
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
      </div>
      <div class="contact-info">
        <h4>{{ t("contact_info") }}</h4>
        <ul>
          <li>Dar es Salaam, Tanzania</li>
          <li><AppLink to="tel:+255123456789">+255123456789</AppLink></li>
          <li><AppLink to="mailto:info@yakobus.co.tz">info@yakobus.co.tz</AppLink></li>
        </ul>
      </div>
      <div class="social-links">
        <ul class="clearfix">
          <li>
            <AppLink :to="{ name: 'Home' }"><span class="fab fa-twitter"></span></AppLink>
          </li>
          <li>
            <AppLink :to="{ name: 'Home' }"><span class="fab fa-facebook-square"></span></AppLink>
          </li>
          <li>
            <AppLink :to="{ name: 'Home' }"><span class="fab fa-pinterest-p"></span></AppLink>
          </li>
          <li>
            <AppLink :to="{ name: 'Home' }"><span class="fab fa-instagram"></span></AppLink>
          </li>
          <li>
            <AppLink :to="{ name: 'Home' }"><span class="fab fa-youtube"></span></AppLink>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<style lang="scss">
.menu-box {
  background-color: #8f2323 !important;
}
.mobile-menu {
  & .navigation {
    &:last-child {
      border-bottom: 1px solid rgba($color: #090909, $alpha: 0.3) !important;
    }
    & li {
      border-top: 1px solid rgba($color: #090909, $alpha: 0.3) !important;
    }
  }
}
</style>
