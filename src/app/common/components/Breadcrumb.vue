<script lang="ts" setup>
import { type PropType } from "vue";
import { BreadcrumbType } from "@/app/common/types/breadcrumb.type";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t, te } = useI18n();

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

const translateLabel = (value: string) => {
  if (!value) return "";
  if (te(value)) return t(value);

  const prefixedKey = `t-${value}`;
  return te(prefixedKey) ? t(prefixedKey) : value;
};
</script>
<template>
  <div class="d-flex align-center" :class="title ? 'justify-space-between' : 'justify-end'">
    <h2 v-if="title" class="text-subtitle-1 text-uppercase font-weight-bold">
      {{ translateLabel(title) }}
    </h2>
    <v-breadcrumbs :items="items" class="breadcrumb-wrapper">
      <template #item="{ item }">
        <v-breadcrumbs-item
          :disabled="item.disabled"
          :to="item.to"
          @click="onBreadcrumbClick(item)"
        >
          {{ translateLabel(item.title) }}
        </v-breadcrumbs-item>
      </template>
      <template #divider>
        <v-icon icon="ph-caret-right ph-sm"></v-icon>
      </template>
    </v-breadcrumbs>
  </div>
</template>
