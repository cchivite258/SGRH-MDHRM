<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

import { getApiErrorMessages } from "@/app/common/apiErrors";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import { hospitalProcedureGroupService, hospitalProcedureGroupingService } from "@/app/http/httpServiceProvider";
import { useHospitalProcedureTypeStore } from "@/store/baseTables/hospitalProcedureTypeStore";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import type { HospitalProcedureTypeListing } from "@/components/baseTables/hospitalProcedureType/types";
import type { HospitalProcedureGroupingListing } from "@/components/baseTables/hospitalProcedureGrouping/types";
import { listViewHeader } from "@/components/baseTables/hospitalProcedureGroup/editHospitalProcedureGroup/listView/utils";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const hospitalProcedureTypeStore = useHospitalProcedureTypeStore();
const isViewMode = computed(() => String(route.query.mode || "").toLowerCase() === "view");

const groupId = computed(() => String(route.query.id || ""));
const loading = ref(false);
const loadingRelations = ref(false);
const searchQuery = ref("");
const itemsPerPage = ref(10);
const selectedHospitalProcedureTypes = ref<HospitalProcedureTypeListing[]>([]);
const selectedHospitalProcedureTypeIds = ref<(string | number)[]>([]);
const errorMsg = ref("");
const searchProps = "name,description";

const form = ref({
  id: "",
  name: "",
  description: "",
  enabled: true,
});

const formErrors = ref<Record<string, string>>({
  name: "",
});

const totalItems = computed(() => hospitalProcedureTypeStore.pagination.totalElements);
const loadingList = computed(() => hospitalProcedureTypeStore.loading || loadingRelations.value);
const orderedHospitalProcedureTypes = computed(() => {
  const items = [...(hospitalProcedureTypeStore.hospital_procedure_types || [])];

  return items.sort((a, b) => {
    const aSelected = isIdSelected(a.id) ? 0 : 1;
    const bSelected = isIdSelected(b.id) ? 0 : 1;

    if (aSelected !== bSelected) {
      return aSelected - bSelected;
    }

    return (a.name || "").localeCompare((b.name || ""), undefined, { sensitivity: "base" });
  });
});

const isIdSelected = (id: string | number) => selectedHospitalProcedureTypeIds.value.some(item => String(item) === String(id));
const extractId = (item: any): string | number | null => {
  if (item == null) return null;
  if (typeof item === "string" || typeof item === "number") return item;
  if (typeof item === "object" && "id" in item) return item.id as string | number;
  return null;
};

const toggleSelection = (item: HospitalProcedureTypeListing) => {
  if (isViewMode.value) return;

  const index = selectedHospitalProcedureTypeIds.value.findIndex((id) => String(id) === String(item.id));

  if (index === -1) {
    selectedHospitalProcedureTypeIds.value = [...selectedHospitalProcedureTypeIds.value, item.id];
    selectedHospitalProcedureTypes.value = [...selectedHospitalProcedureTypes.value, item];
    return;
  }

  selectedHospitalProcedureTypeIds.value = selectedHospitalProcedureTypeIds.value.filter((id) => String(id) !== String(item.id));
  selectedHospitalProcedureTypes.value = selectedHospitalProcedureTypes.value.filter((it) => String(it.id) !== String(item.id));
};

watch(selectedHospitalProcedureTypes, (newSelection) => {
  const ids = (newSelection || [])
    .map((item) => extractId(item))
    .filter((id): id is string | number => id !== null);

  selectedHospitalProcedureTypeIds.value = Array.from(new Set(ids));
}, { deep: true });

const syncVisibleSelection = () => {
  const visible = hospitalProcedureTypeStore.hospital_procedure_types || [];
  const selectedVisible = visible.filter(item => isIdSelected(item.id));

  const keptHidden = selectedHospitalProcedureTypes.value.filter(
    item => !visible.some(visibleItem => String(visibleItem.id) === String(item.id))
  );

  selectedHospitalProcedureTypes.value = [...keptHidden, ...selectedVisible];
};

const fetchHospitalProcedureTypes = async ({ page, itemsPerPage, sortBy, search }: any) => {
  await hospitalProcedureTypeStore.fetchHospitalProcedureTypes(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );

  syncVisibleSelection();
};

const fetchGroup = async () => {
  if (!groupId.value) return;

  const response = await hospitalProcedureGroupService.getHospitalProcedureGroupById(groupId.value);
  const group = (response as any)?.data ?? response;
  form.value = {
    id: String((group as any)?.id || ""),
    name: (group as any)?.name || "",
    description: (group as any)?.description || "",
    enabled: Boolean((group as any)?.enabled),
  };
};

const fetchRelations = async () => {
  if (!groupId.value) return;

  loadingRelations.value = true;
  try {
    const { content } = await hospitalProcedureGroupingService.getHospitalProcedureGroupings();

    const groupRelations = (content || []).filter((item: HospitalProcedureGroupingListing) => {
      const byDirect = item.hospitalProcedureGroupId != null && String(item.hospitalProcedureGroupId) === groupId.value;
      const byNested = item.hospitalProcedureGroup?.id != null && String(item.hospitalProcedureGroup.id) === groupId.value;
      return byDirect || byNested;
    });

    selectedHospitalProcedureTypeIds.value = groupRelations
      .map((item: HospitalProcedureGroupingListing) => item.hospitalProcedureTypeId ?? item.hospitalProcedureType?.id)
      .filter((id): id is string | number => id !== undefined && id !== null);

    syncVisibleSelection();
  } finally {
    loadingRelations.value = false;
  }
};

