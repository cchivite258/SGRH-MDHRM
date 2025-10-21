<script lang="ts" setup>
import { menuItems } from "@/components/layouts/utils";
</script>
<template>
  <div class="">
    <v-list>
      <div v-for="menuItem in menuItems" :key="menuItem.id">
        <v-list-item
          v-if="!menuItem.isHeader"
          variant="text"
          dark
          class="rail-main-menu rail-main-menu-icon"
          :value="menuItem.id"
        >
          <i
            v-if="!menuItem.isHeader"
            class="ph ph-xl"
            :class="menuItem.icon"
          />
        </v-list-item>
      </div>
    </v-list>
  </div>
</template>
