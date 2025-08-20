<script lang="ts" setup>
import { computed, type PropType } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { statusOptions } from "@/components/realEstate/agent/utils";
import { FilterType } from "@/components/realEstate/agent/gridView/type";

const emit = defineEmits(["update:modelValue", "onAdd"]);
const prop = defineProps({
  modelValue: {
    type: Object as PropType<FilterType>,
    default: () => {},
  },
});

const query = computed({
  get() {
    return prop.modelValue.query;
  },
  set(newVal: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      query: newVal,
    });
  },
});

const status = computed({
  get() {
    return prop.modelValue.status;
  },
  set(newVal: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      status: newVal,
    });
  },
});
</script>
<template>
  <v-card elevation="0">
    <v-card-text>
      <v-row justify="space-between">
        <v-col cols="12" lg="3">
          <QuerySearch
            v-model="query"
            placeholder="Search for agent, address or something..."
          />
        </v-col>
        <v-col cols="12" lg="3" class="d-flex align-center">
          <MenuSelect v-model="status" :items="statusOptions" />
          <v-btn color="secondary" class="ms-2" @click="emit('onAdd')">
            <i class="ph-user-plus me-1" /> Add Agent
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
