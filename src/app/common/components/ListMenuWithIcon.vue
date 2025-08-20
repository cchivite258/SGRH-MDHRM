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
    <v-list v-model="selectedOption" density="compact" width="150" :lines="false">
      <v-list-item v-for="option in menuItems" :key="'menu-item-' + option.value" class="d-flex align-center"
        :to="option.to" height="28" min-height="28" @click="onOptionClick(option.value)">
        <i class="text-muted mx-2" :class="option.icon"></i>
        <span>{{ option.title }} </span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
