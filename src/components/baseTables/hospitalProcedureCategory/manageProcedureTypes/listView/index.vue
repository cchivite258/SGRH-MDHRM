<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

import DataTableServer from "@/app/common/components/DataTableServer.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import {
  hospitalProcedureCategoryService,
  hospitalProcedureCategoryTypesService
} from "@/app/http/httpServiceProvider";
import { useHospitalProcedureTypeStore } from "@/store/baseTables/hospitalProcedureTypeStore";
import type { EntityId, HospitalProcedureCategoryTypesListing } from "@/components/baseTables/hospitalProcedureCategoryTypes/types";
import type { HospitalProcedureTypeListing } from "@/components/baseTables/hospitalProcedureType/types";
import { listViewHeader } from "@/components/baseTables/hospitalProcedureCategory/manageProcedureTypes/listView/utils";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const hospitalProcedureTypeStore = useHospitalProcedureTypeStore();

const categoryId = computed(() => String(route.params.id || route.query.id || ""));
const loading = ref(false);
const loadingCategory = ref(false);
const loadingRelations = ref(false);
const searchQuery = ref("");
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedHospitalProcedureTypes = ref<HospitalProcedureTypeListing[]>([]);
const selectedHospitalProcedureTypeIds = ref<EntityId[]>([]);
const currentRelations = ref<HospitalProcedureCategoryTypesListing[]>([]);
const allHospitalProcedureTypes = ref<HospitalProcedureTypeListing[]>([]);
const errorMsg = ref("");
const searchProps = "code,name,description";
const allProceduresPageSize = 10000000;

const form = ref({
  id: "",
  name: "",
  description: "",
  enabled: true,
});

const formErrors = ref<Record<string, string>>({
  name: "",
});

const loadingList = computed(() => hospitalProcedureTypeStore.loading || loadingRelations.value || loadingCategory.value);

const normalizeSearchValue = (value: string | null | undefined) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt");

const compareByName = (a: HospitalProcedureTypeListing, b: HospitalProcedureTypeListing) =>
  (a.name || "").localeCompare(b.name || "", "pt", { sensitivity: "base" });

const isIdSelected = (id: EntityId) => selectedHospitalProcedureTypeIds.value.some(item => String(item) === String(id));

const filteredHospitalProcedureTypes = computed(() => {
  const search = normalizeSearchValue(searchQuery.value.trim());
  const items = allHospitalProcedureTypes.value;

  if (!search) return items;

  return items.filter((item) => {
    const code = normalizeSearchValue(item.code);
    const name = normalizeSearchValue(item.name);
    const description = normalizeSearchValue(item.description);
    return code.includes(search) || name.includes(search) || description.includes(search);
  });
});

const orderedHospitalProcedureTypes = computed(() => {
  const items = [...filteredHospitalProcedureTypes.value];

  return items.sort((a, b) => {
    const aSelected = isIdSelected(a.id) ? 0 : 1;
    const bSelected = isIdSelected(b.id) ? 0 : 1;

    if (aSelected !== bSelected) {
      return aSelected - bSelected;
    }

    return compareByName(a, b);
  });
});

const totalItems = computed(() => orderedHospitalProcedureTypes.value.length);

const displayedHospitalProcedureTypes = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return orderedHospitalProcedureTypes.value.slice(start, start + itemsPerPage.value);
});

const filteredHospitalProcedureTypeIds = computed(() => filteredHospitalProcedureTypes.value.map((item) => item.id));
const allFilteredHospitalProcedureTypesSelected = computed(() =>
  filteredHospitalProcedureTypeIds.value.length > 0 &&
  filteredHospitalProcedureTypeIds.value.every((id) => isIdSelected(id))
);
const someFilteredHospitalProcedureTypesSelected = computed(() =>
  filteredHospitalProcedureTypeIds.value.some((id) => isIdSelected(id))
);

