<script lang="ts" setup>
import { ref, watch } from "vue";
import TopFilter from "@/components/learning/students/subscription/TopFilter.vue";
import { studentsSubscriptionList } from "@/components/learning/students/subscription/utils";
import { SubscriptionType } from "@/components/learning/students/subscription/types";
import Listing from "@/components/learning/students/subscription/Listing.vue";

const filteredData = ref<SubscriptionType[]>(studentsSubscriptionList);
const finalDataList = ref<SubscriptionType[]>(filteredData.value);

const query = ref("");
watch(query, (newQuery: string) => {
  filteredData.value = finalDataList.value.filter((item) => {
    const val = newQuery.toLowerCase();

    if (
      item.category.toLowerCase().includes(val) ||
      item.course.includes(val) ||
      item.price.toString().includes(val)
    ) {
      return item;
    }
  });
});
</script>
<template>
  <TopFilter v-model="query" />
  <Listing class="mt-5" :data="filteredData" />
</template>
