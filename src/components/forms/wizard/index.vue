<script lang="ts" setup>
import Progress from "@/components/forms/wizard/Progress.vue";
import ButtonProgress from "@/components/forms/wizard/ButtonProgress.vue";
import VerticalProgress from "@/components/forms/wizard/VerticalProgress.vue";

</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Progress />
    </v-col>
    <v-col cols="12" lg="6">
      <ButtonProgress />
    </v-col>
    <v-col cols="12">
      <VerticalProgress />
    </v-col>
  </v-row>
</template>
