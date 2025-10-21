<script lang="ts" setup>
import { computed, type PropType, ref } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { FilterType } from "@/components/realEstate/map/types";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { propertyTypes, bedrooms } from "@/components/realEstate/grid/utils";
import { prices } from "@/components/realEstate/map/utils";

const emit = defineEmits(["update:modelValue", "onAdd"]);
const prop = defineProps({
  modelValue: {
    type: Object as PropType<FilterType>,
    required: true,
  },
});

const query = computed({
  get() {
    return prop.modelValue.query;
  },
  set(updatedVal: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      query: updatedVal,
    });
  },
});

const propertyType = computed({
  get() {
    return prop.modelValue.type;
  },
  set(newVal: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      type: newVal,
    });
  },
});
const bedroom = computed({
  get() {
    return prop.modelValue.bedroom;
  },
  set(newVal: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      bedroom: newVal,
    });
  },
});
const price = computed({
  get() {
    return prop.modelValue.price;
  },
  set(newVal: any) {
    emit("update:modelValue", {
      ...prop.modelValue,
      price: newVal,
    });
  },
});
const date = computed({
  get() {
    return prop.modelValue.date;
  },
  set(newVal: string) {
    emit("update:modelValue", {
      ...prop.modelValue,
      date: newVal,
    });
  },
});
</script>
<template>
  <v-card elevation="0">
    <v-card-text>
      <v-row>
        <v-col xl="3" sm="6" cols="12">
          <QuerySearch
            v-model="query"
            placeholder="Search products, price, etc..."
          />
        </v-col>
        <v-col xl="2" sm="6" cols="12">
          <MenuSelect
            v-model="propertyType"
            :items="propertyTypes"
          />
        </v-col>
        <v-col xl="2" sm="6" cols="12">
          <MenuSelect v-model="bedroom" :items="bedrooms" />
        </v-col>
        <v-col xl="2" sm="6" cols="12">
          <MenuSelect v-model="price" :items="prices" />
        </v-col>
        <v-col xl="2" sm="6" cols="12">
          <VueDatePicker
            v-model="date"
            :teleport="true"
            range
            :enable-time-picker="false"
            :clearable="false"
            placeholder="Select date"
          />
        </v-col>
        <v-col xl="1" sm="6" cols="12">
          <v-btn color="primary" block @click="emit('onAdd')">
            Add Property
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
