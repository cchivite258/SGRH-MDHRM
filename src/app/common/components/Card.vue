<script lang="ts">
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    titleClass: {
      type: String,
      default: "",
    },
  },
};
</script>
<template>
  <v-card>
    <v-card-title
      class="card-title d-flex justify-space-between align-start py-4"
      :class="titleClass"
    >
      <div class="card-title-content d-flex align-center">
        <h4 class="card-title-text text-body-1 font-weight-bold">
          {{ title }}
        </h4>
        <slot name="title-badge" />
      </div>
      <div class="card-title-action">
        <slot name="title-action" />
      </div>
    </v-card-title>
    <slot />
  </v-card>
</template>

<style scoped>
.card-title {
  gap: 12px;
}

.card-title-content {
  min-width: 0;
}

.card-title-text {
  line-height: 1.35;
  overflow-wrap: anywhere;
  white-space: normal;
}

.card-title-action {
  flex: 0 0 auto;
}
</style>
