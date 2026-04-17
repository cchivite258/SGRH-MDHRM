<script lang="ts" setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ""
  },
  backLabel: {
    type: String,
    default: "t-back-to-list"
  },
  saveLabel: {
    type: String,
    default: "t-save"
  },
  loading: {
    type: Boolean,
    default: false
  },
  saveDisabled: {
    type: Boolean,
    default: false
  },
  showBack: {
    type: Boolean,
    default: true
  },
  showSave: {
    type: Boolean,
    default: true
  }
});

defineEmits<{
  (event: "back"): void;
  (event: "save"): void;
}>();
</script>

<template>
  <div class="form-page-header">
    <div>
      <h1 class="form-page-header__title">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="form-page-header__subtitle">
        {{ subtitle }}
      </p>
    </div>

    <div class="form-page-header__actions">
      <slot name="actions">
        <v-btn
          v-if="showBack"
          class="form-page-header__back"
          color="secondary"
          variant="outlined"
          :disabled="loading"
          @click="$emit('back')"
        >
          <i class="ph-arrow-left me-2" />
          {{ backLabel.startsWith('t-') ? $t(backLabel) : backLabel }}
        </v-btn>

        <v-btn
          v-if="showSave"
          class="form-page-header__save"
          color="secondary"
          variant="elevated"
          :loading="loading"
          :disabled="saveDisabled"
          @click="$emit('save')"
        >
          <i class="ph-floppy-disk me-2" />
          {{ saveLabel.startsWith('t-') ? $t(saveLabel) : saveLabel }}
        </v-btn>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.form-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-top: 12px;
  margin-bottom: 26px;
}

.form-page-header__title {
  color: #0f172a;
  font-size: 1.22rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  margin: 0 0 5px;
}

.form-page-header__subtitle {
  color: #526071;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0;
}

.form-page-header__actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 12px;
}

.form-page-header__back,
.form-page-header__save {
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 36px;
  padding-inline: 14px;
  text-transform: none;
}

.form-page-header__save {
  box-shadow: none;
}

.form-page-header__save :deep(.v-btn__content),
.form-page-header__back :deep(.v-btn__content) {
  color: inherit;
}

@media (max-width: 767px) {
  .form-page-header {
    flex-direction: column;
    gap: 16px;
    margin-top: 10px;
    margin-bottom: 20px;
  }

  .form-page-header__actions {
    width: 100%;
  }

  .form-page-header__back,
  .form-page-header__save {
    flex: 1 1 0;
  }
}
</style>
