<script lang="ts" setup>
import { computed } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";

const emit = defineEmits(["update:modelValue"]);

const prop = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const query = computed({
  get() {
    return prop.modelValue || "";
  },
  set(updatedQuery: string) {
    emit("update:modelValue", updatedQuery);
  },
});
</script>
<template>
  <v-card>
    <v-card-text>
      <v-row justify="space-between">
        <v-col cols="auto">
          <div class="text-subtitle-1 font-weight-bold">My Subscriptions</div>
          <div class="mt-1">
            <span class="text-muted me-1">Monthly:</span>
            <span class="font-weight-bold text-primary me-2">$326.95</span>
            <span class="text-muted me-1">Yearly:</span>
            <span class="font-weight-bold text-primary">$1452.32</span>
          </div>
        </v-col>
        <v-col cols="12" lg="4" class="d-flex align-center">
          <v-row>
            <v-col cols>
              <QuerySearch
                v-model="query"
                placeholder="Search courses, category price etc..."
              />
            </v-col>
            <v-col cols="auto">
              <v-btn color="primary" class="ms-2" to="/learning/list">
                <i class="ph-plus-circle me-1" /> Add New
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
