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
    rounded="xl"
    :color="color"
    class="border ma-2"
    divided
  >
    <v-btn icon="mdi-format-align-left"></v-btn>
    <v-btn icon="mdi-format-align-center"></v-btn>
    <v-btn icon="mdi-format-align-right"></v-btn>
    <v-btn icon="mdi-format-align-justify"></v-btn>
  </v-btn-toggle>
</template>
