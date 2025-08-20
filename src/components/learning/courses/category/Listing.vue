<script lang="ts" setup>
import { CategoryType } from "@/components/learning/courses/category/types";
import { type PropType, ref } from "vue";
import Pagination from "@/app/common/components/Pagination.vue";

const prop = defineProps({
  data: {
    type: Array as PropType<CategoryType[]>,
    default: () => [],
  },
});

const page = ref(1);
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      lg="3"
      xl
      v-for="(item, index) in data"
      :key="'category-list-item-' + index"
    >
      <v-card
        border
        :color="item.backgroundColor"
        :width="$vuetify.display.xlAndUp ? '300' : ''"
      >
        <v-card-text class="text-center pa-6">
          <v-avatar class="bg-white pa-3" rounded size="70">
            <v-img :src="item.img" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold mt-4">
            {{ item.title }}
          </div>
          <div class="text-muted mt-2">
            {{ item.courses }}+ Courses Available
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <Pagination v-model="page" />
</template>
