<script lang="ts" setup>
import { computed } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { statusOptions } from "@/components/eCommerce/customers/utils";

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
        <v-col cols="12" lg="4">
          <QuerySearch
            v-model="query"
            placeholder="Search customer, email, etc... "
          />
        </v-col>
        <v-col cols="12" sm="6" lg="lg">
          <MenuSelect
            v-model="status"
            :items="statusOptions"
            placeholder="Select Status"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="lg">
          <VueDatePicker
            v-model="date"
            :teleport="true"
            placeholder="Select date"
            :month-change-on-scroll="false"
            :enable-time-picker="false"
          />
        </v-col>
        <v-col cols="12" lg="2">
          <v-btn variant="tonal" class="" color="primary" block>
            <i class="ph-funnel me-1" />
            <span class="font-weight-bold"> Filter</span>
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
