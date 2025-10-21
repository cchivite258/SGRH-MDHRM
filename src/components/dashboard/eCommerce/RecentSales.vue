<script lang="ts" setup>
import {
  Avatar2,
  Avatar7,
  Avatar4,
  Avatar5,
  Avatar6,
  Avatar1,
  Avatar8,
} from "@/assets/images/users/utils";

const salesList = [
  {
    name: "Bethany Nienow",
    date: "03 Feb, 2023",
    price: "$630.73",
    src: Avatar2,
  },
  {
    name: "Sonia Conn",
    date: "03 Feb, 2023",
    price: "$1,452.64",
    src: Avatar7,
  },
  {
    name: "Talon Bradtke",
    date: "03 Feb, 2023",
    price: "$478.87",
    src: Avatar4,
  },
  {
    name: "Tyrell Kerluke",
    date: "03 Feb, 2023",
    price: "$82.14",
    src: Avatar5,
  },
  {
    name: "Ross Zieme",
    date: "03 Feb, 2023",
    price: "$79.00",
    src: Avatar6,
  },
  {
    name: "Hollis Spencer",
    date: "03 Feb, 2023",
    price: "$849.05",
    src: Avatar1,
  },
  {
    name: "Cordia Grady",
    date: "03 Feb, 2023",
    price: "$254.32",
    src: Avatar8,
  },
];
</script>
<template>
  <Card title="Recent Sales">
    <template #title-action>
      <v-btn variant="text" class="text-muted px-0">
        View All <i class="ph ph-caret-right"></i>
      </v-btn>
    </template>
    <v-card-text data-simplebar style="height: 365px; overflow-y: auto">
      <v-row v-for="(sales, index) in salesList" :key="'sales-' + index">
        <v-col cols="auto">
          <v-avatar>
            <v-img :src="sales.src" />
          </v-avatar>
        </v-col>
        <v-col class="ps-0">
          <div class="flex-grow-1">
            <h6 class="text-subtitle-2 font-weight-bold">{{ sales.name }}</h6>
            <p class="text-muted mb-0">{{ sales.date }}</p>
          </div>
        </v-col>
        <v-col class="text-subtitle-2 font-weight-bold text-right">
          {{ sales.price }}
        </v-col>
        <v-divider v-if="index !== salesList.length - 1" />
      </v-row>
    </v-card-text>
  </Card>
</template>
