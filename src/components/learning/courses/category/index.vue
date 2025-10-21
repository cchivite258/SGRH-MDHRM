<script lang="ts" setup>
import { ref } from "vue";
import TopFilters from "@/components/learning/courses/category/TopFilters.vue";
import { coursesCategory } from "@/components/learning/courses/category/utils";
import { CategoryType } from "@/components/learning/courses/category/types";
import Listing from "@/components/learning/courses/category/Listing.vue";

const query = ref("");
const filteredData = ref<CategoryType[]>(coursesCategory);
const finalDataList = ref<CategoryType[]>(filteredData.value);

const onCreate = (data: CategoryType) =>  {
    filteredData.value.unshift(data)
    finalDataList.value = filteredData.value
    
}
</script>
<template>
  <TopFilters v-model="query" @onCreate="onCreate" />
  <Listing :data="filteredData" />
</template>
