<script lang="ts" setup>
const languages = ["English", "Russian", "chainese"];
const skills = [
  "Business Marketing",
  "Google Ads Management",
  "Social Ads Management",
  "Content SEO",
];
</script>
<template>
  <div class="text-subtitle-2 text-muted font-weight-bold mb-2">
    Languages Known
  </div>
  <v-chip
    v-for="item in languages"
    :key="item"
    color="info"
    density="compact"
    label
    class="ma-1"
  >
    <span class="status-chip">
      {{ item }}
    </span>
  </v-chip>
  <div class="text-subtitle-2 text-muted font-weight-bold mb-2 mt-5">
    Featured Skills
  </div>
  <v-chip
    v-for="item in skills"
    :key="item"
    color="secondary"
    density="compact"
    label
    class="ma-1"
  >
    <span class="status-chip">
      {{ item }}
    </span>
  </v-chip>
</template>
