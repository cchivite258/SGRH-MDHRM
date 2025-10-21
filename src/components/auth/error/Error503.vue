<script lang="ts" setup>
import { Img503 } from "@/assets/images/auth/utils";
</script>
<template>
  <div class="h-100 d-flex align-center justify-center">
    <div class="w-100">
      <v-img :src="Img503" height="360" class="mb-5" />
      <v-row justify="center" class="align-center">
        <v-col cols="12" lg="8">
          <v-card-title class="text-center">
            <h5 class="text-subtitle-1 font-weight-bold text-uppercase">
              Service Unavailable
            </h5>
          </v-card-title>
          <v-card-text class="mt-3 text-center">
            <div class="text-muted mt-1 font-weight-regular">
              The service is temporarily unavailable, try again later!
            </div>
          </v-card-text>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
