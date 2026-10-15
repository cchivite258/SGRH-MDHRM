<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue";
import { MAX_PAGE_SIZE } from "@/app/const";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

import { getApiErrorMessages } from "@/app/common/apiErrors";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import { hospitalProcedureGroupService, hospitalProcedureGroupingService } from "@/app/http/httpServiceProvider";
import { useHospitalProcedureCategoryStore } from "@/store/baseTables/hospitalProcedureCategoryStore";
import { useHospitalProcedureTypeStore } from "@/store/baseTables/hospitalProcedureTypeStore";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import type { HospitalProcedureTypeListing } from "@/components/baseTables/hospitalProcedureType/types";
import type { HospitalProcedureGroupingListing } from "@/components/baseTables/hospitalProcedureGrouping/types";
import { listViewHeader } from "@/components/baseTables/hospitalProcedureGroup/editHospitalProcedureGroup/listView/utils";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const hospitalProcedureCategoryStore = useHospitalProcedureCategoryStore();
const hospitalProcedureTypeStore = useHospitalProcedureTypeStore();

const groupId = computed(() => String(route.params.id || route.query.id || ""));
const loading = ref(false);
const loadingRelations = ref(false);
const searchQuery = ref("");
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedHospitalProcedureTypes = ref<HospitalProcedureTypeListing[]>([]);
const selectedHospitalProcedureTypeIds = ref<(string | number)[]>([]);
const selectedHospitalProcedureCategoryId = ref<string | number | "">("");
const insertByCategoryDialog = ref(false);
const errorMsg = ref("");
const insertByCategoryErrorMsg = ref("");
const searchProps = "code,name,description";
const allHospitalProcedureTypes = ref<HospitalProcedureTypeListing[]>([]);
const allProceduresPageSize = MAX_PAGE_SIZE;
const loadingCategoryGrouping = ref(false);
const currentGroupRelations = ref<HospitalProcedureGroupingListing[]>([]);

const form = ref({
  id: "",
  name: "",
  description: "",
  enabled: true,
});

const formErrors = ref<Record<string, string>>({
  name: "",
});

const loadingList = computed(() => hospitalProcedureTypeStore.loading || loadingRelations.value);

const hospitalProcedureCategories = computed(() =>
  (hospitalProcedureCategoryStore.hospital_procedure_categories_dropdown || []).map((item) => ({
    value: item.id,
    label: item.name,
  }))
);

const categoryByProcedureTypeId = computed<Record<string, string>>(() =>
  (currentGroupRelations.value || []).reduce<Record<string, string>>((acc, relation) => {
    const typeId = relation.hospitalProcedureType?.id ?? relation.hospitalProcedureTypeId;
    const categoryName = relation.hospitalProcedureType?.categoryName;

    if (typeId != null && categoryName) {
      acc[String(typeId)] = categoryName;
    }

    return acc;
  }, {})
);

const compareByName = (a: HospitalProcedureTypeListing, b: HospitalProcedureTypeListing) =>
  (a.name || "").localeCompare(b.name || "", "pt", { sensitivity: "base" });

const normalizeSearchValue = (value: string | null | undefined) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt");

