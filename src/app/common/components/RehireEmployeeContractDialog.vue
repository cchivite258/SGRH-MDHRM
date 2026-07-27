<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import MenuDatePicker from "@/app/common/components/MenuDatePicker.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { useDepartmentStore } from "@/store/institution/departmentStore";
import { usePositionStore } from "@/store/institution/positionStore";
import type { EmployeeInsertType, EmployeeRehireType } from "@/components/employee/types";
import { contractDurationTypeOptions } from "@/components/employee/create/utils";

const props = withDefaults(defineProps<{
  modelValue: boolean;
  loading?: boolean;
  serverErrors?: Record<string, string[]>;
  employeeData: EmployeeInsertType;
}>(), {
  loading: false,
  serverErrors: () => ({})
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "onConfirm", payload: EmployeeRehireType): void;
  (e: "clear-server-error", field: string): void;
}>();

const { t } = useI18n();
const toast = useToast();
const departmentStore = useDepartmentStore();
const positionStore = usePositionStore();

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const step = ref<"confirm" | "form">("confirm");
const rehireDatePicker = ref<{ validate: () => boolean } | null>(null);
const endDatePicker = ref<{ validate: () => boolean } | null>(null);

const getTodayInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toInputDateValue = (value: Date | string | null | undefined) => {
  if (!value) return "";
  if (typeof value === "string") return value.split("T")[0] || "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const rehireForm = ref<EmployeeRehireType>({
  newBaseSalary: 0,
  contractDurationType: "",
  rehireDate: getTodayInputValue(),
  endDate: "",
  positionId: "",
  departmentId: "",
  notes: ""
});

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  }
});

const departmentOptions = computed(() =>
  departmentStore.departments.map((department) => ({
    label: department.name,
    value: department.id
  }))
);

const positionOptions = computed(() =>
  positionStore.positions.map((position) => ({
    label: position.name,
    value: position.id
  }))
);

const getServerErrors = (field: string) => props.serverErrors?.[field] || [];

const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];

const salaryRules = [
  (value: number | null) => value !== null && value !== undefined || t("t-please-enter-new-base-salary"),
  (value: number | null) => Number(value) > 0 || t("t-please-enter-a-valid-new-base-salary")
];

const departmentRules = [
  (value: string | number | null) => !!value || t("t-please-select-department")
];

const positionRules = [
  (value: string | number | null) => !!value || t("t-please-select-position")
];

const contractDurationTypeRules = [
  (value: string | null) => !!value || t("t-please-select-contract-duration-type")
];

const closeDialog = () => {
  dialogValue.value = false;
};

const resetForm = () => {
  rehireForm.value = {
    newBaseSalary: Number(props.employeeData.baseSalary ?? 0),
    contractDurationType: props.employeeData.contractDurationType || "",
    rehireDate: getTodayInputValue(),
    endDate: "",
    departmentId: props.employeeData.department || "",
    positionId: props.employeeData.position || "",
    notes: ""
  };
};

const loadDepartments = async () => {
  if (!props.employeeData.company) return;

  try {
    await departmentStore.fetchDepartments(props.employeeData.company);
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  }
};

const loadPositions = async (departmentId: string | number) => {
  if (!departmentId) return;

  try {
    await positionStore.fetchPositions(String(departmentId));
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach((message) => toast.error(message));
  }
};

const openFormStep = async () => {
  step.value = "form";
  resetForm();
  await loadDepartments();
  if (rehireForm.value.departmentId) {
    await loadPositions(rehireForm.value.departmentId);
  }
};

const rehireDateRules = [
  (value: Date | string | null) => !!toInputDateValue(value) || t("t-please-enter-rehire-date")
];

const endDateRules = [
  (value: Date | string | null) => {
    if (rehireForm.value.contractDurationType !== "FIXED_TERM") return true;
    return !!toInputDateValue(value) || t("t-please-enter-contract-end-date");
  },
  (value: Date | string | null) => {
    if (rehireForm.value.contractDurationType !== "FIXED_TERM") return true;
    const endDate = toInputDateValue(value);
    const rehireDate = toInputDateValue(rehireForm.value.rehireDate);
    if (!endDate || !rehireDate) return true;
    return endDate >= rehireDate || t("t-contract-end-date-must-be-after-start-date");
  }
];

const submit = async () => {
  const formResult = await form.value?.validate();
  const isRehireDateValid = rehireDatePicker.value?.validate?.() ?? true;
  const isEndDateValid = endDatePicker.value?.validate?.() ?? true;

  if (!formResult?.valid || !isRehireDateValid || !isEndDateValid) return;

  emit("onConfirm", {
    newBaseSalary: Number(rehireForm.value.newBaseSalary),
    contractDurationType: rehireForm.value.contractDurationType,
    rehireDate: toInputDateValue(rehireForm.value.rehireDate),
    endDate: toInputDateValue(rehireForm.value.endDate),
    departmentId: rehireForm.value.departmentId,
    positionId: rehireForm.value.positionId,
    notes: rehireForm.value.notes?.trim() || ""
  });
};

watch(dialogValue, (isOpen) => {
  if (isOpen) {
    step.value = "confirm";
    resetForm();
  }
});

