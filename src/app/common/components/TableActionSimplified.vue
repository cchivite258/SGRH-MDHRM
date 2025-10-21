<script lang="ts" setup>
const emit = defineEmits(["onView", "onDelete"]);
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
    <v-hover>
      <template v-slot:default="{ isHovering, props }">
        <v-btn
          v-bind="props"
          icon="ph-trash ph-sm"
          color="danger"
          density="compact"
          rounded
          :variant="!isHovering ? 'tonal' : 'elevated'"
          @click="emit('onDelete')"
        />
      </template>
    </v-hover>
  </div>
</template>
