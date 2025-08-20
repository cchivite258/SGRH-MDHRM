<script lang="ts" setup>
import { computed, ref } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import FilterNavigationDrawer from "@/components/learning/courses/listView/FilterNavigationDrawer.vue";

const emit = defineEmits(["update:modelValue", "onCreate"]);
const prop = defineProps({
  modelValue: {
    type: Object,
    default: () => {},
  },
});

const query = computed({
  get() {
    return prop.modelValue.query || "";
  },
  set(updatedQuery: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      query: updatedQuery,
    });
  },
});

const onCreateClick = () => {
  emit("onCreate");
};
</script>
<template>
  <div class="d-md-flex align-center">
    <div style="width: 300px">
      <QuerySearch
        v-model="query"
        placeholder="Search for courses, price or something..."
      />
    </div>
    <v-btn class="ms-2" color="secondary" @click="onCreateClick">
      <i class="ph-plus-circle me-2" /> Add Course
    </v-btn>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <v-btn class="ms-2" color="info" v-bind="props">
          <i class="ph-funnel" /> Filter
        </v-btn>
      </template>
      <FilterNavigationDrawer />
    </v-menu>
    <v-hover>
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          class="ms-2"
          icon="ph-squares-four"
          color="primary"
          rounded
          density="comfortable"
          :variant="isHovering ? 'elevated' : 'tonal'"
          to="/learning/grid"
        />
      </template>
    </v-hover>

    <v-btn
      class="ms-2"
      icon="ph-list-bullets"
      color="primary"
      rounded
      density="comfortable"
    />
  </div>
</template>
