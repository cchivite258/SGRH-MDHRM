<script lang="ts" setup>
import { computed } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { statusOptions } from "@/components/institution/create/utils";

const emit = defineEmits(["update:modelValue"]);

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

const status = computed({
  get() {
    return prop.modelValue.status || "";
  },
  set(updatedStatus: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      status: updatedStatus,
    });
  },
});

const date = computed({
  get() {
    return prop.modelValue.date || "";
  },
  set(updatedDate: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      date: updatedDate,
    });
  },
});
</script>
<template>
  <v-card>
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="4" lg="lg">
          <QuerySearch
            v-model="query"
            :placeholder="$t('t-search-for-province')"
          />
        </v-col>
        <v-col cols="12" lg="2">
          <MenuSelect
            v-model="status"
            :items="statusOptions"
            :placeholder="$t('t-select-status')"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
