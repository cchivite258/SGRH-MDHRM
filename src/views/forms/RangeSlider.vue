<script lang="ts" setup>
import { breadcrumb } from "@/components/forms/rangeSlider/utils";
import RangeSlider from "@/components/forms/rangeSlider/index.vue";
</script>
<template>
  <Breadcrumb title="Range Slider" :items="breadcrumb" />
  <RangeSlider />
</template>
