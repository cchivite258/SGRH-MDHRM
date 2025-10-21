<script lang="ts" setup>
import { ref } from "vue";
const toggle_exclusive = ref(2);

const prop = defineProps({
  color: String,
});
</script>
<template>
  <v-btn-toggle
    v-model="toggle_exclusive"
    class="border ma-2"
    divided
    :color="color"
  >
    <v-btn><v-icon>mdi-format-align-left</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-align-center</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-align-right</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-align-justify</v-icon></v-btn>
  </v-btn-toggle>
</template>
