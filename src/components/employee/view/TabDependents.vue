<script lang="ts" setup>
/**
 * TabContacts - Componente para  de pessoas de contato de instituições
 * 
 * Funcionalidades:
 * - Listagem de contatos
 * - Criação/Edição de contatos
 * - Visualização de detalhes
 * - Exclusão de contatos
 */

import { ref, watch, computed, onMounted, onBeforeUnmount, PropType } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import { v4 as uuidv4 } from "uuid";


// Components
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import ListMenuWithIcon from "@/app/common/components/ListMenuWithIcon.vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import CreateEditDependentsDialog from "@/components/employee/create/CreateEditDependentsDialog.vue";
import ViewDependentsDialog from "@/components/employee/create/ViewDependentsDialog.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import TableActionView from "@/app/common/components/TableActionView.vue";
// Stores e Services
import { useDependentEmployeeStore } from "@/store/employee/dependentStore";
import { dependentEmployeeService } from "@/app/http/httpServiceProvider";

// Types
import type {
  DependentListingType,
  DependentInsertType
} from "@/components/employee/types";

// Utils
import { dependentHeader } from "@/components/employee/list/utils";
import { contactOptions as Options } from "@/components/institution/create/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const dependentStore = useDependentEmployeeStore();


// Utils
import {
  genderOptions,
  relationshipOptions
} from "@/components/employee/create/utils";

// props
const props = defineProps({
  employeeId: {
    type: String as PropType<string | null>,
    default: null
  }
});

// Modifique a lógica para usar o prop employeeId
const employeeId = ref(props.employeeId);

// constants
const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const dependentData = ref<DependentInsertType | DependentListingType | null>(null);
const deleteId = ref<string | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const searchProps = "firstName,middleName,lastName,gender,relationship,idCardNumber,idCardIssuer"; // Propriedades de busca
const itemsPerPage = ref(10);
const selectedDependentData = ref<DependentListingType[]>([]);

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed properties
const loadingList = computed(() => dependentStore.loading);
const totalItems = computed(() => dependentStore.pagination.totalElements);

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

/**
 * Busca pessoas de contato com paginação e filtros
 */
const fetchContactPersons = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!employeeId.value) return;

  await dependentStore.fetchDependentsEmployee(
    employeeId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};

//get dos enums
const getGenderLabel = (value: string) => {
  const option = genderOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getRelationshipLabel = (value: string) => {
  const option = relationshipOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};


/**
 * Alterna seleção de pessoas de contato
 */
const toggleSelection = (item: DependentListingType) => {
  const index = selectedDependentData.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedDependentData.value = [...selectedDependentData.value, item];
  } else {
    selectedDependentData.value = selectedDependentData.value.filter(selected => selected.id !== item.id);
  }
};

/**
 * Prepara dados para criação/edição
 */
watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    dependentData.value = null;
  }
});

/**
 * Prepara dados para visualização
 */
watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    dependentData.value = null;
  }
});
const onViewClick = (data: DependentInsertType | DependentListingType) => {
  dependentData.value = { ...data };
  viewDialog.value = true;
};



// Limpeza ao desmontar
onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});
</script>

<template>
  <Card :title="$t('t-dependent-list')" title-class="py-5">
    <template #title-action>
      <div>
        <!--<v-btn color="secondary" class="mx-1">
          <i class="ph-download-simple me-1" /> {{ $t('t-import') }}
        </v-btn>
        <v-btn color="info" class="mx-1" variant="tonal">
          <i class="ph-upload-simple me-1" /> {{ $t('t-export') }}
        </v-btn>-->
      </div>
    </template>
  </Card>

  <v-row class="mt-5">
    <v-col cols="12" lg="12">
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="12">
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-dependent')" />
          </v-col>
        </v-row>
      </v-card-text>
      <DataTableServer v-model="selectedDependentData"
        :headers="dependentHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="dependentStore.dependents" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" @load-items="fetchContactPersons"
        item-value="id" show-select>
        <template #body="{ items }">
          <tr v-for="item in items as DependentListingType[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedDependentData.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ item.firstName }} {{ item.lastName }}</td>
            <td>{{ getGenderLabel(item.gender) }}</td>
            <td>{{ getRelationshipLabel(item.relationship) }}</td>
            <td>{{ item.idCardNumber }}</td>
            <td>
              <Status :status="item.enabled ? 'enabled' : 'disabled'" />
            </td>
            <td>
              <TableActionView  @onView="onViewClick(item)"/>
            </td>
          </tr>
        </template>

        <template v-if="dependentStore.dependents.length === 0" #body>
          <tr>
            <td :colspan="dependentHeader.length" class="text-center py-10">
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
    </v-col>
  </v-row>

  <!-- Dialogs -->
  <ViewDependentsDialog v-model="viewDialog" :data="dependentData" />

  <v-card-actions class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 3)">
      {{ $t('t-salary-review') }}
    </v-btn>

  </v-card-actions>
</template>
