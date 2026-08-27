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
  computed: {
    hasHeader() {
      return !!this.title || !!this.$slots["title-action"] || !!this.$slots["title-badge"];
    },
  },
};
</script>
<template>
  <v-card>
    <v-card-title
      v-if="hasHeader"
      class="card-title d-flex justify-space-between align-center py-4"
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
  min-height: 64px;
}

.card-title-content {
  min-width: 0;
}

.card-title-text {
  line-height: 1.35;
  margin: 0;
  overflow-wrap: anywhere;
  white-space: normal;
}

.card-title-action {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
}
</style>
