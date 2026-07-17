<script lang="ts" setup>
import { PropType, computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import type { ReasonInsert, ReasonType } from "@/components/baseTables/reason/types";
import { reasonTypeOptions } from "@/components/baseTables/reason/listView/utils";

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
    type: Object as PropType<ReasonInsert>,
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
const name = ref(prop.data.name || "");
const type = ref<ReasonType>(prop.data.type || "INVOICE_POSTING_FLAGGED");
const description = ref(prop.data.description || "");
const enabled = ref(prop.data.enabled ?? true);
const errorMessage = computed(() => prop.error);

const translatedReasonTypeOptions = computed(() =>
  reasonTypeOptions.map(option => ({
    ...option,
    label: t(option.label),
  }))
);

const requiredRules = {
  name: [
    (v: string) => !!v?.trim() || t("t-please-enter-reason"),
    (v: string) => (v?.trim().length ?? 0) >= 3 || t("t-reason-name-min-length"),
    (v: string) => (v?.trim().length ?? 0) <= 255 || t("t-reason-name-max-length"),
  ],
  type: [(v: string) => !!v || t("t-please-select-reason-type")],
};

watch(
  () => prop.data,
  newVal => {
    id.value = newVal.id || "";
    name.value = newVal.name || "";
    type.value = newVal.type || "INVOICE_POSTING_FLAGGED";
    description.value = newVal.description || "";
    enabled.value = newVal.enabled ?? true;
  },
  { immediate: true }
);

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const data = {
    ...(!isCreate.value && { id: id.value }),
    name: name.value,
    type: type.value,
    description: description.value,
    enabled: enabled.value,
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    name: "trimToEmpty",
    description: "trimToNull",
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
  <v-dialog v-model="dialogValue" width="560" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-reason') : $t('t-edit-reason')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="reason-form overflow-y-auto" style="max-height: 70vh">
          <v-alert
            v-if="errorMessage"
            :text="errorMessage"
            type="error"
            class="mb-4"
            variant="tonal"
            color="danger"
            density="compact"
          />

          <v-row class="reason-form__row">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-name") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="name" :placeholder="$t('t-enter-reason')" :rules="requiredRules.name" />
            </v-col>

            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-type") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="type"
                :items="translatedReasonTypeOptions"
                :placeholder="$t('t-select-reason-type')"
                :rules="requiredRules.type"
              />
            </v-col>

            <v-col cols="12" class="mt-n4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-description") }}
              </div>
              <TextArea v-model="description" :placeholder="$t('t-enter-description')" hide-details />
            </v-col>

            <v-col cols="12">
              <div class="font-weight-bold">{{ $t("t-availability") }}</div>
              <v-checkbox v-model="enabled" density="compact" color="primary" class="d-inline-flex" hide-details>
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
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t("t-saving") : $t("t-save") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.reason-form {
  padding-top: 16px;
  padding-bottom: 12px;
}

.reason-form__row {
  margin: -6px;
}

.reason-form__row > :deep(.v-col),
.reason-form__row > [class*="v-col-"] {
  padding: 6px !important;
}
</style>
