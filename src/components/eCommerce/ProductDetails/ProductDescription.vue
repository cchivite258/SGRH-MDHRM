<script lang="ts" setup>
import { productDetail } from "@/components/eCommerce/ProductDetails/utils";
</script>
<template>
  <Card title="Description:">
    <v-card-text>
      <p class="text-muted mb-2">
        A <b>hoodie</b> is a sweatshirt with a hood attached that may also have
        a kangaroo pocket or full zipper. A sweatshirt is a long-sleeved
        pullover shirt fashioned out of thick, usually cotton cloth material.
        Sweatshirts are almost exclusively casual attire and hence not as dressy
        as some sweaters.
      </p>
      <p class="text-muted">
        A thicker knit T-Shirt with a rag cut edge and sleeves and a printed
        muscle man on the back, you will feel #ULTRA in one of these.
      </p>

      <h4 class="text-subtitle-2 font-weight-bold mt-6 mb-4">
        Product Details
      </h4>
      <v-container>
        <v-row
          v-for="(item, index) in productDetail"
          :key="'product-dscr-' + index"
          no-gutters
          class="mb-3"
        >
          <v-col cols="5" class="font-weight-bold"> {{ item.title }} </v-col>
          <v-col cols="6"> {{ item.value }} </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </Card>
</template>
