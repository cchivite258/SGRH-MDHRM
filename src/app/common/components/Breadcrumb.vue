<script lang="ts" setup>
import { type PropType } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { useRouter } from "vue-router";

const router = useRouter();

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

const onBreadcrumbClick = (item: Pick<BreadcrumbType, "disabled" | "to">) => {
  if (!item.disabled && !item.to) {
    router.back();
  }
};
</script>
<template>
  <div class="d-flex justify-space-between align-center">
    <h2 class="text-subtitle-1 text-uppercase font-weight-bold">
      {{ $t(`t-${title}`) }}
    </h2>
    <v-breadcrumbs :items="items" class="breadcrumb-wrapper">
      <template #item="{ item }">
        <v-breadcrumbs-item
          :disabled="item.disabled"
          :to="item.to"
          @click="onBreadcrumbClick(item)"
        >
          {{ $t(`t-${item.title}`) }}
        </v-breadcrumbs-item>
      </template>
      <template #divider>
        <v-icon icon="ph-caret-right ph-sm"></v-icon>
      </template>
    </v-breadcrumbs>
  </div>
</template>
