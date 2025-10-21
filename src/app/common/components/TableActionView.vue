<script lang="ts" setup>
const emit = defineEmits(["onView"]);
</script>
<template>
  <div class="d-flex" style="gap: 8px; justify-content: inherit">
    <v-hover>
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-eye ph-sm"
          color="primary"
          density="compact"
          :variant="!isHovering ? 'tonal' : 'elevated'"
          rounded
          @click="emit('onView')"
        />
      </template>
    </v-hover>
  </div>
</template>
