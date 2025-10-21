<script lang="ts" setup>
import { ref } from "vue";
import { type PropType } from "vue";

const prop = defineProps({
  icon: {
    type: String,
    default: "ph-dots-three-vertical ph-lg",
  },
  isIcon: {
    type: Boolean,
    default: false,
  },
  isSortBy: {
    type: Boolean,
    default: false,
  },
  listItems: {
    type: Array as PropType<any[]>,
    default: () => [],
  },
  variant: {
    type: String as PropType<
      "text" | "flat" | "elevated" | "tonal" | "outlined" | "plain"
    >,
    default: "text",
  },
  isRounded: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    default: "",
  },
});

const selectedOption = ref(prop.listItems?.[0] || "");
const onOptionClick = (value: string) => {
  selectedOption.value = value;
};
</script>
<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-if="isIcon"
        v-bind="props"
        :rounded="isRounded"
        icon
        :variant="variant"
        density="comfortable"
      >
        <i :class="prop.icon" class=""></i>
      </v-btn>
      <v-btn
        v-else
        :variant="variant"
        v-bind="props"
        class="nav-link menu-link list-menu-btn"
        :class="class"
      >
        <span v-if="isSortBy" class="font-weight-bold text-uppercase">
          Sort By:
        </span>
        <div
          :class="variant === 'outlined' ? '' : 'text-muted'"
          class="px-2 d-flex align-center justify-space-between"
        >
          <span>{{ selectedOption }}</span>
          <i class="ph-caret-down"></i>
        </div>
      </v-btn>
    </template>
    <v-list density="compact" :lines="false" color="primary" min-width="140" max-width="150">
      <v-list-item
        v-for="(listItem, index) in listItems"
        :key="'list-item-' + index"
        height="28"
        min-height="28"
        @click="onOptionClick(listItem)"
        >{{ listItem }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>
