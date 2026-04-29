<script lang="ts" setup>
import { ref } from "vue";
import { OptionType } from "@/app/common/types/option.type";

const prop = withDefaults(
  defineProps<{
    icon: string;
    menuItems: OptionType[] | null;
    variant: "text" | "outlined" | "elevated" | "tonal" | "flat";
    color: string | undefined;
  }>(),
  {
    icon: "ph-dots-three-vertical ph-lg",
    menuItems: null,
    variant: "text",
    color: undefined,
  }
);

const emit = defineEmits(["onSelect"]);

const selectedOption = ref("");
const onOptionClick = (value: string) => {
  selectedOption.value = value;
  emit("onSelect", value);
};
</script>

<template>
  <v-menu :close-on-content-click="true">
    <template #activator="{ props }">
      <div class="d-flex justify-end">
        <v-btn density="compact" :variant="variant" v-bind="props" icon rounded :color="color" class="ml-auto">
          <i :class="prop.icon"></i>
        </v-btn>

      </div>

    </template>
    <v-list v-model="selectedOption" density="compact" width="190" :lines="false">
      <v-list-item v-for="option in menuItems" :key="'menu-item-' + option.value" class="list-menu-with-icon__item"
        :to="option.to" height="32" min-height="32" @click="onOptionClick(option.value)">
        <div class="list-menu-with-icon__content">
          <i class="text-muted list-menu-with-icon__item-icon" :class="option.icon"></i>
          <span class="list-menu-with-icon__item-title">{{ option.title }}</span>
        </div>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped>
.list-menu-with-icon__item {
  min-height: 32px !important;
  padding-inline: 12px;
}

.list-menu-with-icon__content {
  align-items: center;
  column-gap: 10px;
  display: flex;
  min-width: 0;
}

.list-menu-with-icon__item-icon {
  font-size: 14px;
  flex: 0 0 14px;
  line-height: 1;
}

.list-menu-with-icon__item-title {
  display: block;
  line-height: 1.2;
  white-space: nowrap;
}
</style>
