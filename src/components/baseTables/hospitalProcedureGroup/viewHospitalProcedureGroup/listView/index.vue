<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import { hospitalProcedureGroupService, hospitalProcedureGroupingService } from "@/app/http/httpServiceProvider";
import { useHospitalProcedureTypeStore } from "@/store/baseTables/hospitalProcedureTypeStore";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import type { HospitalProcedureTypeListing } from "@/components/baseTables/hospitalProcedureType/types";
import type { HospitalProcedureGroupingListing } from "@/components/baseTables/hospitalProcedureGrouping/types";
import { listViewHeader } from "@/components/baseTables/hospitalProcedureGroup/editHospitalProcedureGroup/listView/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const hospitalProcedureTypeStore = useHospitalProcedureTypeStore();

const groupId = computed(() => String(route.params.id || ""));
const loadingRelations = ref(false);
const searchQuery = ref("");
const itemsPerPage = ref(10);
const selectedHospitalProcedureTypeIds = ref<(string | number)[]>([]);
const searchProps = "name,description";

const form = ref({
  id: "",
  name: "",
  description: "",
  enabled: true,
});

const totalItems = computed(() => hospitalProcedureTypeStore.pagination.totalElements);
const loadingList = computed(() => hospitalProcedureTypeStore.loading || loadingRelations.value);

const isIdSelected = (id: string | number) => selectedHospitalProcedureTypeIds.value.some(item => String(item) === String(id));

const displayedHospitalProcedureTypes = computed(() => {
  const selected = (hospitalProcedureTypeStore.hospital_procedure_types || []).filter((item) => isIdSelected(item.id));
  return [...selected].sort((a, b) => (a.name || "").localeCompare((b.name || ""), undefined, { sensitivity: "base" }));
});

const fetchHospitalProcedureTypes = async ({ page, itemsPerPage, sortBy, search }: any) => {
  await hospitalProcedureTypeStore.fetchHospitalProcedureTypes(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "name",
    sortBy[0]?.order || "asc",
    search,
    searchProps
  );
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
  } finally {
    loadingRelations.value = false;
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
          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-1">{{ $t('t-name') }}</div>
              <div>{{ form.name || "-" }}</div>
            </v-col>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-1">{{ $t('t-description') }}</div>
              <div>{{ form.description || "-" }}</div>
            </v-col>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-1">{{ $t('t-availability') }}</div>
              <div>{{ form.enabled ? $t('t-enabled') : $t('t-disabled') }}</div>
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
            <v-card-text>
              <DataTableServer
                :headers="listViewHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
                :items="displayedHospitalProcedureTypes"
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
                    <td>{{ item.name }}</td>
                    <td>{{ item.description }}</td>
                  </tr>
                </template>

                <template v-if="!displayedHospitalProcedureTypes.length" #body>
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
      </v-card-actions>
    </v-card-text>
  </Card>
</template>
