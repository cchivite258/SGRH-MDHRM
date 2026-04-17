<template>
  <Card class="form-card">
    <v-card-text class="form-card__body">
      <slot />
    </v-card-text>
  </Card>
</template>

<style scoped>
.form-card {
  border: 1px solid #e4eaf2;
  border-radius: 16px !important;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05) !important;
  overflow: visible;
}

.form-card__body {
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
  color: #161b26;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;
}

.form-card__body :deep(form > .v-card > .v-card-text),
.form-card__body :deep(> .v-card > .v-card-text) {
  padding-right: 12px;
  padding-left: 12px;
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