watch(() => rehireForm.value.departmentId, async (newDepartmentId, oldDepartmentId) => {
  emit("clear-server-error", "departmentId");

  if (!newDepartmentId) {
    positionStore.positions = [];
    rehireForm.value.positionId = "";
    return;
  }

  if (oldDepartmentId && oldDepartmentId !== newDepartmentId) {
    rehireForm.value.positionId = "";
  }

  await loadPositions(newDepartmentId);
});

watch(() => rehireForm.value.positionId, () => emit("clear-server-error", "positionId"));
watch(() => rehireForm.value.newBaseSalary, () => emit("clear-server-error", "newBaseSalary"));
watch(() => rehireForm.value.contractDurationType, async () => {
  emit("clear-server-error", "contractDurationType");
  emit("clear-server-error", "endDate");
  await nextTick();
  endDatePicker.value?.validate?.();
});
watch(() => rehireForm.value.rehireDate, async () => {
  emit("clear-server-error", "rehireDate");
  await nextTick();
  rehireDatePicker.value?.validate?.();
  endDatePicker.value?.validate?.();
});
watch(() => rehireForm.value.endDate, async () => {
  emit("clear-server-error", "endDate");
  await nextTick();
  endDatePicker.value?.validate?.();
});
watch(() => rehireForm.value.notes, () => emit("clear-server-error", "notes"));
</script>

<template>
  <v-dialog v-model="dialogValue" :width="step === 'confirm' ? 500 : 760" persistent :retain-focus="false">
    <v-card v-if="step === 'confirm'">
      <v-btn
        variant="text"
        class="confirm-close-icon"
        icon="ph-x"
        :disabled="loading"
        @click="closeDialog"
      />

      <v-card-text class="text-center px-7 pt-8 pb-4">
        <div class="text-primary">
          <i class="ph ph-user-plus ph-3x" />
        </div>
        <div class="mt-3">
          <h4 class="text-h6 font-weight-bold">
            {{ $t("t-dialog-title-confirm-rehire-contract") }}
          </h4>
          <p class="text-muted mx-4 mb-0 text-subtitle-1">
            {{ $t("t-dialog-text-confirm-rehire-contract") }}
          </p>
        </div>
      </v-card-text>

      <v-card-actions class="d-flex justify-center pt-1 pb-6">
        <v-btn class="me-2" flat variant="tonal" :disabled="loading" @click="closeDialog">
          {{ $t("t-close") }}
        </v-btn>
        <v-btn color="primary" flat variant="elevated" :loading="loading" :disabled="loading" @click="openFormStep">
          {{ $t("t-yes-rehire-contract") }}
        </v-btn>
      </v-card-actions>
    </v-card>

    <v-form v-else ref="form" @submit.prevent="submit">
      <Card :title="$t('t-contract-renewal-data')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" :disabled="loading" @click="closeDialog" />
        </template>

        <v-divider />

        <v-card-text class="overflow-y-auto" style="max-height: 70vh">
          <v-row>
            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-new-base-salary") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model="rehireForm.newBaseSalary"
                type="number"
                :placeholder="$t('t-enter-new-base-salary')"
                :rules="applyServerErrorsToRules('newBaseSalary', salaryRules)"
                :disabled="loading"
                hide-details="auto"
              />
            </v-col>

            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-duration") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="rehireForm.contractDurationType"
                :items="contractDurationTypeOptions"
                :placeholder="$t('t-select-contract-duration-type')"
                :rules="applyServerErrorsToRules('contractDurationType', contractDurationTypeRules)"
                :error-messages="getServerErrors('contractDurationType')"
                :disabled="loading"
              />
            </v-col>

            <v-col cols="12" lg="4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-rehire-date") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuDatePicker
                ref="rehireDatePicker"
                v-model="rehireForm.rehireDate"
                :placeholder="$t('t-enter-rehire-date')"
                :rules="applyServerErrorsToRules('rehireDate', rehireDateRules)"
              />
            </v-col>

            <v-col cols="12" lg="4" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract-end-date") }}
                <i v-if="rehireForm.contractDurationType === 'FIXED_TERM'" class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuDatePicker
                ref="endDatePicker"
                v-model="rehireForm.endDate"
                :placeholder="$t('t-enter-contract-end-date')"
                :rules="applyServerErrorsToRules('endDate', endDateRules)"
              />
            </v-col>

            <v-col cols="12" lg="4" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-department") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="rehireForm.departmentId"
                :items="departmentOptions"
                :placeholder="$t('t-select-department')"
                :rules="applyServerErrorsToRules('departmentId', departmentRules)"
                :disabled="loading || departmentStore.loading"
              />
            </v-col>

            <v-col cols="12" lg="4" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-position") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="rehireForm.positionId"
                :items="positionOptions"
                :placeholder="$t('t-select-position')"
                :rules="applyServerErrorsToRules('positionId', positionRules)"
                :disabled="loading || positionStore.loading || !rehireForm.departmentId"
              />
            </v-col>

            <v-col cols="12" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-notes") }}
              </div>
              <TextArea
                v-model="rehireForm.notes"
                :placeholder="$t('t-enter-rehire-notes')"
                :disabled="loading"
                rows="3"
                hide-details="auto"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" :disabled="loading" @click="closeDialog">
              <i class="ph-x me-1" /> {{ $t("t-close") }}
            </v-btn>
            <v-btn color="primary" variant="elevated" :loading="loading" :disabled="loading" @click="submit">
              {{ loading ? $t("t-saving") : $t("t-save") }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
