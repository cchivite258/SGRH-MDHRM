<script lang="ts" setup>
import { breadcrumb } from "@/components/advanceUI/Swiper/utils";
import SwiperSlider from "@/components/advanceUI/Swiper/index.vue";
</script>
<template>
  <Breadcrumb title="Swiper slider" :items="breadcrumb" />
  <SwiperSlider />
</template>