<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import ValidatedDatePicker from "@/app/common/components/ValidatedDatePicker.vue";
import { formatCurrency } from "@/app/common/currencyFormat";
import { formateDate } from "@/app/common/dateFormate";
import { employeeService } from "@/app/http/httpServiceProvider";
import { salaryReviewHeader } from "@/components/employee/list/utils";
import type {
  EmployeeBaseSalaryTrackType,
  EmployeeBaseSalaryUpdateType,
  EmployeeResponseType
} from "@/components/employee/types";

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits<{
  (e: "onStepChange", step: number): void;
  (e: "salaryUpdated", value: number): void;
}>();

const props = defineProps({
  employeeId: {
    type: String as PropType<string | null>,
    default: null
  },
  allowEdit: {
    type: Boolean,
    default: false
  },
  previousStep: {
    type: Number,
    default: 4
  },
  previousLabelKey: {
    type: String,
    default: 't-back-to-health-plan'
  },
  nextStep: {
    type: Number,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const dialog = ref(false);
const localLoading = ref(false);
const errorMsg = ref("");
const employeeData = ref<EmployeeResponseType | null>(null);
const selectedTracks = ref<EmployeeBaseSalaryTrackType[]>([]);
const salaryTracks = ref<EmployeeBaseSalaryTrackType[]>([]);
const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const effectiveDatePicker = ref<{ validate: () => boolean } | null>(null);

const salaryForm = ref<EmployeeBaseSalaryUpdateType>({
  newBaseSalary: 0,
  starDate: new Date().toISOString().split("T")[0]
});

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const tableHeaders = computed(() =>
  salaryReviewHeader.map(item => ({ ...item, title: t(`t-${item.title}`) }))
);

const loadingState = computed(() => props.loading || localLoading.value);
const currentBaseSalary = computed(() => Number(employeeData.value?.baseSalary || 0));
const totalItems = computed(() => salaryTracks.value.length);

const salaryRules = [
  (v: number | null) => v !== null && v !== undefined || t("t-please-enter-new-base-salary"),
  (v: number | null) => Number(v) > 0 || t("t-please-enter-a-valid-new-base-salary")
];

const effectiveDateRules = [
  (v: Date | string | null) => !!v || t("t-please-enter-effective-date")
];

const clearErrorLater = () => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
  }

  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

const setError = (message: string) => {
  errorMsg.value = message;
  clearErrorLater();
};

const normalizeTracks = (tracks: EmployeeBaseSalaryTrackType[] = []) => {
  return tracks.slice().sort((a, b) => {
    const isActiveA = a.status === "ACTIVE";
    const isActiveB = b.status === "ACTIVE";

    if (isActiveA && !isActiveB) return -1;
    if (!isActiveA && isActiveB) return 1;

    const dateA = new Date(a.startDate || a.stardDate || "").getTime();
    const dateB = new Date(b.startDate || b.stardDate || "").getTime();
    return dateB - dateA;
  });
};

const fetchEmployeeData = async () => {
  if (!props.employeeId) return;

  try {
    localLoading.value = true;
    const response = await employeeService.getEmployeeById(props.employeeId);
    employeeData.value = response.data;
    salaryTracks.value = normalizeTracks(response.data.employeeBaseSalaryTracks || []);

    if (salaryTracks.value.length === 0) {
      const salaryTrackResponse = await employeeService.getEmployeeSalaryTracks(props.employeeId);
      if (salaryTrackResponse) {
        employeeData.value = {
          ...response.data,
          employeeBaseSalaryTracks: salaryTrackResponse.employeeBaseSalaryTracks || response.data.employeeBaseSalaryTracks
        };
        salaryTracks.value = normalizeTracks(employeeData.value.employeeBaseSalaryTracks || []);
      }
    }
  } catch (error: any) {
    console.error("Erro ao carregar histórico salarial:", error);
    setError(error?.message || t("t-error-loading-employee"));
  } finally {
    localLoading.value = false;
  }
};

const openDialog = () => {
  salaryForm.value = {
    newBaseSalary: currentBaseSalary.value,
    starDate: new Date().toISOString().split("T")[0]
  };
  dialog.value = true;
};

const closeDialog = () => {
  dialog.value = false;
};

const submitSalaryUpdate = async () => {
  if (!props.employeeId || !formRef.value) return;

  const { valid } = await formRef.value.validate();
  const isDateValid = effectiveDatePicker.value?.validate?.() ?? true;

  if (!valid || !isDateValid) {
    return;
  }

  try {
    localLoading.value = true;
    const response = await employeeService.updateBaseSalary(props.employeeId, {
      newBaseSalary: Number(salaryForm.value.newBaseSalary),
      starDate: salaryForm.value.starDate ? String(salaryForm.value.starDate).split("T")[0] : undefined
    });

    if (response.status === "error") {
      throw new Error(response.error?.message || t("t-error-saving-employee"));
    }

    toast.success(t("t-salary-updated-success"));
    closeDialog();
    await fetchEmployeeData();
    emit("salaryUpdated", Number(employeeData.value?.baseSalary || salaryForm.value.newBaseSalary || 0));
  } catch (error: any) {
    console.error("Erro ao actualizar salário:", error);
    const message = error?.message || t("t-error-saving-employee");
    toast.error(message);
    setError(message);
  } finally {
    localLoading.value = false;
  }
};

onMounted(async () => {
  await fetchEmployeeData();
});

onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
  }
});
</script>

