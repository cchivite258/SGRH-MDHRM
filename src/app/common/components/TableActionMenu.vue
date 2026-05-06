<script lang="ts" setup>
import ListMenuWithIcon from "@/app/common/components/ListMenuWithIcon.vue";
import type { OptionType } from "@/app/common/types/option.type";
import { computed } from "vue";

const emit = defineEmits(["onView", "onEdit", "onDelete", "onSelect"]);

const defaultOptions: OptionType[] = [
  { title: "Ver", value: "view", icon: "ph-eye" },
  { title: "Editar", value: "edit", icon: "ph-pencil-simple" },
  { title: "Eliminar", value: "delete", icon: "ph-trash" }
];

const props = withDefaults(
  defineProps<{
    menuItems?: OptionType[];
  }>(),
  {
    menuItems: undefined,
  }
);

const options = computed(() => props.menuItems ?? defaultOptions);

const onSelect = (option: string) => {
  emit("onSelect", option);

  switch (option) {
    case "view":
      emit("onView");
      break;
    case "edit":
      emit("onEdit");
      break;
    case "delete":
      emit("onDelete");
      break;
  }
};
</script>

<template>
  <ListMenuWithIcon align="center" :menuItems="options" @onSelect="onSelect" />
</template>
