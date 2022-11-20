<!-- eslint-disable vue/multi-word-component-names -->
<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <footer class="main-footer bg-theme">
    <div class="footer-top">
      <!-- <div class="vector-bg" style="background-image: url(/images/shape/shape-11.png)"></div> -->
      <div class="auto-container">
        <div class="row clearfix">
          <div class="col-lg-4 col-md-6 col-sm-12 footer-column">
            <div class="footer-widget logo-widget">
              <figure class="footer-logo">
                <AppLink :to="{ name: 'Home' }">
                  <img src="/images/logo.png" class="footer-logo" alt="Logo" />
                </AppLink>
              </figure>
              <div class="text">
                <p class="text-white">
                  {{ t("footer.excerpt") }}
                </p>
              </div>
              <ul class="social-links clearfix">
                <li>
                  <AppLink :to="{ name: 'Home' }" class="btn-anim">
                    <i class="fab fa-facebook-f"></i>
                  </AppLink>
                </li>
                <li>
                  <AppLink :to="{ name: 'Home' }" class="btn-anim">
                    <i class="fab fa-twitter"></i>
                  </AppLink>
                </li>
                <li>
                  <AppLink :to="{ name: 'Home' }" class="btn-anim">
                    <i class="fab fa-instagram"></i>
                  </AppLink>
                </li>
                <li>
                  <AppLink :to="{ name: 'Home' }" class="btn-anim">
                    <i class="fab fa-google-plus-g"></i>
                  </AppLink>
                </li>
                <li>
                  <AppLink :to="{ name: 'Home' }" class="btn-anim">
                    <i class="fab fa-linkedin-in"></i>
                  </AppLink>
                </li>
              </ul>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 col-sm-12 footer-column">
            <div class="footer-widget links-widget">
              <div class="widget-title">
                <h3>{{ t("footer.services.title") }}</h3>
              </div>
              <div class="widget-content">
                <ul class="links-list clearfix text-white">
                  <li>
                    <AppLink :to="{ name: 'About' }" class="link-theme">{{
                      t("footer.services.about")
                    }}</AppLink>
                  </li>
                  <li>
                    <AppLink :to="{ name: 'Home' }" class="link-theme">{{
                      t("footer.services.how")
                    }}</AppLink>
                  </li>
                  <li>
                    <AppLink :to="{ name: 'Contact' }" class="link-theme">{{
                      t("footer.services.contact")
                    }}</AppLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 col-sm-12 footer-column">
            <div class="footer-widget contact-widget text-white">
              <div class="widget-title">
                <h3>{{ t("footer.contacts") }}</h3>
              </div>
              <div class="widget-content">
                <ul class="info-list clearfix">
                  <li class="text-white cursor-default">
                    <i class="fas fa-map-marker-alt text-white"></i>Dar es Salaam, Tanzania
                  </li>
                  <li>
                    <i class="fas fa-microphone text-white"></i>
                    <AppLink to="tel:255123456789" class="link-theme">+255123456789</AppLink>
                  </li>
                  <li>
                    <i class="fas fa-envelope text-white"></i>
                    <AppLink to="mailto:info@yakobus.co.tz" class="link-theme">
                      info@yakobus.co.tz
                    </AppLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer-bottom bg-theme border-top border-light">
      <div class="auto-container">
        <div class="bottom-inner clearfix">
          <div class="copyright pull-left">
            <p class="text-white">
              <AppLink :to="{ name: 'Home' }" class="link-theme">YakoBus</AppLink> &copy;
              {{ t("footer.powered") }}
              Rahisi Solution Ltd
            </p>
          </div>
          <ul class="footer-nav pull-right">
            <li>
              <AppLink :to="{ name: 'Terms' }" class="link-theme">{{ t("footer.terms") }}</AppLink>
            </li>
            <li>
              <AppLink :to="{ name: 'PrivacyPolicy' }" class="link-theme">
                {{ t("footer.policy") }}
              </AppLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.footer-logo {
  height: 5rem;
  /*width: 14rem;*/
}
</style>
