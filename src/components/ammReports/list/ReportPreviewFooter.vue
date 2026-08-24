<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(defineProps<{
  systemFooterKey?: string;
  generatedBy?: string;
  generatedAt?: string;
}>(), {
  systemFooterKey: "t-spr-system-footer",
  generatedBy: "",
  generatedAt: "",
});

const { t, locale } = useI18n();
const createdAt = new Date();

const formattedGeneratedAt = computed(() => {
  if (props.generatedAt) return props.generatedAt;

  return createdAt.toLocaleString(locale.value === "en" ? "en-US" : "pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

const generatedBy = computed(() => {
  return props.generatedBy?.trim() || t("t-spr-system-user");
});
</script>

<template>
  <v-card variant="outlined" class="report-preview-footer mt-8" elevation="0">
    <v-card-text class="pa-4">
      <div class="report-preview-footer-content">
        <div class="text-caption text-grey">
          <div class="d-flex align-center">
            <v-icon size="small" class="mr-2">mdi-information</v-icon>
            {{ $t("t-report-generated-automatically") }}
          </div>
          <div class="mt-1">
            {{ $t(systemFooterKey) }}
          </div>
        </div>

        <div class="report-preview-footer-meta text-caption text-grey">
          <div>{{ $t("t-generated-by") }}: {{ generatedBy }}</div>
          <div>{{ $t("t-spr-generated-at") }}: {{ formattedGeneratedAt }}</div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.report-preview-footer {
  border-color: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.report-preview-footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.report-preview-footer-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

@media (max-width: 700px) {
  .report-preview-footer-content,
  .report-preview-footer-meta {
    align-items: flex-start;
  }
}
</style>
