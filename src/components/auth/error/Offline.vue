<script lang="ts" setup>
import { offlinePage } from "@/assets/images/auth/utils";
</script>
<template>
  <div class="h-100 d-flex align-center justify-center">
    <div class="w-100">
      <v-img :src="offlinePage" height="350" />
      <v-row justify="center" class="align-center">
        <v-col cols="12" lg="8">
          <v-card-title class="text-center">
            <div class="text-h6 font-weight-bold">We're Currently Offline</div>
          </v-card-title>
          <v-card-text class="mt-3 text-center">
            <div class="text-muted mt-1 font-weight-regular">
              We can't show you this images because you aren't connected to the
              internet. When you’re back online refresh the page or hit the
              button below
            </div>
            <v-btn color="primary" class="mt-5" to="/" height="45">
              <i class="ph-arrows-clockwise me-2" /> Refresh
            </v-btn>
          </v-card-text>
        </v-col>
      </v-row>
    </div>
  </div>
</template>
