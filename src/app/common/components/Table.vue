<script lang="ts" setup>
import { PropType, computed } from "vue";
import {
  TableHeaderType,
  TableConfigType,
} from "@/app/common/types/table.types";

const prop = defineProps({
  headerItems: {
    type: Array as PropType<TableHeaderType[]>,
    default: [],
  },
  isPagination: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Number,
    default: 1,
  },
  config: {
    type: Object as PropType<TableConfigType>,
    default: {
      page: 1,
      start: 1,
      end: 1,
      noOfItems: 1,
    },
  },
  loading: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: "",
  },
});

const tableConfig = computed(() => {
  return prop.config;
});

const totalPages = computed(() => {
  const { noOfItems, itemsPerPage } = prop.config;
  const data = Math.ceil(noOfItems / itemsPerPage);
  return data;
});

const emit = defineEmits(["onSelectAll", "update:modelValue"]);

const page = computed({
  get() {
    return prop.modelValue;
  },
  set(newVal: number) {
    emit("update:modelValue", newVal);
  },
});
</script>
<template>
  <v-progress-linear v-show="loading" indeterminate color="primary" />
  <v-table :theme="theme" density="compact" class="table-component">
    <thead class="bg-light">
      <tr>
        <th
          v-for="(item, index) in headerItems"
          :key="'table-head-' + index"
          class="font-weight-bold"
          :class="{
            'text-start': !item.align,
            'text-center': item.align === 'center',
            'text-end': item.align === 'end',
          }"
          :style="item.isCheck ? 'width: 60px' : ''"
        >
          <span v-if="item.isCheck">
            <v-checkbox
              hide-details
              @click="emit('onSelectAll')"
              color="primary"
            />
          </span>
          <span v-else> {{ item.title }}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      <slot name="body" />
    </tbody>
  </v-table>
  <div
    v-if="isPagination && totalPages > 0"
    class="d-flex justify-space-between align-center"
  >
    <div class="text-muted">
      {{$t('t-showing')}}  <b>{{ tableConfig.end }}</b> {{$t('t-of')}} 
      <b>{{ tableConfig.noOfItems }}</b> {{$t('t-results')}}
    </div>
    <v-pagination
      v-model="page"
      :length="totalPages"
      density="compact"
      color="primary"
      variant="text"
      total-visible="3"
      prev-icon="ph-arrow-left"
      next-icon="ph-arrow-right"
      class="table-pagination"
    />
  </div>
</template>
