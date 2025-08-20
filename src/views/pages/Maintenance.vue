<script lang="ts" setup>
import { maintenance } from "@/assets/images/auth/utils";
</script>
<template>
  <div class="h-100 d-flex align-center justify-center">
    <v-card elevation="0" class="w-100">
      <v-card-title class="text-center">
        <h5 class="text-h6 font-weight-bold">Site is Under Maintenance</h5>
        <div class="text-muted mt-1 font-weight-regular">
          Please check back in sometime
        </div>
      </v-card-title>
      <v-card-text class="mt-5 text-center">
        <v-img :src="maintenance" height="410" />
        <v-btn color="primary" class="mt-8" to="/">
          <i class="ph-house me-1" /> Back to Home
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>
