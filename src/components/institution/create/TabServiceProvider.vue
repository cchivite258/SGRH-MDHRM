<script lang="ts" setup>
/**
 * TabServiceProviders - Componente para  de prestadores de serviço que tem convenio com entidades
 *
 * Funcionalidades:
 * - Listagem de clínicas
 * - Criação/Edição de clínicas
 * - Visualização de detalhes
 * - Exclusão de clínicas
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
import CreateEditServiceProviderDialog from "@/components/institution/create/CreateEditServiceProviderDialog.vue";
import ViewServiceProviderDialog from "@/components/institution/create/ViewServiceProviderDialog.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import TableActionSimplified from "@/app/common/components/TableActionSimplified.vue";

// Stores e Services
import { useServiceProviderInstitutionStore } from "@/store/institution/serviceProviderInstitutionStore";
import { serviceProviderInstitutionService } from "@/app/http/httpServiceProvider";

// Types
import type {
  ServiceProviderListingType,
  ServiceProviderInsertType
} from "@/components/institution/types";

// Utils
import { serviceProviderHeader } from "@/components/institution/create/utils";
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import { getApiErrorMessages } from "@/app/common/apiErrors";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const serviceProviderInstitutionStore = useServiceProviderInstitutionStore();



// props
const props = defineProps({
  institutionId: {
    type: String as PropType<string | null>,
    default: null
  },
  isViewMode: {
    type: Boolean,
    default: false
  }
});

// Modifique a lógica para usar o prop institutionId
const institutionId = ref(props.institutionId);


//console.log("Institution ID------------------------:", institutionId.value);

const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const serviceProviderData = ref<ServiceProviderInsertType | null>(null);
const serviceProviderViewData = ref<ServiceProviderListingType | null>(null);
const deleteId = ref<string | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const searchProps = "serviceProvider,company"; // Propriedades de busca
const itemsPerPage = ref(10);
const selectedServiceProviders = ref<ServiceProviderListingType[]>([]);

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed properties
const loadingList = computed(() => serviceProviderInstitutionStore.loading);
const totalItems = computed(() => serviceProviderInstitutionStore.pagination.totalElements);

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

/**
 * Busca clínicas com paginação e filtros
 */
const fetchInstitutionServiceProviders = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!institutionId.value) return;
  //console.log("Fetching clinics for institution:", institutionId.value, "Page:", page, "Items per page:", itemsPerPage, "Sort by:", sortBy, "Search props:", searchProps);

  await serviceProviderInstitutionStore.fetchInstitutionServiceProviders(
    institutionId.value,
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};

/**
 * Alterna seleção de pessoas de contato
 */
const toggleSelection = (item: ServiceProviderListingType) => {
  const index = selectedServiceProviders.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedServiceProviders.value = [...selectedServiceProviders.value, item];
  } else {
    selectedServiceProviders.value = selectedServiceProviders.value.filter(selected => selected.id !== item.id);
  }
};

/**
 * Prepara dados para criação/edição
 */
watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    serviceProviderData.value = null;
  }
});
const onCreateEditClick = (data: ServiceProviderInsertType | null) => {
  const company = institutionId.value || "";

  serviceProviderData.value = data
    ? {
      ...data,
      company: company // sobrescreve com o institutionId atual
    }
    : {
      id: undefined,
      serviceProvider: "",
      company: company,
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


/**
 * Submete dados do formulário
 */
const onSubmit = async (
  data: ServiceProviderInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }
) => {
  try {
    let response: ServiceResponse<ServiceProviderListingType>;

    if (!data.id) {
      response = await serviceProviderInstitutionService.createServiceProvider(data);
    } else {
      response = await serviceProviderInstitutionService.updateServiceProvider(data.id, data);
    }


    // Verifica se a resposta contém erro
    if (response.status === 'error') {
      getApiErrorMessages(response.error, t('t-message-save-error')).forEach((message) => toast.error(message));
      callbacks?.onError?.({ error: response.error });
      return;
    }

    // Só mostra sucesso se realmente foi bem-sucedido
    toast.success(data.id ? t('t-toast-message-update') : t('t-toast-message-created'));


    await serviceProviderInstitutionStore.fetchInstitutionServiceProviders(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    callbacks?.onSuccess?.();

  } catch (error) {
    console.error("Erro ao gravar provedor de servico:", error);
    getApiErrorMessages(error, t('t-message-save-error')).forEach((message) => toast.error(message));
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
    serviceProviderViewData.value = null;
  }
});
const onViewClick = (data: ServiceProviderListingType) => {
  serviceProviderViewData.value = { ...data };
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
    await serviceProviderInstitutionService.deleteServiceProvider(deleteId.value);
    selectedServiceProviders.value = selectedServiceProviders.value.filter(
      user => user.id !== deleteId.value
    );
    await serviceProviderInstitutionStore.fetchInstitutionServiceProviders(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    toast.error(t('t-toast-message-deleted-erros'));
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
</script>

<template>
  <Card :title="$t('t-service-provider-list')" title-class="py-5">
    <template v-if="!props.isViewMode" #title-action>
      <div>
        <v-btn color="primary" class="mx-1" @click="onCreateEditClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-service-provider') }} 
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

  <v-row class="mt-5">
    <v-col cols="12" lg="12">
      <!--v-card-text
        <v-row>
          <v-col cols="12" lg="12">
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-clinic')" />
          </v-col>
        </v-row>
      </v-card-text>-->
      <DataTableServer v-model="selectedServiceProviders"
        :headers="serviceProviderHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="serviceProviderInstitutionStore.service_providers" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps"
        @load-items="fetchInstitutionServiceProviders" item-value="id" :show-select="!props.isViewMode">
        <template #body="{ items }">
          <tr v-for="item in items as ServiceProviderListingType[]" :key="item.id" height="50">
            <td v-if="!props.isViewMode">
              <v-checkbox :model-value="selectedServiceProviders.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ item.serviceProvider.name }}</td>
            <td class="text-end">
              <v-btn
                v-if="props.isViewMode"
                icon
                size="small"
                variant="tonal"
                color="primary"
                @click="onViewClick(item)"
              >
                <i class="ph-eye" />
              </v-btn>
              <TableActionSimplified v-else @onView="onViewClick(item)" @onDelete="onDelete(item.id)" />
            </td>
          </tr>
        </template>

        <template v-if="serviceProviderInstitutionStore.service_providers.length === 0" #body>
          <tr>
            <td :colspan="serviceProviderHeader.length" class="text-center py-10">
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
  <CreateEditServiceProviderDialog v-model="dialog" :data="serviceProviderData" @onSubmit="onSubmit" />
  <ViewServiceProviderDialog v-model="viewDialog" :data="serviceProviderViewData" />
  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="onConfirmDelete" />

  <v-card-actions v-if="!props.isViewMode" class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 5)">
      {{ $t('t-back-to-contact-person') }} <i class="ph-arrow-left ms-2" />
    </v-btn>
    <v-btn color="success" variant="elevated" @click="$emit('onStepChange', 7)">
      {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>
  </v-card-actions>
</template>
