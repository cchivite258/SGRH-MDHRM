<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import type { IntegrationSourceCodeForm } from "@/components/settings/integrationSourceCode/types";

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
    type: Object as PropType<IntegrationSourceCodeForm>,
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
const sourceLedger = ref(prop.data.sourceLedger || "");
const sourceType = ref(prop.data.sourceType || "");
const description = ref(prop.data.description || "");
const enabled = ref(prop.data.enabled ?? true);
const errorMessage = computed(() => prop.error);

const sourceCodeRule = (requiredMessage: string) => (value: string | null) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) return requiredMessage;
  return /^[A-Za-z0-9]{2}$/.test(normalized) || t("t-integration-source-code-invalid");
};

const requiredRules = {
  sourceLedger: [sourceCodeRule(t("t-please-enter-integration-source-ledger"))],
  sourceType: [sourceCodeRule(t("t-please-enter-integration-source-type"))],
};

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid || description.value.trim().length > 255) {
    toast.error(description.value.trim().length > 255
      ? t("t-integration-source-code-description-maximum")
      : t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const data: IntegrationSourceCodeForm = {
    ...(!isCreate.value && { id: id.value }),
    sourceLedger: sourceLedger.value,
    sourceType: sourceType.value,
    description: description.value,
    enabled: enabled.value,
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    sourceLedger: "trimToEmpty",
    sourceType: "trimToEmpty",
    description: "trimToEmpty",
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
  <v-dialog v-model="dialogValue" width="640" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card
        :title="isCreate ? $t('t-add-integration-source-code') : $t('t-edit-integration-source-code')"
        title-class="py-0"
        style="overflow: hidden"
      >
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="source-code-form overflow-y-auto" style="max-height: 70vh">
          <p class="source-code-form__hint mb-4">
            {{ $t("t-integration-source-code-hint") }}
          </p>

          <v-alert
            v-if="errorMessage"
            :text="errorMessage"
            type="error"
            variant="tonal"
            class="mb-4"
          />

          <v-row>
            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-payment-order-entry-source-ledger") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="sourceLedger"
                max-length="2"
                :placeholder="$t('t-enter-integration-source-ledger')"
                :rules="requiredRules.sourceLedger"
              />
            </v-col>

            <v-col cols="12" md="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-payment-order-entry-source-type") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="sourceType"
                max-length="2"
                :placeholder="$t('t-enter-integration-source-type')"
                :rules="requiredRules.sourceType"
              />
            </v-col>

            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">{{ $t("t-description") }}</div>
              <TextArea v-model="description" :placeholder="$t('t-enter-description')" />
            </v-col>

            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold">{{ $t("t-availability") }}</div>
              <v-checkbox v-model="enabled" density="compact" color="primary" hide-details class="d-inline-flex">
                <template #label>
                  <span>{{ $t("t-is-enabled") }}</span>
                </template>
              </v-checkbox>
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
.source-code-form__hint {
  color: #64748b;
  font-size: 0.82rem;
  margin-bottom: 0;
}
</style>
