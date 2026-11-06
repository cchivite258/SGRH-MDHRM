<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import type { IntegrationApplication, IntegrationDefinitionForm } from "@/components/settings/integration/types";
import { integrationApplicationOptions } from "@/components/settings/integration/listView/utils";

const localLoading = ref(false);
const emit = defineEmits(["update:modelValue", "onSubmit"]);
const toast = useToast();
const { t } = useI18n();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<IntegrationDefinitionForm>,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

const isCreate = computed(() => prop.data.id === "-1" || !prop.data.id);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const id = ref(prop.data.id || "");
const code = ref(prop.data.code || "");
const application = ref<IntegrationApplication | "">(prop.data.application || "");
const name = ref(prop.data.name || "");
const description = ref(prop.data.description || "");
const baseUrl = ref(prop.data.baseUrl || "");
const apiVersion = ref(prop.data.apiVersion || "");
const tenant = ref(prop.data.tenant || "");
const companyCode = ref(prop.data.companyCode || "");
const username = ref(prop.data.username || "");
const password = ref("");
const timeoutSeconds = ref<number | null>(prop.data.timeoutSeconds ?? 30);
const passwordConfigured = ref(Boolean(prop.data.passwordConfigured));
const errorMessage = computed(() => prop.error);

const optionalMax = (max: number, message: string) => (value: string | null) =>
  !value || String(value).trim().length <= max || message;

const optionalPattern = (pattern: RegExp, message: string) => (value: string | null) => {
  const normalized = String(value ?? "").trim();
  return !normalized || pattern.test(normalized) || message;
};

const requiredText = (message: string) => (value: string | null) =>
  !!String(value ?? "").trim() || message;

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !!url.hostname;
  } catch {
    return false;
  }
};

const passwordRequired = computed(() => isCreate.value || !passwordConfigured.value);

