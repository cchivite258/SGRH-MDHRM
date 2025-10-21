<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import AddCategoryDialog from "@/components/learning/courses/category/AddCategoryDialog.vue";
import { CategoryType } from "@/components/learning/courses/category/types";

const emit = defineEmits(["update:modelValue", "onCreate"]);
const prop = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const dialog = ref<boolean>(false);

const query = computed({
  get() {
    return prop.modelValue || "";
  },
  set(updatedQuery: string) {
    emit("update:modelValue", updatedQuery);
  },
});

const onCreate = (data: CategoryType) => {
  emit("onCreate", data);
  dialog.value = false;
};
</script>
<template>
  <v-row justify="space-between">
    <v-col cols="12" sm="9" lg="3">
      <QuerySearch
        v-model="query"
        placeholder="Search for category or something..."
      />
    </v-col>
    <v-col cols="12" sm="3" lg="3" class="text-end">
      <v-btn color="secondary" @click="dialog = true">
        <i class="ph-plus-circle" /> Add category
      </v-btn>
    </v-col>
  </v-row>

  <AddCategoryDialog v-if="dialog" v-model="dialog" @onCreate="onCreate" />
</template>
