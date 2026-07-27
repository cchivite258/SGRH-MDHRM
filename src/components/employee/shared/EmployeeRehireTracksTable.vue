<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import TableActionView from "@/app/common/components/TableActionView.vue";
import { formatCurrency } from "@/app/common/currencyFormat";
import { formateDate } from "@/app/common/dateFormate";
import { employeeService } from "@/app/http/httpServiceProvider";
import { contractDurationTypeOptions } from "@/components/employee/create/utils";
import type { EmployeeRehireTrackType } from "@/components/employee/types";

const props = withDefaults(defineProps<{
  employeeId?: string | null;
  refreshKey?: number;
}>(), {
  employeeId: null,
  refreshKey: 0
});

const { t } = useI18n();

const loading = ref(false);
const viewDialog = ref(false);
const selectedTracks = ref<EmployeeRehireTrackType[]>([]);
const selectedTrack = ref<EmployeeRehireTrackType | null>(null);
const tracks = ref<EmployeeRehireTrackType[]>([]);

const tableHeaders = computed(() => [
  { title: t("t-rehire-date"), key: "rehireDate", sortable: true },
  { title: t("t-contract-end-date"), key: "terminateDate", sortable: true },
  { title: t("t-contract-duration"), key: "contractDurationType", sortable: true },
  { title: t("t-base-salary"), key: "baseSalary", sortable: true },
  { title: t("t-department"), key: "department.name", sortable: true },
  { title: t("t-position"), key: "position.name", sortable: true },
  { title: t("t-status"), key: "enabled", sortable: true },
  { title: t("t-action"), key: "action", sortable: false, align: "end" }
]);

const totalItems = computed(() => tracks.value.length);

const getContractDurationLabel = (value?: string) => {
  const option = contractDurationTypeOptions.find(item => item.value === value);
  return option?.label || value || "-";
};

const getTrackEndDate = (item: EmployeeRehireTrackType) => {
  return item.terminateDate || item.endDate;
};

const openViewDialog = (item: EmployeeRehireTrackType) => {
  selectedTrack.value = { ...item };
  viewDialog.value = true;
};

const fetchTracks = async () => {
  if (!props.employeeId) {
    tracks.value = [];
    return;
  }

  try {
    loading.value = true;
    const response = await employeeService.getEmployeeRehiresByEmployee(props.employeeId);
    tracks.value = response.content || [];
  } catch {
    tracks.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchTracks);

watch(() => props.employeeId, fetchTracks);
watch(() => props.refreshKey, fetchTracks);
</script>

<template>
  <Card :title="$t('t-contract-renewal-history')" title-class="py-5">
    <v-card-text>
      <DataTableServer
        v-model="selectedTracks"
        :headers="tableHeaders"
        :items="tracks"
        :items-per-page="10"
        :total-items="totalItems"
        :loading="loading"
        :show-pagination="false"
        :show-select="false"
      >
        <template #body="{ items }">
          <tr v-for="item in items as EmployeeRehireTrackType[]" :key="item.id" height="50">
            <td>{{ formateDate(item.rehireDate) || "-" }}</td>
            <td>{{ formateDate(getTrackEndDate(item)) || "-" }}</td>
            <td>{{ getContractDurationLabel(item.contractDurationType) }}</td>
            <td>{{ formatCurrency(item.baseSalary || 0) }}</td>
            <td>{{ item.department?.name || "-" }}</td>
            <td>{{ item.position?.name || "-" }}</td>
            <td>
              <Status :status="item.enabled === false ? 'disabled' : 'enabled'" />
            </td>
            <td class="text-end">
              <TableActionView @onView="openViewDialog(item)" />
            </td>
          </tr>
        </template>

        <template v-if="tracks.length === 0" #body>
          <tr>
            <td :colspan="tableHeaders.length" class="text-center py-10">
              <v-avatar size="72" color="primary" variant="tonal">
                <i class="ph-magnifying-glass" style="font-size: 30px" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold mt-3">
                {{ $t("t-search-not-found-message") }}
              </div>
            </td>
          </tr>
        </template>
      </DataTableServer>
    </v-card-text>
  </Card>

  <v-dialog v-model="viewDialog" width="620">
    <Card :title="$t('t-contract-renewal-data')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="viewDialog = false" />
      </template>

      <v-divider />

      <v-card-text>
        <v-row>
          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-rehire-date") }}</div>
            <div>{{ formateDate(selectedTrack?.rehireDate) || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-end-date") }}</div>
            <div>{{ selectedTrack ? formateDate(getTrackEndDate(selectedTrack)) || "-" : "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-contract-duration") }}</div>
            <div>{{ getContractDurationLabel(selectedTrack?.contractDurationType) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-base-salary") }}</div>
            <div>{{ formatCurrency(selectedTrack?.baseSalary || 0) }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-department") }}</div>
            <div>{{ selectedTrack?.department?.name || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-position") }}</div>
            <div>{{ selectedTrack?.position?.name || "-" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-status") }}</div>
            <Status :status="selectedTrack?.enabled === false ? 'disabled' : 'enabled'" />
          </v-col>

          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-notes") }}</div>
            <div>{{ selectedTrack?.notes || "-" }}</div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" @click="viewDialog = false">
          <i class="ph-x me-1" /> {{ $t("t-close") }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
