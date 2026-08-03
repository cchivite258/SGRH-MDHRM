<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import ChangeSalaryDialog from "@/components/employee/view/ChangeSalaryDialog.vue";
import ViewSalaryChangeDialog from "@/components/employee/view/ViewSalaryChangeDialog.vue";
import { formatCurrency } from "@/app/common/currencyFormat";
import { formateDate } from "@/app/common/dateFormate";
import { employeeService, reasonService } from "@/app/http/httpServiceProvider";
import type { ReasonListing } from "@/components/baseTables/reason/types";
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
    type: Number as PropType<number | null>,
    default: null
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
const viewDialog = ref(false);
const localLoading = ref(false);
const errorMsg = ref("");
const employeeData = ref<EmployeeResponseType | null>(null);
const selectedTracks = ref<EmployeeBaseSalaryTrackType[]>([]);
const salaryTracks = ref<EmployeeBaseSalaryTrackType[]>([]);
const salaryChangeReasons = ref<ReasonListing[]>([]);
const reasonsLoading = ref(false);
const selectedTrack = ref<EmployeeBaseSalaryTrackType | null>(null);

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const tableHeaders = computed(() =>
  salaryReviewHeader.map(item => ({ ...item, title: t(`t-${item.title}`) }))
);

const loadingState = computed(() => props.loading || localLoading.value);
const currentBaseSalary = computed(() => Number(employeeData.value?.baseSalary || 0));
const totalItems = computed(() => salaryTracks.value.length);
const salaryChangeReasonOptions = computed(() =>
  salaryChangeReasons.value
    .filter(reason => reason.enabled)
    .map(reason => ({
      label: reason.name,
      value: reason.id
    }))
);

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
  fetchSalaryChangeReasons();
  dialog.value = true;
};

const openViewDialog = (item: EmployeeBaseSalaryTrackType) => {
  selectedTrack.value = { ...item };
  viewDialog.value = true;
};

const getSalaryTrackReasonName = (item: EmployeeBaseSalaryTrackType | null) => {
  if (!item) return "";
  return item.reason?.name || "";
};

const submitSalaryUpdate = async (payload: EmployeeBaseSalaryUpdateType) => {
  if (!props.employeeId) return;

  try {
    localLoading.value = true;
    const response = await employeeService.updateBaseSalary(props.employeeId, payload);

    if (response.status === "error") {
      throw new Error(response.error?.message || t("t-error-saving-employee"));
    }

    toast.success(t("t-salary-updated-success"));
    dialog.value = false;
    await fetchEmployeeData();
    emit("salaryUpdated", Number(employeeData.value?.baseSalary || payload.newBaseSalary || 0));
  } catch (error: any) {
    console.error("Erro ao actualizar salário:", error);
    const message = error?.message || t("t-error-saving-employee");
    toast.error(message);
    setError(message);
  } finally {
    localLoading.value = false;
  }
};

const fetchSalaryChangeReasons = async () => {
  reasonsLoading.value = true;
  try {
    const { content } = await reasonService.getReasonsByType("EMPLOYEE_CHANGE_BASE_SALARY");
    salaryChangeReasons.value = content;
  } catch (error: any) {
    salaryChangeReasons.value = [];
    toast.error(error?.message || t("t-message-load-error"));
  } finally {
    reasonsLoading.value = false;
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
                <td>{{ getSalaryTrackReasonName(item) || '-' }}</td>
                <td>{{ item.notes || '-' }}</td>
                <td>
                  <Status :status="item.status || 'INACTIVE'" />
                </td>
                <td class="text-end">
                  <v-btn
                    icon="ph-eye ph-sm"
                    color="secondary"
                    density="compact"
                    variant="tonal"
                    rounded
                    :title="$t('t-view')"
                    @click="openViewDialog(item)"
                  />
                </td>
              </tr>
            </template>

            <template v-if="salaryTracks.length === 0" #body>
              <tr>
                <td :colspan="tableHeaders.length + 1" class="text-center py-10">
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

  <v-card-actions v-if="previousStep || nextStep" class="d-flex justify-space-between mt-5">
    <v-btn v-if="previousStep" color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', previousStep)">
      <i class="ph-arrow-left me-2" /> {{ $t(previousLabelKey) }}
    </v-btn>
    <v-btn v-if="nextStep" color="secondary" variant="elevated" class="me-2" @click="emit('onStepChange', nextStep)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>
  </v-card-actions>

  <ChangeSalaryDialog
    v-if="allowEdit"
    v-model="dialog"
    :loading="loadingState"
    :current-base-salary="currentBaseSalary"
    :reason-options="salaryChangeReasonOptions"
    :reasons-loading="reasonsLoading"
    :error-message="errorMsg"
    @submit="submitSalaryUpdate"
  />

  <ViewSalaryChangeDialog
    v-model="viewDialog"
    :data="selectedTrack"
    :reason-name="getSalaryTrackReasonName(selectedTrack)"
  />
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