const extractId = (item: unknown): EntityId | null => {
  if (item == null) return null;
  if (typeof item === "string" || typeof item === "number") return item;
  if (typeof item === "object" && "id" in (item as Record<string, unknown>)) {
    return (item as { id?: EntityId }).id ?? null;
  }
  return null;
};

const syncVisibleSelection = () => {
  const visible = allHospitalProcedureTypes.value;
  const selectedVisible = visible.filter((item) => isIdSelected(item.id));

  const keptHidden = selectedHospitalProcedureTypes.value.filter(
    (item) => !visible.some((visibleItem) => String(visibleItem.id) === String(item.id))
  );

  selectedHospitalProcedureTypes.value = [...keptHidden, ...selectedVisible];
};

watch(selectedHospitalProcedureTypes, (newSelection) => {
  const selectedIds = (newSelection || [])
    .map((item) => extractId(item))
    .filter((id): id is EntityId => id !== null);

  const visibleIds = allHospitalProcedureTypes.value.map((item) => item.id);
  const hiddenSelectedIds = selectedHospitalProcedureTypeIds.value.filter(
    (id) => !visibleIds.some((visibleId) => String(visibleId) === String(id))
  );

  selectedHospitalProcedureTypeIds.value = Array.from(new Set([...hiddenSelectedIds, ...selectedIds]));
}, { deep: true });

const toggleSelection = (item: HospitalProcedureTypeListing) => {
  const index = selectedHospitalProcedureTypeIds.value.findIndex((id) => String(id) === String(item.id));

  if (index === -1) {
    selectedHospitalProcedureTypeIds.value = [...selectedHospitalProcedureTypeIds.value, item.id];
  } else {
    selectedHospitalProcedureTypeIds.value = selectedHospitalProcedureTypeIds.value.filter(
      (id) => String(id) !== String(item.id)
    );
  }

  syncVisibleSelection();
};

const toggleAllFilteredSelection = (checked: boolean | null) => {
  const targetIds = filteredHospitalProcedureTypeIds.value;

  if (checked) {
    selectedHospitalProcedureTypeIds.value = Array.from(new Set([
      ...selectedHospitalProcedureTypeIds.value,
      ...targetIds,
    ]));
  } else {
    selectedHospitalProcedureTypeIds.value = selectedHospitalProcedureTypeIds.value.filter(
      (id) => !targetIds.some((targetId) => String(targetId) === String(id))
    );
  }

  syncVisibleSelection();
};

const fetchHospitalProcedureTypes = async ({ page, itemsPerPage: perPage, sortBy, search }: any) => {
  currentPage.value = page || 1;
  itemsPerPage.value = perPage || itemsPerPage.value;
  searchQuery.value = search || "";

  if (allHospitalProcedureTypes.value.length) {
    syncVisibleSelection();
    return;
  }

  await hospitalProcedureTypeStore.fetchHospitalProcedureTypes(
    0,
    allProceduresPageSize,
    sortBy?.[0]?.key || "name",
    sortBy?.[0]?.order || "asc",
    "",
    searchProps
  );

  allHospitalProcedureTypes.value = hospitalProcedureTypeStore.hospital_procedure_types || [];
  syncVisibleSelection();
};

const fetchCategory = async () => {
  if (!categoryId.value) return;

  const requestedCategoryId = categoryId.value;
  loadingCategory.value = true;
  try {
    const response = await hospitalProcedureCategoryService.getHospitalProcedureCategoryById(requestedCategoryId);
    if (categoryId.value !== requestedCategoryId) return;

    const category = (response as any)?.data ?? response;

    form.value = {
      id: String((category as any)?.id || ""),
      name: (category as any)?.name || "",
      description: (category as any)?.description || "",
      enabled: Boolean((category as any)?.enabled),
    };
  } finally {
    loadingCategory.value = false;
  }
};

const extractProcedureTypeId = (relation: HospitalProcedureCategoryTypesListing): EntityId | null => {
  return relation.hospitalProcedureType?.id ?? relation.hospitalProcedureTypeId ?? null;
};

