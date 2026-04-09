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

const groupId = computed(() => String(route.params.id || route.query.id || ""));
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
  const items = hospitalProcedureTypeStore.hospital_procedure_types || [];
  const selected = items.filter((item) => isIdSelected(item.id));
  const notSelected = items.filter((item) => !isIdSelected(item.id));
  return [...selected, ...notSelected];
});
const displayedHospitalProcedureTypes = computed(() => {
  return orderedHospitalProcedureTypes.value;
});

const isIdSelected = (id: string | number) => selectedHospitalProcedureTypeIds.value.some(item => String(item) === String(id));
const extractId = (item: unknown): string | number | null => {
  if (item == null) return null;
  if (typeof item === "string" || typeof item === "number") return item;
  if (typeof item === "object" && "id" in (item as Record<string, unknown>)) {
    return (item as { id?: string | number }).id ?? null;
  }
  return null;
};

const syncVisibleSelection = () => {
  const visible = hospitalProcedureTypeStore.hospital_procedure_types || [];
  const selectedVisible = visible.filter((item) => isIdSelected(item.id));

  const keptHidden = selectedHospitalProcedureTypes.value.filter(
    (item) => !visible.some((visibleItem) => String(visibleItem.id) === String(item.id))
  );

  selectedHospitalProcedureTypes.value = [...keptHidden, ...selectedVisible];
};

watch(selectedHospitalProcedureTypes, (newSelection) => {
  const selectedIds = (newSelection || [])
    .map((item) => extractId(item))
    .filter((id): id is string | number => id !== null);

  const visibleIds = (hospitalProcedureTypeStore.hospital_procedure_types || []).map((item) => item.id);
  const hiddenSelectedIds = selectedHospitalProcedureTypeIds.value.filter(
    (id) => !visibleIds.some((visibleId) => String(visibleId) === String(id))
  );

  selectedHospitalProcedureTypeIds.value = Array.from(new Set([...hiddenSelectedIds, ...selectedIds]));
}, { deep: true });

const toggleSelection = (item: HospitalProcedureTypeListing) => {
  const index = selectedHospitalProcedureTypeIds.value.findIndex((id) => String(id) === String(item.id));

  if (index === -1) {
    selectedHospitalProcedureTypeIds.value = [...selectedHospitalProcedureTypeIds.value, item.id];
    return;
  }

  selectedHospitalProcedureTypeIds.value = selectedHospitalProcedureTypeIds.value.filter((id) => String(id) !== String(item.id));
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
    const { content } = await hospitalProcedureGroupingService.getHospitalProcedureGroupings(
      groupId.value,
      "hospitalProcedureGroup.id",
      "hospitalProcedureType,hospitalProcedureGroup"
    );

    selectedHospitalProcedureTypeIds.value = (content || [])
      .map((item: HospitalProcedureGroupingListing) => item.hospitalProcedureType?.id ?? item.hospitalProcedureTypeId)
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
              <TextField v-model="form.name" :placeholder="$t('t-enter-name')" hide-details />
            </v-col>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-2">
                {{ $t('t-description') }}
              </div>
              <TextArea v-model="form.description" :placeholder="$t('t-enter-description')" hide-details />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold">{{ $t('t-availability') }}</div>
              <v-checkbox v-model="form.enabled" density="compact" color="primary" class="d-inline-flex">
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
                :items="displayedHospitalProcedureTypes"
                :items-per-page="itemsPerPage"
                :total-items="totalItems"
                :loading="loadingList"
                :search-query="searchQuery"
                :search-props="searchProps"
                item-value="id"
                :show-select="true"
                @load-items="fetchHospitalProcedureTypes"
              >
                <template #body="{ items }">
                  <tr v-for="item in items as HospitalProcedureTypeListing[]" :key="item.id" height="50">
                    <td>
                      <v-checkbox
                        :model-value="isIdSelected(item.id)"
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
                    <td :colspan="listViewHeader.length + 1" class="text-center py-10">
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
        <v-btn color="success" variant="elevated" :loading="loading" @click="onSave">
          {{ $t('t-save') }} <i class="ph-floppy-disk ms-2" />
        </v-btn>
      </v-card-actions>
    </v-card-text>
  </Card>
</template>
