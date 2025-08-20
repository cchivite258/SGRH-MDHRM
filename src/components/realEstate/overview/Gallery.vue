<script lang="ts" setup>
import {
  galleryImages,
  galleryOptions,
} from "@/components/realEstate/overview/utils";
</script>
<template>
  <div class="position-relative">
    <div class="gallery-action-menu">
      <ListMenuWithIcon
        variant="elevated"
        density="comfortable"
        icon="ph-share-network"
        :menuItems="galleryOptions"
      />
    </div>
    <v-carousel hide-delimiters>
      <v-carousel-item
        v-for="(item, index) in galleryImages"
        :key="'gallery-img-' + index"
        :src="item.src"
        cover
      >
        <v-chip
          :color="item.color"
          variant="elevated"
          elevation="0"
          label
          class="gallery-chip"
        >
          <span class="ms-2 font-weight-medium">{{ item.label }}</span>
        </v-chip>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>
