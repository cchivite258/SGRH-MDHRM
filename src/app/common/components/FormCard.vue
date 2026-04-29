<script lang="ts" setup>
import { computed } from "vue";
import { useLayoutStore } from "@/store/app";

const layoutStore = useLayoutStore();
const isDarkMode = computed(() => layoutStore.mode === "dark");
</script>

<template>
  <Card class="form-card" :class="{ 'form-card--dark': isDarkMode }">
    <v-card-text class="form-card__body">
      <slot />
    </v-card-text>
  </Card>
</template>

<style scoped>
.form-card {
  --form-card-border: #e4eaf2;
  --form-card-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
  --form-card-title: #161b26;
  --form-card-text: #334155;
  border: 1px solid var(--form-card-border);
  border-radius: 16px !important;
  box-shadow: var(--form-card-shadow) !important;
  overflow: visible;
}

.form-card__body {
  color: var(--form-card-text);
  padding: 14px 30px 30px;
}

.form-card__body :deep(form > .v-card) {
  border: 0;
  background: transparent;
  box-shadow: none !important;
}

.form-card__body :deep(> .v-card) {
  border: 0;
  background: transparent;
  box-shadow: none !important;
}

.form-card__body :deep(form + form) {
  margin-top: 26px;
}

.form-card__body :deep(form > .v-card > .v-card-title),
.form-card__body :deep(> .v-card > .v-card-title) {
  padding: 0 0 6px !important;
  min-height: auto;
}

.form-card__body :deep(form > .v-card > .v-card-title h4),
.form-card__body :deep(> .v-card > .v-card-title h4) {
  color: var(--form-card-title);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;
}

.form-card__body :deep(form > .v-card > .v-card-text),
.form-card__body :deep(> .v-card > .v-card-text) {
  color: inherit;
  padding-right: 12px;
  padding-left: 12px;
}

.form-card--dark {
  --form-card-border: #2b3442;
  --form-card-shadow: 0 18px 40px rgba(2, 6, 23, 0.22);
  --form-card-title: #f8fafc;
  --form-card-text: #cbd5e1;
}

@media (max-width: 767px) {
  .form-card {
    border-radius: 14px !important;
  }

  .form-card__body {
    padding: 12px 18px 22px;
  }
}
</style>
