<script lang="ts" setup>
import { CountTo } from "vue3-count-to";

const prop = defineProps({
  endVal: {
    type: Number,
    default: 25500,
  },
  prefix: {
    type: String,
    default: "",
  },
  suffix: {
    type: String,
    default: "",
  },
  decimals: {
    type: Number,
    default: 0,
  },
});
</script>
<template>
  <CountTo
    :startVal="0"
    :duration="3000"
    :endVal="endVal"
    :prefix="prefix"
    :suffix="suffix"
    :decimals="decimals"
  />
</template>
