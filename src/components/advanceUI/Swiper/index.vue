<script lang="ts" setup>
import { computed } from "vue";
import {
  Autoplay,
  Thumbs,
  Pagination,
  Navigation,
  EffectCoverflow,
  Mousewheel,
  Scrollbar,
  EffectFade,
  EffectFlip,
  EffectCreative,
} from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/mousewheel";
import "swiper/css/effect-fade";
import "swiper/css/effect-creative";
import "swiper/css/effect-flip";
import "swiper/css/effect-coverflow";

const coverflowModules = [EffectCoverflow, Pagination];
const scrollbarModules = [Scrollbar, Navigation, Pagination];
const mousewheelModules = [Mousewheel, Pagination];
const effectFadeModules = [EffectFade, Pagination];
const effectFlipModules = [EffectFlip, Pagination];

const pagination = computed(() => {
  return {
    clickable: true,
    el: ".swiper-pagination",
    renderBullet: function (index: any, className: any) {
      return "<span class=" + className + ">" + (index + 1) + "</span>";
    },
  };
});
</script>

<template>
  <v-row>
    <v-col xl="4" lg="6">
      <Card title="Default Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>default-swiper</code> class to set a default swiper.
          </p>
          <swiper
            class="default-swiper rounded"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :modules="[Autoplay]"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-1.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-2.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-3.jpg" />
            </swiper-slide>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Navigation & Pagination Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>navigation-swiper</code> class to set a swiper with navigation
            and pagination.
          </p>
          <swiper
            class="navigation-swiper rounded"
            :loop="true"
            :modules="[Autoplay, Navigation, Pagination]"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :navigation="{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }"
            :pagination="{ clickable: true, el: '.swiper-pagination' }"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-4.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-5.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-6.jpg" />
            </swiper-slide>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Pagination Dynamic Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>pagination-dynamic-swiper</code> class to set a dynamic swiper
            with pagination.
          </p>
          <swiper
            class="pagination-dynamic-swiper rounded"
            :loop="true"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{
              clickable: true,
              el: '.swiper-pagination',
              dynamicBullets: true,
            }"
            :modules="[Autoplay, Pagination]"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-7.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-8.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-9.jpg" />
            </swiper-slide>
            <div class="swiper-pagination dynamic-pagination"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Pagination Fraction Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>pagination-fraction-swiper</code> class to set a fraction
            swiper with pagination.
          </p>
          <swiper
            class="pagination-fraction-swiper"
            :loop="true"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{
              clickable: true,
              el: '.swiper-pagination',
              type: 'fraction',
            }"
            :navigation="{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }"
            :modules="[Autoplay, Navigation, Pagination]"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-10.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-11.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-12.jpg" />
            </swiper-slide>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination text-light"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Pagination Custom Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>pagination-custom-swiper</code> class to set a swiper with
            custom pagination.
          </p>
          <swiper
            class="pagination-custom-swiper rounded"
            :modules="[Autoplay, Pagination]"
            :loop="true"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="pagination"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-2.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-3.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-4.jpg" />
            </swiper-slide>
            <div class="swiper-pagination pagination-custom"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Pagination Progress Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>pagination-progress-swiper</code> class to set a swiper with
            progress pagination.
          </p>
          <swiper
            class="pagination-progress-swiper rounded"
            :modules="[Autoplay, Pagination]"
            :loop="true"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{ type: 'progressbar' }"
            :navigation="{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-5.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-6.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-7.jpg" />
            </swiper-slide>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-pagination"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Scrollbar Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>pagination-scrollbar-swiper</code> class to set a swiper with
            scrollbar pagination.
          </p>
          <swiper
            class="pagination-scrollbar-swiper rounded"
            :loop="true"
            :modules="scrollbarModules"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :scrollbar="{ el: '.swiper-scrollbar', hide: true }"
            :navigation="{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-8.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-9.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-10.jpg" />
            </swiper-slide>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-scrollbar"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col cols="12" xl="4" lg="6">
      <Card title="Vertical Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>vertical-swiper</code> class to set a vertical swiper.
          </p>
          <swiper
            class="vertical-swiper rounded"
            :loop="true"
            :direction="'vertical'"
            :modules="[Autoplay, Pagination]"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{ el: '.swiper-pagination', clickable: true }"
            style="height: 324px"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-11.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-12.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-1.jpg" />
            </swiper-slide>
            <div class="swiper-pagination"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Mousewheel Control Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>mousewheel-control-swiper</code> class to set a swiper with
            mousewheel scroll.
          </p>
          <swiper
            class="mousewheel-control-swiper rounded"
            :loop="true"
            :direction="'vertical'"
            :mousewheel="true"
            :modules="mousewheelModules"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{ el: '.swiper-pagination', clickable: true }"
            style="height: 324px"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-3.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-4.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-5.jpg" />
            </swiper-slide>
            <div class="swiper-pagination"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Effect Fade Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>effect-fade-swiper</code> class to set a swiper with fade
            effect.
          </p>
          <swiper
            class="effect-fade-swiper rounded"
            :loop="true"
            :effect="'fade'"
            :modules="effectFadeModules"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{ el: '.swiper-pagination', clickable: true }"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-6.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-7.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-8.jpg" />
            </swiper-slide>
            <div class="swiper-pagination"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Effect Creative Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>effect-creative-swiper</code> class to set a swiper with
            creative custom effect.
          </p>
          <swiper
            class="effect-creative-swiper rounded"
            :loop="true"
            :effect="'creative'"
            :grabCursor="true"
            :modules="[EffectCreative, Pagination]"
            :creativeEffect="{
              prev: {
                shadow: true,
                translate: [0, 0, -400],
              },
              next: {
                translate: ['100%', 0, 0],
              },
            }"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{ el: '.swiper-pagination', clickable: true }"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-9.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-10.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-11.jpg" />
            </swiper-slide>
            <div class="swiper-pagination"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col xl="4" lg="6">
      <Card title="Effect Flip Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>effect-flip-swiper</code> class to set a swiper with flip
            effect.
          </p>
          <swiper
            class="effect-flip-swiper rounded"
            :loop="true"
            :effect="'flip'"
            :modules="effectFlipModules"
            :grabCursor="true"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{ el: '.swiper-pagination', clickable: true }"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-12.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-1.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-2.jpg" />
            </swiper-slide>
            <div class="swiper-pagination"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col lg="12">
      <Card title="Effect Coverflow Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>effect-coverflow-swiper</code> class to set a swiper with
            coverflow effect.
          </p>
          <swiper
            class="effect-coverflow-swiper rounded pb-5"
            :loop="true"
            :effect="'coverflow'"
            :grabCursor="true"
            :centeredSlides="true"
            :slidesPerView="4"
            :modules="coverflowModules"
            :coverflowEffect="{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }"
            :autoplay="{ delay: 2500, disableOnInteraction: false }"
            :pagination="{
              el: '.swiper-pagination',
              clickable: true,
              dynamicBullets: true,
            }"
          >
            <swiper-slide>
              <v-img src="@/assets/images/small/img-4.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-5.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-6.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-7.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-8.jpg" />
            </swiper-slide>
            <swiper-slide>
              <v-img src="@/assets/images/small/img-9.jpg" />
            </swiper-slide>
            <div class="swiper-pagination swiper-pagination-dark"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>

    <v-col cols="12">
      <Card title="Responsive Breakpoints Swiper">
        <v-card-text>
          <p class="text-muted mb-2">
            Use
            <code>responsive-swiper</code> class to set a responsive swiper.
          </p>
          <swiper
            class="swiper responsive-swiper rounded gallery-light pb-4"
            :loop="true"
            :slidesPerView="1"
            :spaceBetween="10"
            :pagination="{ el: '.swiper-pagination', clickable: true }"
            :modules="[Pagination]"
            :breakpoints="{
              640: { slidesPerView: 2, spaceBetween: 20 },
              768: { slidesPerView: 3, spaceBetween: 40 },
              1200: { slidesPerView: 4, spaceBetween: 50 },
            }"
          >
            <swiper-slide>
              <v-card>
                <v-img
                  class="gallery-img img-fluid mx-auto"
                  src="@/assets/images/small/img-1.jpg"
                />
                <v-card-text>
                  <div class="text-subtitle-2">
                    Glasses and laptop from above
                  </div>
                  <div class="d-flex justify-space-between align-center">
                    <div><span class="text-muted">By</span> Ron Mackie</div>
                    <div>
                      <v-btn icon class="me-2">
                        <i class="ph-thumbs-up me-1" /> 2.2k</v-btn
                      >
                      <v-btn icon> <i class="ph-chat me-1" /> 1.3k</v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </swiper-slide>
            <swiper-slide>
              <v-card>
                <v-img
                  class="gallery-img img-fluid mx-auto"
                  src="@/assets/images/small/img-2.jpg"
                />
                <v-card-text>
                  <div class="text-subtitle-2">Working at a coffee shop</div>
                  <div class="d-flex justify-space-between align-center">
                    <div><span class="text-muted">By</span> Nancy Martino</div>
                    <div>
                      <v-btn icon class="me-2">
                        <i class="ph-thumbs-up me-1" /> 3.2K</v-btn
                      >
                      <v-btn icon> <i class="ph-chat me-1" /> 1.1K</v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </swiper-slide>
            <swiper-slide>
              <v-card>
                <v-img
                  class="gallery-img img-fluid mx-auto"
                  src="@/assets/images/small/img-10.jpg"
                />
                <v-card-text>
                  <div class="text-subtitle-2">Fun day at the Hill Station</div>
                  <div class="d-flex justify-space-between align-center">
                    <div><span class="text-muted">By</span> Henry Baird</div>
                    <div>
                      <v-btn icon class="me-2">
                        <i class="ph-thumbs-up me-1" /> 632</v-btn
                      >
                      <v-btn icon> <i class="ph-chat me-1" /> 95</v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </swiper-slide>
            <swiper-slide>
              <v-card>
                <v-img
                  class="gallery-img img-fluid mx-auto"
                  src="@/assets/images/small/img-4.jpg"
                />
                <v-card-text>
                  <div class="text-subtitle-2">Drawing a sketch</div>
                  <div class="d-flex justify-space-between align-center">
                    <div><span class="text-muted">By</span> Jason McQuaid</div>
                    <div>
                      <v-btn icon class="me-2">
                        <i class="ph-thumbs-up me-1" />825</v-btn
                      >
                      <v-btn icon> <i class="ph-chat me-1" /> 101</v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </swiper-slide>
            <swiper-slide>
              <v-card>
                <v-img
                  class="gallery-img img-fluid mx-auto"
                  src="@/assets/images/small/img-6.jpg"
                />
                <v-card-text>
                  <div class="text-subtitle-2">
                    Project discussion with team
                  </div>
                  <div class="d-flex justify-space-between align-center">
                    <div><span class="text-muted">By</span> Erica Kernan</div>
                    <div>
                      <v-btn icon class="me-2">
                        <i class="ph-thumbs-up me-1" /> 3.4K</v-btn
                      >
                      <v-btn icon> <i class="ph-chat me-1" /> 1.3k</v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </swiper-slide>
            <div class="swiper-pagination swiper-pagination-dark"></div>
          </swiper>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
