<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import type { CodeConfigForm, CodeConfigSeparator, CodeConfigType } from "@/components/settings/codeConfig/types";
import {
  codeConfigSeparatorOptions,
  codeConfigTypeOptions,
} from "@/components/settings/codeConfig/listView/utils";

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
    type: Object as PropType<CodeConfigForm>,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

const isCreate = computed(() => prop.data.id === "-1" || !prop.data.id);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
type PatternToken = "PREFIX" | "SEQ" | "YEAR" | "MONTH" | "SUFFIX";
const patternTokenValues: PatternToken[] = ["PREFIX", "SEQ", "YEAR", "MONTH", "SUFFIX"];
const patternTokenRegex = /\{(PREFIX|SEQ|YEAR|MONTH|SUFFIX)\}/g;

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const id = ref(prop.data.id || "");
const type = ref<CodeConfigType>(prop.data.type || "SERVICE_PROVIDER");
const prefix = ref(prop.data.prefix || "");
const separator = ref<CodeConfigSeparator>(prop.data.separator || "COMMA");
const suffix = ref(prop.data.suffix || "");
const sequenceLength = ref<number | null>(prop.data.sequenceLength ?? 1);
const errorMessage = computed(() => prop.error);

const parsePatternTokens = (value?: string | null): PatternToken[] => {
  const source = value || "{PREFIX}{SEQ}";
  const matches = source.match(patternTokenRegex) || [];

  if (!matches.length || matches.join("") !== source) {
    return ["PREFIX", "SEQ"];
  }

  return matches
    .map(token => token.replace(/[{}]/g, "") as PatternToken)
    .filter((token, index, tokens) => tokens.indexOf(token) === index);
};

const patternTokens = ref<PatternToken[]>(parsePatternTokens(prop.data.pattern));

const pattern = computed(() => patternTokens.value.map(token => `{${token}}`).join(""));

const patternTokenOptions = computed(() =>
  patternTokenValues.map(value => ({
    value,
    label: t(`t-code-config-pattern-token-${value.toLowerCase().replace("_", "-")}`),
  }))
);

const codeConfigTypeSelectOptions = computed(() =>
  codeConfigTypeOptions.map(option => ({
    ...option,
    label: t(option.label),
  }))
);

const codeConfigSeparatorSelectOptions = computed(() =>
  codeConfigSeparatorOptions.map(option => ({
    ...option,
    label: t(option.label),
  }))
);

const uppercaseLettersRule = (fieldLabel: string) => [
  (v: string) => !!v?.trim() || t("t-required-field"),
  (v: string) => /^[A-Z]+$/.test(v || "") || t("t-uppercase-letters-only", { field: fieldLabel }),
  (v: string) => (v || "").length <= 5 || t("t-max-five-characters"),
];

const optionalUppercaseLettersRule = (fieldLabel: string) => [
  (v: string) => !v || /^[A-Z]+$/.test(v) || t("t-uppercase-letters-only", { field: fieldLabel }),
  (v: string) => (v || "").length <= 5 || t("t-max-five-characters"),
];

const requiredRules = {
  type: [(v: string) => !!v || t("t-please-select-code-config-type")],
  prefix: uppercaseLettersRule(t("t-prefix")),
  separator: [(v: string) => !!v || t("t-please-select-code-config-separator")],
  suffix: optionalUppercaseLettersRule(t("t-suffix")),
  sequenceLength: [
    (v: number | string | null) => v !== null && v !== "" || t("t-please-enter-sequence-length"),
    (v: number | string | null) => Number(v) >= 1 || t("t-sequence-length-minimum"),
    (v: number | string | null) => Number(v) <= 10 || t("t-sequence-length-maximum"),
  ],
  pattern: [
    (v: string) => !!v?.trim() || t("t-please-enter-pattern"),
    (v: string) => (v || "").length >= 5 || t("t-pattern-minimum"),
    (v: string) => (v || "").length <= 34 || t("t-pattern-maximum"),
    (v: string) =>
      /^(?=.*\{(PREFIX|SEQ|YEAR|MONTH|SUFFIX)\})(\{(PREFIX|SEQ|YEAR|MONTH|SUFFIX)\})+$/.test(v || "") ||
      t("t-invalid-code-config-pattern"),
  ],
};

const toUppercase = (value: string) => (value || "").toUpperCase();

const getPatternTokenLabel = (token: PatternToken) => {
  const option = patternTokenOptions.value.find(option => option.value === token);
  return option?.label || token;
};

const canAddPatternToken = (token: PatternToken) => {
  return !patternTokens.value.includes(token) && pattern.value.length + `{${token}}`.length <= 34;
};

const addPatternToken = (token: PatternToken) => {
  if (!canAddPatternToken(token)) return;

  patternTokens.value = [...patternTokens.value, token];
};

const removePatternToken = (index: number) => {
  patternTokens.value = patternTokens.value.filter((_, tokenIndex) => tokenIndex !== index);
};

const movePatternToken = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= patternTokens.value.length) return;

  const nextTokens = [...patternTokens.value];
  const currentToken = nextTokens[index];
  nextTokens[index] = nextTokens[targetIndex];
  nextTokens[targetIndex] = currentToken;
  patternTokens.value = nextTokens;
};

const validatePattern = () => {
  const invalidRule = requiredRules.pattern.find(rule => rule(pattern.value) !== true);
  return invalidRule ? invalidRule(pattern.value) : true;
};

