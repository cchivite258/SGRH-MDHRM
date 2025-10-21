<script lang="ts" setup>
import ProductGallery from "@/components/eCommerce/ProductDetails/ProductGallery.vue";
import ProductDetail from "@/components/eCommerce/ProductDetails/ProductDetail.vue";
import ProductDescription from "@/components/eCommerce/ProductDetails/ProductDescription.vue";
import RatingAndReview from "@/components/eCommerce/ProductDetails/RatingAndReview.vue";
</script>
<template>
  <v-row>
    <v-col lg="4"><ProductGallery /></v-col>
    <v-col lg="8">
      <ProductDetail />
      <ProductDescription class="mt-4" />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="12"> <RatingAndReview /> </v-col>
  </v-row>
</template>
