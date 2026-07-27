<script lang="ts" setup>
import { computed, ref, watch, type PropType } from "vue";
import { useI18n } from "vue-i18n";

import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import MenuDatePicker from "@/app/common/components/MenuDatePicker.vue";
import type { EmployeeBaseSalaryUpdateType } from "@/components/employee/types";

type ReasonOption = {
  label: string;
  value: string | number;
};

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentBaseSalary: {
    type: Number,
    default: 0
  },
  reasonOptions: {
    type: Array as PropType<ReasonOption[]>,
    default: () => []
  },
  reasonsLoading: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: ""
  }
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "submit", payload: EmployeeBaseSalaryUpdateType): void;
}>();

const { t } = useI18n();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const effectiveDatePicker = ref<{ validate: () => boolean } | null>(null);
const salaryForm = ref<EmployeeBaseSalaryUpdateType>({
  newBaseSalary: 0,
  starDate: new Date().toISOString().split("T")[0],
  notes: "",
  reasonId: ""
});

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  }
});

const salaryRules = [
  (v: number | null) => v !== null && v !== undefined || t("t-please-enter-new-base-salary"),
  (v: number | null) => Number(v) > 0 || t("t-please-enter-a-valid-new-base-salary")
];

const effectiveDateRules = [
  (v: Date | string | null) => !!v || t("t-please-enter-effective-date")
];

const reasonRules = [
  (v: string | number | null) => !!v || t("t-please-select-reason")
];

const notesRules = [
  (v: string | null) => !!String(v || "").trim() || t("t-please-enter-salary-change-notes")
];

const resetForm = () => {
  salaryForm.value = {
    newBaseSalary: props.currentBaseSalary,
    starDate: new Date().toISOString().split("T")[0],
    notes: "",
    reasonId: ""
  };
};

const closeDialog = () => {
  dialogValue.value = false;
};

const submit = async () => {
  if (!formRef.value) return;

  const { valid } = await formRef.value.validate();
  const isDateValid = effectiveDatePicker.value?.validate?.() ?? true;

  if (!valid || !isDateValid) return;

  emit("submit", {
    newBaseSalary: Number(salaryForm.value.newBaseSalary),
    starDate: salaryForm.value.starDate ? String(salaryForm.value.starDate).split("T")[0] : undefined,
    notes: salaryForm.value.notes?.trim() || "",
    reasonId: salaryForm.value.reasonId
  });
};

watch(dialogValue, (isOpen) => {
  if (isOpen) {
    resetForm();
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="700" persistent>
    <v-form ref="formRef" @submit.prevent="submit">
      <Card :title="$t('t-change-salary')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="closeDialog" />
        </template>
        <v-divider />

        <v-alert
          v-if="errorMessage"
          :text="errorMessage"
          variant="tonal"
          color="danger"
          class="mx-5 mt-3"
          density="compact"
        />

        <v-card-text class="overflow-y-auto" style="max-height: 70vh">
          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-new-base-salary') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="salaryForm.newBaseSalary"
                type="number"
                :placeholder="$t('t-enter-new-base-salary')"
                :rules="salaryRules"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-effective-date') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuDatePicker
                ref="effectiveDatePicker"
                v-model="salaryForm.starDate"
                :placeholder="$t('t-enter-effective-date')"
                :rules="effectiveDateRules"
                :disabled="loading"
              />
            </v-col>

            <v-col cols="12" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-reason') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="salaryForm.reasonId"
                :items="reasonOptions"
                :placeholder="$t('t-select-reason')"
                :rules="reasonRules"
                :disabled="loading || reasonsLoading"
              />
            </v-col>

            <v-col cols="12" class="mt-n7">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-salary-change-notes') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextArea
                v-model="salaryForm.notes"
                :placeholder="$t('t-enter-salary-change-notes')"
                :rules="notesRules"
                rows="3"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" @click="closeDialog">
              <i class="ph-x me-1" /> {{ $t('t-close') }}
            </v-btn>
            <v-btn color="primary" variant="elevated" @click="submit" :loading="loading" :disabled="loading">
              {{ loading ? $t('t-saving') : $t('t-save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
