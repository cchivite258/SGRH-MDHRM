<script lang="ts" setup>
import { productImages } from "@/components/eCommerce/ProductDetails/utils";
import { ref } from "vue";
const model = ref(productImages[0].src);
</script>
<template>
  <v-card class="product-gallery">
    <v-card-text>
      <v-carousel
        v-model="model"
        cycle
        height="400"
        hide-delimiters
        hide-delimiter-background
      >
        <template #prev="{ props }">
          <v-btn
            variant="tonal"
            icon="ph-caret-left"
            color="primary"
            size="x-small"
            rounded
            @click="props.onClick"
          />
        </template>
        <template #next="{ props }">
          <v-btn
            variant="tonal"
            icon="ph-caret-right"
            color="primary"
            size="x-small"
            rounded
            @click="props.onClick"
          />
        </template>
        <v-carousel-item v-for="image in productImages" :key="image.id">
          <v-sheet color="light" class="pa-10" height="100%">
            <v-img :src="image.src" />
          </v-sheet>
        </v-carousel-item>
      </v-carousel>
      <v-slide-group
        v-model="model"
        selected-class="bg-light"
        mandatory
        center-active
      >
        <v-slide-group-item
          v-for="image in productImages"
          :key="image.id"
          v-slot="{ toggle, selectedClass }"
        >
          <v-card
            elevation="0"
            :class="['pa-3', 'mx-2', 'mt-2', 'border', selectedClass]"
            height="100"
            width="100"
            @click="toggle"
          >
            <v-img :src="image.src" />
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-card-text>
  </v-card>
</template>