const resetProcedureTypeSelection = () => {
  currentRelations.value = [];
  selectedHospitalProcedureTypes.value = [];
  selectedHospitalProcedureTypeIds.value = [];
};

const fetchRelations = async () => {
  if (!categoryId.value) return;

  const requestedCategoryId = categoryId.value;
  resetProcedureTypeSelection();
  loadingRelations.value = true;
  try {
    const { content } = await hospitalProcedureCategoryTypesService.getHospitalProcedureCategoryTypesByCategory(requestedCategoryId);
    if (categoryId.value !== requestedCategoryId) return;

    currentRelations.value = content || [];
    selectedHospitalProcedureTypeIds.value = currentRelations.value
      .map((item) => extractProcedureTypeId(item))
      .filter((id): id is EntityId => id !== null);

    syncVisibleSelection();
  } finally {
    loadingRelations.value = false;
  }
};

const normalizeId = (value: EntityId) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
};

const saveRelationsByDeleteInsert = async () => {
  const relationIds = currentRelations.value
    .map((relation) => relation.id)
    .filter((id): id is EntityId => id !== undefined && id !== null);

  if (relationIds.length) {
    await hospitalProcedureCategoryTypesService.bulkDeleteHospitalProcedureCategoryTypes({
      ids: relationIds
    });
  }

  if (!selectedHospitalProcedureTypeIds.value.length) return;

  await hospitalProcedureCategoryTypesService.createHospitalProcedureCategoryTypes({
    hospitalProcedureCategorypId: normalizeId(categoryId.value),
    hospitalProcedureTypeIds: selectedHospitalProcedureTypeIds.value.map((id) => normalizeId(id)),
  });
};

const validateForm = () => {
  let isValid = true;
  formErrors.value.name = "";

  if (!form.value.name?.trim()) {
    formErrors.value.name = t("t-please-enter-name-hospital-procedure-category");
    isValid = false;
  }

  return isValid;
};

const onSave = async () => {
  if (!categoryId.value) return;
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

    await hospitalProcedureCategoryService.updateHospitalProcedureCategory(categoryId.value, payload);
    await saveRelationsByDeleteInsert();

    toast.success(t("t-toast-message-update"));
    await fetchCategory();
    await fetchRelations();
  } catch (error) {
    const messages = getApiErrorMessages(error, t("t-message-save-error"));
    errorMsg.value = messages[0] || t("t-message-save-error");
    messages.forEach((message) => toast.error(message));
  } finally {
    loading.value = false;
  }
};

const onBack = () => {
  router.push({ path: "/baseTable/hospitalprocedurecategory/list" });
};

watch(categoryId, async (newCategoryId, oldCategoryId) => {
  if (!newCategoryId || newCategoryId === oldCategoryId) return;

  resetProcedureTypeSelection();

  try {
    await fetchCategory();
    await fetchRelations();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  }
});

onMounted(async () => {
  try {
    await fetchHospitalProcedureTypes({ page: 1, itemsPerPage: itemsPerPage.value, sortBy: [], search: "" });
    await fetchCategory();
    await fetchRelations();
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach((message) => toast.error(message));
  }
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
              <TextField
                v-model="form.name"
                :placeholder="$t('t-enter-name')"
                hide-details
              />
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
                v-model:page="currentPage"
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
                <template #header.data-table-select>
                  <v-checkbox
                    :model-value="allFilteredHospitalProcedureTypesSelected"
                    :indeterminate="someFilteredHospitalProcedureTypesSelected && !allFilteredHospitalProcedureTypesSelected"
                    :disabled="!filteredHospitalProcedureTypeIds.length"
                    hide-details
                    density="compact"
                    @update:model-value="toggleAllFilteredSelection"
                  />
                </template>

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
                    <td>{{ item.code || '-' }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                  </tr>
                </template>

                <template v-if="!orderedHospitalProcedureTypes.length" #body>
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
