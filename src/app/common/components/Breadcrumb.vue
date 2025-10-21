<script lang="ts" setup>
import { type PropType } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";

const prop = defineProps({
  title: {
    type: String,
    default: ""
  },
  items: {
    type: Array as PropType<BreadcrumbType[]>,
    default: () => []
  }
});
</script>
<template>
  <div class="d-flex justify-space-between align-center">
    <h2 class="text-subtitle-1 text-uppercase font-weight-bold">
      {{ $t(`t-${title}`) }}
    </h2>
    <v-breadcrumbs :items="items" class="breadcrumb-wrapper">
      <template v-slot:title="{ item }">
        <span class="">{{ $t(`t-${item.title}`) }}</span>
      </template>
      <template #divider>
        <v-icon icon="ph-caret-right ph-sm"></v-icon>
      </template>
    </v-breadcrumbs>
  </div>
</template>