const filteredHospitalProcedureTypes = computed(() => {
  const search = normalizeSearchValue(searchQuery.value.trim());
  const items = allHospitalProcedureTypes.value;

  if (!search) return items;

  return items.filter((item) => {
    const code = normalizeSearchValue(item.code);
    const name = normalizeSearchValue(item.name);
    const categoryName = normalizeSearchValue(categoryByProcedureTypeId.value[String(item.id)] || item.categoryName);
    const description = normalizeSearchValue(item.description);
    return code.includes(search) || name.includes(search) || categoryName.includes(search) || description.includes(search);
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
    .filter((id): id is string | number => id !== null);

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

  // Mantem o v-model da tabela alinhado com a fonte de verdade dos IDs.
  // Sem isto, a selecao antiga pode voltar a adicionar um item desmarcado.
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

    currentGroupRelations.value = content || [];

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
  const { content: currentGroupRelations } = await hospitalProcedureGroupingService.getHospitalProcedureGroupings(
    groupId.value,
    "hospitalProcedureGroup.id",
    "hospitalProcedureType,hospitalProcedureGroup"
  );

  for (const relation of currentGroupRelations || []) {
    await hospitalProcedureGroupingService.deleteHospitalProcedureGrouping(relation.id);
  }

  if (!selectedHospitalProcedureTypeIds.value.length) return;

  await hospitalProcedureGroupingService.createHospitalProcedureGrouping({
    hospitalProcedureGroupId: normalizeId(groupId.value),
    hospitalProcedureTypeIds: selectedHospitalProcedureTypeIds.value.map((id) => normalizeId(id)),
  });
};

const onAddProceduresFromCategory = async () => {
  if (!groupId.value || !selectedHospitalProcedureCategoryId.value) return;

  insertByCategoryErrorMsg.value = "";
  loadingCategoryGrouping.value = true;

  try {
    await hospitalProcedureGroupingService.createHospitalProcedureGroupingByCategory({
      hospitalProcedureCategoryId: normalizeId(selectedHospitalProcedureCategoryId.value),
      hospitalProcedureGroupId: normalizeId(groupId.value),
    });

    selectedHospitalProcedureCategoryId.value = "";
    insertByCategoryDialog.value = false;
    toast.success(t("t-toast-message-created"));
    await fetchRelations();
  } catch (error) {
    const messages = getApiErrorMessages(error, t("t-message-save-error"));
    insertByCategoryErrorMsg.value = messages[0] || t("t-message-save-error");
    messages.forEach((message) => toast.error(message));
  } finally {
    loadingCategoryGrouping.value = false;
  }
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

const onOpenInsertByCategoryDialog = () => {
  selectedHospitalProcedureCategoryId.value = "";
  insertByCategoryErrorMsg.value = "";
  insertByCategoryDialog.value = true;
};

onMounted(async () => {
  await hospitalProcedureCategoryStore.fetchHospitalProcedureCategoriesForDropdown(0, MAX_PAGE_SIZE);
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
      <Card :title="$t('t-hospital-procedure-type-list')" title-class="pt-0 pb-2">
        <template #title-action>
          <v-btn
            color="primary"
            variant="tonal"
            class="text-none"
            @click="onOpenInsertByCategoryDialog"
          >
            <i class="ph-plus-circle me-2" />
            {{ $t('t-insert-procedures-by-category') }}
          </v-btn>
        </template>
      </Card>

      <v-row class="mt-0">
        <v-col cols="12" lg="12">
          <v-card class="mt-1">
            <v-card-title class="pt-2 pb-2">
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
                    <td>{{ categoryByProcedureTypeId[String(item.id)] || item.categoryName || '-' }}</td>
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

  <v-dialog v-model="insertByCategoryDialog" width="520" max-width="95vw">
    <Card :title="$t('t-insert-procedures-by-category')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="insertByCategoryDialog = false" />
      </template>

      <v-divider />

      <v-card-text>
        <v-alert
          v-if="insertByCategoryErrorMsg"
          :text="insertByCategoryErrorMsg"
          variant="tonal"
          color="danger"
          class="mb-4"
          density="compact"
        />

        <v-row>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-hospital-procedure-category') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect
              v-model="selectedHospitalProcedureCategoryId"
              :items="hospitalProcedureCategories"
              :placeholder="$t('t-hospital-procedure-category')"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="insertByCategoryDialog = false">
          <i class="ph-x me-1" /> {{ $t('t-close') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loadingCategoryGrouping"
          :disabled="!selectedHospitalProcedureCategoryId || loadingCategoryGrouping"
          @click="onAddProceduresFromCategory"
        >
          {{ $t('t-insert') }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