const onSubmit = async () => {
  if (!form.value) return;

  prefix.value = toUppercase(prefix.value);
  suffix.value = toUppercase(suffix.value);

  const { valid } = await form.value.validate();
  const patternValidation = validatePattern();
  if (!valid || patternValidation !== true) {
    toast.error(patternValidation !== true ? String(patternValidation) : t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const data: CodeConfigForm = {
    ...(!isCreate.value && { id: id.value }),
    type: type.value,
    prefix: prefix.value,
    separator: separator.value,
    suffix: suffix.value,
    sequenceLength: Number(sequenceLength.value),
    pattern: pattern.value,
    includesYear: patternTokens.value.includes("YEAR"),
    includesMonth: patternTokens.value.includes("MONTH"),
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    type: "trimToEmpty",
    prefix: "trimToEmpty",
    separator: "trimToEmpty",
    suffix: "trimToEmpty",
    pattern: "trimToEmpty",
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
        :title="isCreate ? $t('t-add-contract-code-config') : $t('t-edit-contract-code-config')"
        title-class="py-0"
        style="overflow: hidden"
      >
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="code-config-form overflow-y-auto" style="max-height: 70vh">
          <v-alert
            v-if="errorMessage"
            :text="errorMessage"
            type="error"
            class="mb-4"
            variant="tonal"
            color="danger"
            density="compact"
          />

          <v-row class="code-config-form__row">
            <v-col cols="12" md="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-type") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="type"
                :items="codeConfigTypeSelectOptions"
                :placeholder="$t('t-select-code-config-type')"
                :rules="requiredRules.type"
              />
            </v-col>

            <v-col cols="12" md="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-separator") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="separator"
                :items="codeConfigSeparatorSelectOptions"
                :placeholder="$t('t-select-code-config-separator')"
                :rules="requiredRules.separator"
              />
            </v-col>

            <v-col cols="12" md="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-prefix") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="prefix"
                maxlength="5"
                :placeholder="$t('t-enter-prefix')"
                :rules="requiredRules.prefix"
                @update:model-value="prefix = toUppercase(prefix)"
              />
            </v-col>

            <v-col cols="12" md="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-suffix") }}
              </div>
              <TextField
                v-model="suffix"
                maxlength="5"
                :placeholder="$t('t-enter-suffix')"
                :rules="requiredRules.suffix"
                @update:model-value="suffix = toUppercase(suffix)"
              />
            </v-col>

            <v-col cols="12" md="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-sequence-length") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model.number="sequenceLength"
                type="number"
                min="1"
                max="10"
                :placeholder="$t('t-enter-sequence-length')"
                :rules="requiredRules.sequenceLength"
              />
            </v-col>

            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-pattern") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <div class="pattern-builder">
                <div class="pattern-builder__actions">
                  <v-btn
                    v-for="option in patternTokenOptions"
                    :key="option.value"
                    size="small"
                    variant="tonal"
                    color="primary"
                    :disabled="!canAddPatternToken(option.value)"
                    @click="addPatternToken(option.value)"
                  >
                    <i class="ph-plus me-1" /> {{ option.label }}
                  </v-btn>
                </div>

                <div class="pattern-builder__sequence">
                  <v-chip
                    v-for="(token, tokenIndex) in patternTokens"
                    :key="`${token}-${tokenIndex}`"
                    label
                    color="secondary"
                    variant="tonal"
                    class="pattern-builder__chip"
                  >
                    <span class="pattern-builder__chip-label">{{ getPatternTokenLabel(token) }}</span>
                    <v-btn
                      icon="ph-caret-left"
                      size="x-small"
                      variant="text"
                      density="compact"
                      :disabled="tokenIndex === 0"
                      @click.stop="movePatternToken(tokenIndex, -1)"
                    />
                    <v-btn
                      icon="ph-caret-right"
                      size="x-small"
                      variant="text"
                      density="compact"
                      :disabled="tokenIndex === patternTokens.length - 1"
                      @click.stop="movePatternToken(tokenIndex, 1)"
                    />
                    <v-btn
                      icon="ph-x"
                      size="x-small"
                      variant="text"
                      density="compact"
                      @click.stop="removePatternToken(tokenIndex)"
                    />
                  </v-chip>

                  <div v-if="!patternTokens.length" class="pattern-builder__empty">
                    {{ $t("t-code-config-pattern-empty") }}
                  </div>
                </div>

                <v-text-field
                  :model-value="pattern"
                  readonly
                  variant="solo"
                  density="compact"
                  hide-details
                  class="pattern-builder__preview"
                />
              </div>
            </v-col>

          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t("t-saving") : $t("t-save") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.code-config-form {
  padding-top: 16px;
  padding-bottom: 12px;
}

.code-config-form__row {
  margin: -6px;
}

.code-config-form__row > :deep(.v-col),
.code-config-form__row > [class*="v-col-"] {
  padding: 6px !important;
}

.code-config-form :deep(.v-input__details) {
  min-height: 18px;
  padding-top: 5px;
}

.code-config-form :deep(.v-messages) {
  min-height: 0;
}

.code-config-form :deep(.v-messages__message) {
  line-height: 1.25;
  margin-top: 2px !important;
}

.pattern-builder {
  display: grid;
  gap: 10px;
}

.pattern-builder__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pattern-builder__actions :deep(.v-btn) {
  min-width: 0;
}

.pattern-builder__sequence {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 48px;
  padding: 8px;
}

.pattern-builder__chip {
  height: auto;
  min-height: 32px;
}

.pattern-builder__chip :deep(.v-chip__content) {
  align-items: center;
  display: inline-flex;
  gap: 4px;
}

.pattern-builder__chip-label {
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.2;
}

.pattern-builder__empty {
  color: #64748b;
  font-size: 0.78rem;
}

.pattern-builder__preview :deep(.v-field__input) {
  color: #334155;
  font-family: Consolas, "Courier New", monospace;
  font-size: 0.82rem;
  font-weight: 600;
}
</style>
