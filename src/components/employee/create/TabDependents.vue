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
import TableAction from "@/app/common/components/TableAction.vue";
// Stores e Services
import { useDependentEmployeeStore } from "@/store/employee/dependentStore";
import { dependentEmployeeService, employeeService } from "@/app/http/httpServiceProvider";

// Types
import type {
  DependentListingType,
  DependentInsertType
} from "@/components/employee/types";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";

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
const employeeAlertFlag = ref<string | undefined>(undefined);

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed properties
const loadingList = computed(() => dependentStore.loading);
const totalItems = computed(() => dependentStore.pagination.totalElements);

const showDependentApiErrors = (error: unknown, fallbackKey = "t-message-save-error") => {
  const messages = getApiErrorMessages(error, t(fallbackKey));
  if (messages.length > 0) {
    messages.forEach((message) => toast.error(message));
    return;
  }

  toast.error(t(fallbackKey));
};

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

const getEmployeeAlertMessage = () => {
  if (employeeAlertFlag.value === 'EXCEEDS_NUMBER_OF_DEPENDENTS') {
    return t('t-exceeds-number-of-dependents');
  }
  return '';
};

const fetchEmployeeAlertFlag = async () => {
  if (!employeeId.value) return;
  try {
    const response = await employeeService.getEmployeeById(employeeId.value);
    employeeAlertFlag.value = response?.data?.alertFlag;
  } catch (error) {
    console.error("Erro ao buscar alertFlag do colaborador:", error);
  }
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
const onCreateEditClick = (data: DependentInsertType | DependentListingType | null) => {
  const employee = employeeId.value || "";

  dependentData.value = data
    ? {
      ...data,
      employee: employee // sobrescreve com o employeeId atual
    }
    : {
      id: undefined,
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      birthDate: undefined,
      relationship: "",
      isUnivesityStudent: false,
      employee: employee,
      idCardNumber: "",
      idCardIssuer: "",
      idCardExpiryDate: undefined,
      idCardIssuanceDate: undefined,
      enabled: true
    };

  dialog.value = true;
};


/**
 * Submete dados do formulário
 */
interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiErrorResponse;
}

const onSubmit = async (
  data: DependentInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: unknown) => void,
    onFinally?: () => void
  }
) => {
  try {
    let response: ServiceResponse<DependentListingType>;

    if (!data.id) {
      response = await dependentEmployeeService.createDependent(data);
    } else {
      response = await dependentEmployeeService.updateDependent(data.id, data);
    }

    if (response?.status === "error") {
      callbacks?.onError?.(response.error);
      return;
    }

    toast.success(
      data.id
        ? t("t-toast-message-update")
        : t("t-toast-message-created")
    );

    await dependentStore.fetchDependentsEmployee(
      employeeId.value,
      0,
      itemsPerPage.value
    );
    await fetchEmployeeAlertFlag();

    if (employeeAlertFlag.value === 'EXCEEDS_NUMBER_OF_DEPENDENTS') {
      toast.warning(t('t-exceeds-number-of-dependents'));
    }

    callbacks?.onSuccess?.();

  } catch (error: any) {
    console.error("Erro ao gravar dependentes:", error);
    showDependentApiErrors(error, "t-message-save-error");
    callbacks?.onError?.(error);
  } finally {
    callbacks?.onFinally?.();
  }
};


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

/**
 * Prepara exclusão de contato
 */
const onDelete = (id: string) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

/**
 * Confirma exclusão de contato
 */
const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    await dependentEmployeeService.deleteDependent(deleteId.value);
    selectedDependentData.value = selectedDependentData.value.filter(
      user => user.id !== deleteId.value
    );
    await dependentStore.fetchDependentsEmployee(
      employeeId.value,
      0,
      itemsPerPage.value
    );
    await fetchEmployeeAlertFlag();
    if (employeeAlertFlag.value === 'EXCEEDS_NUMBER_OF_DEPENDENTS') {
      toast.warning(t('t-exceeds-number-of-dependents'));
    }
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    showDependentApiErrors(error, "t-toast-message-deleted-erros");
    console.error("Delete error:", error);
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = null;
  }
};


// Limpeza ao desmontar
onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});

onMounted(async () => {
  await fetchEmployeeAlertFlag();
});
</script>

<template>
  <Card :title="$t('t-dependent-list')" title-class="py-5">
    <template #title-action>
      <div>
        <v-btn color="secondary" class="mx-1" @click="onCreateEditClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-dependent') }}
        </v-btn>
        <!--<v-btn color="secondary" class="mx-1">
          <i class="ph-download-simple me-1" /> {{ $t('t-import') }}
        </v-btn>
        <v-btn color="info" class="mx-1" variant="tonal">
          <i class="ph-upload-simple me-1" /> {{ $t('t-export') }}
        </v-btn>-->
      </div>
    </template>
  </Card>
  <v-alert v-if="getEmployeeAlertMessage()" type="warning" variant="tonal" class="mt-4">
    {{ getEmployeeAlertMessage() }}
  </v-alert>

  <v-row class="mt-3">
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
              <TableAction @onEdit="onCreateEditClick(item)" @onView="onViewClick(item)"
                @onDelete="onDelete(item.id)" />
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
  <CreateEditDependentsDialog v-model="dialog" :data="dependentData" @onSubmit="onSubmit" />
  <ViewDependentsDialog v-model="viewDialog" :data="dependentData" />
  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="onConfirmDelete" />

  <v-card-actions class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 3)">
      <i class="ph-arrow-left me-2" /> {{ $t('t-back-to-salary-review') }}
    </v-btn>

    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 5)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>
  </v-card-actions>
</template>
