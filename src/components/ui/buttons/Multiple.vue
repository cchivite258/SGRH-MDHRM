<script lang="ts" setup>
import { ref } from "vue";
const toggle_multiple = ref([0, 1, 2]);

const prop = defineProps({
  color: String,
});
</script>
<template>
  <v-btn-toggle
    v-model="toggle_multiple"
    :color="color"
    dark
    multiple
    class="border ma-2"
    variant="flat"
    divided
  >
    <v-btn><v-icon>mdi-format-bold</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-italic</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-underline</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-color-fill</v-icon></v-btn>
  </v-btn-toggle>
</template>
