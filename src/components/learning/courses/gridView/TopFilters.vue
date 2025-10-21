<script lang="ts" setup>
import { computed, ref } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";

const emit = defineEmits(["update:modelValue", "onCreate"]);
const prop = defineProps({
  modelValue: String,
});

const status = ref("Active");

const query = computed({
  get() {
    return prop.modelValue || "";
  },
  set(query: string) {
    emit("update:modelValue", query);
  },
});
</script>
<template>
  <v-card>
    <v-card-text>
      <v-row justify="space-between" class="align-center">
        <v-col cols="12" lg="3">
          <QuerySearch
            v-model="query"
            placeholder="Search for agent, email, address or something..."
          />
        </v-col>
        <v-col cols="auto" class="d-flex align-center">
          <v-select
            v-model="status"
            variant="plain"
            rounded
            density="compact"
            hide-details
            class="filter-select-item"
            :items="['Active', 'UnActive']"
          />
          <v-btn
            variant="elevated"
            color="secondary"
            class="mx-2"
            @click="emit('onCreate')"
          >
            <i class="ph-user-circle-plus" /> Add Course
          </v-btn>

          <v-btn
            class="ms-2"
            icon="ph-squares-four"
            color="primary"
            rounded
            density="comfortable"
          />
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-btn
                v-bind="props"
                class="ms-2"
                icon="ph-list-bullets"
                color="primary"
                :variant="isHovering ? 'elevated' : 'tonal'"
                rounded
                density="comfortable"
                to="/learning/list"
              />
            </template>
          </v-hover>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
  
</template>