<template>
  <Card :title="$t('t-salary-review')" title-class="py-5">
    <template #title-action>
      <v-btn v-if="allowEdit" color="primary" @click="openDialog" :disabled="!employeeId || loadingState">
        <i class="ph-currency-circle-dollar me-1" /> {{ $t('t-change-salary') }}
      </v-btn>
    </template>

    <v-card-text>
      <transition name="fade">
        <v-alert
          v-if="errorMsg"
          :text="errorMsg"
          type="error"
          class="mb-4"
          variant="tonal"
          color="danger"
          density="compact"
          @click="errorMsg = ''"
          style="cursor: pointer;"
        />
      </transition>

      <v-row>
        <v-col cols="12" md="6">
          <div class="font-weight-bold mb-2">
            {{ $t('t-base-salary') }}
          </div>
          <div>{{ formatCurrency(currentBaseSalary) }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <v-row class="mt-2">
    <v-col cols="12">
      <Card :title="$t('t-salary-change-history')" title-class="py-5">
        <v-card-text>
          <DataTableServer
            v-model="selectedTracks"
            :headers="tableHeaders"
            :items="salaryTracks"
            :items-per-page="10"
            :total-items="totalItems"
            :loading="loadingState"
            :show-pagination="false"
          >
            <template #body="{ items }">
              <tr v-for="item in items as EmployeeBaseSalaryTrackType[]" :key="item.id" height="50">
                <td>
                  <v-checkbox
                    :model-value="selectedTracks.some(selected => selected.id === item.id)"
                    @update:model-value="
                      selectedTracks = $event
                        ? [...selectedTracks, item]
                        : selectedTracks.filter(selected => selected.id !== item.id)
                    "
                    hide-details
                    density="compact"
                  />
                </td>
                <td>{{ formatCurrency(item.baseSalary || 0) }}</td>
                <td>{{ formateDate(item.startDate || item.stardDate) }}</td>
                <td>{{ formateDate(item.endDate) || '-' }}</td>
                <td>
                  <Status :status="item.status || 'INACTIVE'" />
                </td>
              </tr>
            </template>

            <template v-if="salaryTracks.length === 0" #body>
              <tr>
                <td :colspan="salaryReviewHeader.length" class="text-center py-10">
                  <v-avatar size="80" color="primary" variant="tonal">
                    <i class="ph-magnifying-glass" style="font-size: 30px" />
                  </v-avatar>
                  <div class="text-subtitle-1 font-weight-bold mt-3">
                    {{ $t('t-search-not-found-message') }}
                  </div>
                </td>
              </tr>
            </template>
          </DataTableServer>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>

  <v-card-actions class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', previousStep)">
      <i class="ph-arrow-left me-2" /> {{ $t(previousLabelKey) }}
    </v-btn>
    <v-btn v-if="nextStep" color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', nextStep)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>
  </v-card-actions>

  <v-dialog v-if="allowEdit" v-model="dialog" width="700">
    <v-form ref="formRef" @submit.prevent="submitSalaryUpdate">
      <Card :title="$t('t-change-salary')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="closeDialog" />
        </template>
        <v-divider />

        <v-alert
          v-if="errorMsg"
          :text="errorMsg"
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
              <ValidatedDatePicker
                ref="effectiveDatePicker"
                v-model="salaryForm.starDate"
                :placeholder="$t('t-enter-effective-date')"
                :rules="effectiveDateRules"
                :teleport="true"
                format="dd/MM/yyyy"
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
            <v-btn color="primary" variant="elevated" @click="submitSalaryUpdate" :loading="loadingState"
              :disabled="loadingState">
              {{ loadingState ? $t('t-saving') : $t('t-save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