const validateForm = () => {
  let isValid = true;
  formErrors.value.name = "";

  if (!form.value.name?.trim()) {
    formErrors.value.name = t("t-please-enter-name-hospital-procedure-group");
    isValid = false;
  }

  return isValid;
};

const normalizeId = (value: string | number) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const saveRelationsByDeleteInsert = async () => {
  const { content } = await hospitalProcedureGroupingService.getHospitalProcedureGroupings();

  const currentGroupRelations = (content || []).filter((item: HospitalProcedureGroupingListing) => {
    const byDirect = item.hospitalProcedureGroupId != null && String(item.hospitalProcedureGroupId) === groupId.value;
    const byNested = item.hospitalProcedureGroup?.id != null && String(item.hospitalProcedureGroup.id) === groupId.value;
    return byDirect || byNested;
  });

  for (const relation of currentGroupRelations) {
    await hospitalProcedureGroupingService.deleteHospitalProcedureGrouping(relation.id);
  }

  if (!selectedHospitalProcedureTypeIds.value.length) return;

  await hospitalProcedureGroupingService.createHospitalProcedureGrouping({
    hospitalProcedureGroupId: normalizeId(groupId.value),
    hospitalProcedureTypeIds: selectedHospitalProcedureTypeIds.value.map((id) => normalizeId(id)),
  });
};

const onSave = async () => {
  if (!groupId.value) return;
  if (!validateForm()) {
    errorMsg.value = formErrors.value.name || t("t-message-save-error");
    return;
  }

  errorMsg.value = "";
  loading.value = true;

  try {
    const payload = {
      name: form.value.name,
      description: form.value.description,
      enabled: form.value.enabled,
    };

    normalizeObjectStringFieldsInPlace(payload as Record<string, any>, {
      name: "trimToEmpty",
      description: "trimToNull",
    });

    await hospitalProcedureGroupService.updateHospitalProcedureGroup(groupId.value, payload);
    await saveRelationsByDeleteInsert();

    toast.success(t("t-toast-message-update"));
    await fetchRelations();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  } finally {
    loading.value = false;
  }
};

const onBack = () => {
  router.push({ path: "/baseTable/hospitalproceduregroup/list" });
};

onMounted(async () => {
  await fetchHospitalProcedureTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
  await fetchGroup();
  await fetchRelations();
});
</script>

<template>
  <Card title="">
    <v-card-text>
      <v-card>
        <v-card-text class="pt-0">
          <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="w-100 mb-4" density="compact" />

          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-2">
                {{ $t('t-name') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="form.name" :placeholder="$t('t-enter-name')" :disabled="isViewMode" hide-details />
            </v-col>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-2">
                {{ $t('t-description') }}
              </div>
              <TextArea v-model="form.description" :placeholder="$t('t-enter-description')" :disabled="isViewMode" hide-details />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold">{{ $t('t-availability') }}</div>
              <v-checkbox v-model="form.enabled" :disabled="isViewMode" density="compact" color="primary" class="d-inline-flex">
                <template #label>
                  <span>{{ $t('t-is-enabled') }}</span>
                </template>
              </v-checkbox>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-card-text>
      <Card :title="$t('t-hospital-procedure-type-list')" title-class="pt-0" />

      <v-row class="mt-2">
        <v-col cols="12" lg="12">
          <v-card class="mt-3">
            <v-card-title class="mt-2">
              <v-row justify="space-between" align="center" no-gutters>
                <v-col lg="12">
                  <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-hospital-procedure-type')" />
                </v-col>
              </v-row>
            </v-card-title>

            <v-card-text>
              <DataTableServer
                v-model="selectedHospitalProcedureTypes"
                :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
                :items="orderedHospitalProcedureTypes"
                :items-per-page="itemsPerPage"
                :total-items="totalItems"
                :loading="loadingList"
                :search-query="searchQuery"
                :search-props="searchProps"
                item-value="id"
                @load-items="fetchHospitalProcedureTypes"
              >
                <template #body="{ items }">
                  <tr v-for="item in items as HospitalProcedureTypeListing[]" :key="item.id" height="50">
                    <td>
                      <v-checkbox
                        :model-value="isIdSelected(item.id)"
                        :disabled="isViewMode"
                        @update:model-value="toggleSelection(item)"
                        hide-details
                        density="compact"
                      />
                    </td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                  </tr>
                </template>

                <template v-if="!hospitalProcedureTypeStore.hospital_procedure_types.length" #body>
                  <tr>
                    <td :colspan="listViewHeader.length + 2" class="text-center py-10">
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
          </v-card>
        </v-col>
      </v-row>

      <v-card-actions class="d-flex justify-space-between">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack()">
          {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
        </v-btn>
        <v-btn v-if="!isViewMode" color="success" variant="elevated" :loading="loading" @click="onSave">
          {{ $t('t-save') }} <i class="ph-floppy-disk ms-2" />
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </Card>
</template>
