<script lang="ts" setup>
const emit = defineEmits(["onAdd", "onToggleFilter"]);
</script>
<template>
  <Card title="Property" title-class="py-5">
    <template #title-badge>
      <v-chip
        label
        density="compact"
        color="secondary"
        class="ms-2 px-2 font-weight-bold"
      >
        241
      </v-chip>
    </template>
    <template #title-action>
      <div>
        <v-btn color="secondary" @click="emit('onAdd')">
          <i class="ph-house-line me-1" /> Add Property
        </v-btn>
        <v-btn color="primary" class="ms-1" @click="emit('onToggleFilter')">
          <i class="ph-funnel me-1" />Filter
        </v-btn>
      </div>
    </template>
  </Card>
</template>
