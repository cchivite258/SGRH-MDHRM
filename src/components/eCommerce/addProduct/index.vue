<script lang="ts" setup>
import ProductInfo from "@/components/eCommerce/addProduct/ProductInfo.vue";
import Description from "@/components/eCommerce/addProduct/Description.vue";
import Images from "@/components/eCommerce/addProduct/Images.vue";
import GeneralInfo from "@/components/eCommerce/addProduct/GeneralInfo.vue";
</script>
<template>
  <ProductInfo />
  <Description class="mt-5" />
  <Images class="mt-5" />
  <GeneralInfo class="mt-5" />
  <div class="text-end mt-5">
    <v-btn color="danger"> <i class="ph-x px-1" /> Cancel </v-btn>
    <v-btn class="mx-2" color="primary"> Submit </v-btn>
  </div>
</template>
