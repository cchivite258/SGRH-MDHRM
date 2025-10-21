<script lang="ts" setup>
import { ref } from "vue";
const toggle_one = ref(0);

const prop = defineProps({
  color: String,
});
</script>
<template>
  <v-btn-toggle
    :color="color"
    v-model="toggle_one"
    shaped
    mandatory
    class="border ma-2"
    divided
  >
    <v-btn><v-icon>mdi-format-align-left</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-align-center</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-align-right</v-icon></v-btn>
    <v-btn><v-icon>mdi-format-align-justify</v-icon></v-btn>
  </v-btn-toggle>
</template>