const requiredRules = {
  application: [(value: string) => !!value || t("t-please-select-integration-application")],
  name: [
    requiredText(t("t-please-enter-name")),
    optionalMax(255, t("t-integration-name-maximum")),
  ],
  baseUrl: [
    requiredText(t("t-please-enter-integration-base-url")),
    optionalMax(500, t("t-integration-base-url-maximum")),
    (value: string | null) => {
      const normalized = String(value ?? "").trim();
      if (!normalized) return true;
      return isHttpUrl(normalized) || t("t-integration-base-url-protocol");
    },
  ],
  apiVersion: [
    optionalMax(20, t("t-integration-api-version-maximum")),
    optionalPattern(/^\d+(\.\d+)*$/, t("t-integration-api-version-invalid")),
  ],
  tenant: [
    optionalMax(50, t("t-integration-code-maximum")),
    optionalPattern(/^[A-Za-z0-9_-]+$/, t("t-integration-code-invalid")),
  ],
  companyCode: [
    requiredText(t("t-please-enter-integration-company-code")),
    optionalMax(50, t("t-integration-code-maximum")),
    optionalPattern(/^[A-Za-z0-9_-]+$/, t("t-integration-code-invalid")),
  ],
  username: [
    requiredText(t("t-please-enter-username")),
    optionalMax(100, t("t-integration-username-maximum")),
  ],
  password: [
    (value: string | null) => {
      const normalized = String(value ?? "").trim();
      if (!normalized && !passwordRequired.value) return true;
      return !!normalized || t("t-please-enter-password");
    },
    optionalMax(255, t("t-integration-password-maximum")),
  ],
  timeoutSeconds: [
    (value: number | string | null) => {
      if (value === null || value === undefined || value === "") return true;
      const parsed = Number(value);
      return (Number.isInteger(parsed) && parsed >= 5 && parsed <= 120) || t("t-integration-timeout-range");
    },
  ],
};

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid || description.value.trim().length > 1000) {
    toast.error(description.value.trim().length > 1000 ? t("t-integration-description-maximum") : t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const data: IntegrationDefinitionForm = {
    ...(!isCreate.value && { id: id.value }),
    code: code.value,
    application: application.value,
    name: name.value,
    description: description.value,
    baseUrl: baseUrl.value,
    apiVersion: apiVersion.value,
    tenant: tenant.value,
    companyCode: companyCode.value,
    username: username.value,
    password: password.value,
    timeoutSeconds: timeoutSeconds.value === null || `${timeoutSeconds.value}` === ""
      ? null
      : Number(timeoutSeconds.value),
    passwordConfigured: passwordConfigured.value,
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    name: "trimToEmpty",
    description: "trimToEmpty",
    baseUrl: "trimToEmpty",
    apiVersion: "trimToEmpty",
    tenant: "trimToEmpty",
    companyCode: "trimToEmpty",
    username: "trimToEmpty",
    password: "trimToEmpty",
  });

  emit("onSubmit", data, {
    onSuccess: () => {
      dialogValue.value = false;
    },
    onFinally: () => {
      localLoading.value = false;
    },
  });
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="760" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card
        :title="isCreate ? $t('t-add-integration') : $t('t-edit-integration')"
        title-class="py-0"
        style="overflow: hidden"
      >
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="integration-form overflow-y-auto" style="max-height: 70vh">
          <p class="integration-form__hint mb-4">
            {{ $t("t-integration-hint") }}
          </p>

          <v-alert
            v-if="errorMessage"
            :text="errorMessage"
            type="error"
            class="mb-4"
            variant="tonal"
            color="danger"
            density="compact"
          />

          <v-row class="integration-form__row">
            <v-col cols="12" :md="isCreate ? 12 : 6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-integration-application") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="application"
                :items="integrationApplicationOptions"
                :placeholder="$t('t-select-integration-application')"
                :rules="requiredRules.application"
                :disabled="!isCreate"
              />
            </v-col>

            <v-col v-if="!isCreate" cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-code") }}
              </div>
              <TextField :model-value="code || '-'" disabled />
            </v-col>

            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-name") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="name"
                :placeholder="$t('t-enter-name')"
                :rules="requiredRules.name"
                max-length="255"
              />
            </v-col>

            <v-col cols="12" md="8" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-integration-base-url") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="baseUrl"
                :placeholder="$t('t-enter-integration-base-url')"
                :rules="requiredRules.baseUrl"
                max-length="500"
              />
            </v-col>

            <v-col cols="12" md="4" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-integration-api-version") }}
              </div>
              <TextField
                v-model="apiVersion"
                :placeholder="$t('t-enter-integration-api-version')"
                :rules="requiredRules.apiVersion"
                max-length="20"
              />
            </v-col>

            <v-col cols="12" md="4" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-integration-tenant") }}
              </div>
              <TextField
                v-model="tenant"
                :placeholder="$t('t-enter-integration-tenant')"
                :rules="requiredRules.tenant"
                max-length="50"
              />
            </v-col>

            <v-col cols="12" md="4" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-integration-company-code") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="companyCode"
                :placeholder="$t('t-enter-integration-company-code')"
                :rules="requiredRules.companyCode"
                max-length="50"
              />
            </v-col>

            <v-col cols="12" md="4" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-integration-timeout") }}
              </div>
              <TextField
                v-model.number="timeoutSeconds"
                type="number"
                min="5"
                max="120"
                :placeholder="$t('t-enter-integration-timeout')"
                :rules="requiredRules.timeoutSeconds"
              />
            </v-col>

            <v-col cols="12" md="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-username") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="username"
                :placeholder="$t('t-enter-username')"
                :rules="requiredRules.username"
                max-length="100"
              />
            </v-col>

            <v-col cols="12" md="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-password") }}
                <i v-if="passwordRequired" class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="password"
                is-password
                :placeholder="isCreate ? $t('t-enter-password') : $t('t-integration-password-keep')"
                :rules="requiredRules.password"
                max-length="255"
              />
              <div v-if="!isCreate" class="integration-form__password-hint">
                {{ passwordConfigured ? $t("t-integration-password-configured") : $t("t-integration-password-missing") }}
              </div>
            </v-col>

            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-description") }}
              </div>
              <TextArea v-model="description" :placeholder="$t('t-enter-description')" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" :loading="localLoading" :disabled="localLoading" @click="onSubmit">
            {{ localLoading ? $t("t-saving") : $t("t-save") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.integration-form {
  padding-top: 16px;
  padding-bottom: 12px;
}

.integration-form__hint,
.integration-form__password-hint {
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0;
}

.integration-form__password-hint {
  font-size: 0.75rem;
  margin-top: -8px;
}

.integration-form__row {
  margin: -6px;
}

.integration-form__row > :deep(.v-col),
.integration-form__row > [class*="v-col-"] {
  padding: 6px !important;
}

.integration-form :deep(.v-input__details) {
  min-height: 18px;
  padding-top: 5px;
}

.integration-form :deep(.v-messages) {
  min-height: 0;
}

.integration-form :deep(.v-messages__message) {
  line-height: 1.25;
  margin-top: 2px !important;
}
</style>
