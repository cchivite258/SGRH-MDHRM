<script lang="ts" setup>
/**
 * TabContacts - Componente para  de pessoas de contato de contratos
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
import CreateEditContactDialog from "@/components/institution/create/CreateEditContactDialog.vue";
import ViewContactDialog from "@/components/institution/create/ViewContactDialog.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import TableAction from "@/app/common/components/TableAction.vue";
// Stores e Services
import { useContactPersonStore } from "@/store/institution/contactPersonStore";
import { contactPersonService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";

// Types
import type {
  ContactPersonListingType,
  ContactPersonInsertType
} from "@/components/institution/types";

// Utils
import { contactPersonHeader } from "@/components/institution/create/utils";
import { contactOptions as Options } from "@/components/institution/create/utils";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const contactPersonStore = useContactPersonStore();

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

// constants
const dialog = ref(false);
const viewDialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const contactPersonData = ref<ContactPersonInsertType | null>(null);
const deleteId = ref<string | null>(null);
const errorMsg = ref("");
const searchQuery = ref("");
const searchProps = "fullname,email,phone"; // Propriedades de busca
const itemsPerPage = ref(10);
const selectedContactPersons = ref<ContactPersonListingType[]>([]);
const customerDetail = ref<any>(null); // Adicionado para resolver o erro

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

// Computed properties
const loadingList = computed(() => contactPersonStore.loading);
const totalItems = computed(() => contactPersonStore.pagination.totalElements);

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
  if (!institutionId.value) return;

  await contactPersonStore.fetchContactPersons(
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
const toggleSelection = (item: ContactPersonListingType) => {
  const index = selectedContactPersons.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedContactPersons.value = [...selectedContactPersons.value, item];
  } else {
    selectedContactPersons.value = selectedContactPersons.value.filter(selected => selected.id !== item.id);
  }
};

/**
 * Prepara dados para criação/edição
 */
watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    contactPersonData.value = null;
  }
});
const onCreateEditClick = (data: ContactPersonInsertType | null) => {
  const company = institutionId.value || "";

  contactPersonData.value = data
    ? {
      ...data,
      company: company // sobrescreve com o institutionId atual
    }
    : {
      id: undefined,
      fullname: "",
      phone: "",
      email: "",
      company: company,
      enabled: true
    };

  dialog.value = true;
};


/**
 * Submete dados do formulário
 */
const onSubmit = async (
  data: ContactPersonInsertType,
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }
) => {
  try {
    if (!data.id) {
      await contactPersonService.createContactPerson(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await contactPersonService.updateContactPerson(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    await contactPersonStore.fetchContactPersons(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    callbacks?.onSuccess?.();
  } catch (error) {
    console.error("Erro ao gravar pessoa de contacto:", error);
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
    contactPersonData.value = null;
  }
});
const onViewClick = (data: ContactPersonInsertType) => {
  contactPersonData.value = { ...data };
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
    await contactPersonService.deleteContactPerson(deleteId.value);
    selectedContactPersons.value = selectedContactPersons.value.filter(
      user => user.id !== deleteId.value
    );
    await contactPersonStore.fetchContactPersons(
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
  <Card :title="$t('t-contact-person-list')" title-class="py-5">
    <template v-if="!props.isViewMode" #title-action>
      <div>
        <v-btn color="secondary" class="mx-1" @click="onCreateEditClick(null)">
          <i class="ph-plus-circle me-1" /> {{ $t('t-add-contact-person') }}
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
      <v-card-text>
        <v-row>
          <v-col cols="12" lg="12">
            <QuerySearch v-model="searchQuery" :placeholder="$t('t-search-for-contact')" />
          </v-col>
        </v-row>
      </v-card-text>
      <DataTableServer v-model="selectedContactPersons"
        :headers="contactPersonHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="contactPersonStore.contact_persons" :items-per-page="itemsPerPage" :total-items="totalItems"
        :loading="loadingList" :search-query="searchQuery" :search-props="searchProps" @load-items="fetchContactPersons"
        item-value="id" :show-select="!props.isViewMode">
        <template #body="{ items }">
          <tr v-for="item in items as ContactPersonListingType[]" :key="item.id" height="50">
            <td v-if="!props.isViewMode">
              <v-checkbox :model-value="selectedContactPersons.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>{{ item.fullname }}</td>
            <td>{{ item.email }}</td>
            <td>{{ item.phone }}</td>
            <td><Status :status="item.enabled ? 'enabled' : 'disabled'" /></td>
            <td>
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
              <TableAction
                v-else
                @onEdit="onCreateEditClick(item)"
                @onView="onViewClick(item)"
                @onDelete="onDelete(item.id)"
              />
            </td>
          </tr>
        </template>

        <template v-if="contactPersonStore.contact_persons.length === 0" #body>
          <tr>
            <td :colspan="contactPersonHeader.length" class="text-center py-10">
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
  <CreateEditContactDialog v-model="dialog" :data="contactPersonData" @onSubmit="onSubmit" />
  <ViewContactDialog v-model="viewDialog" :data="contactPersonData" />
  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="onConfirmDelete" />

  <v-card-actions v-if="!props.isViewMode" class="d-flex justify-space-between mt-5">
    <v-btn color="secondary" variant="outlined" class="me-2" @click="$emit('onStepChange', 4)">
      <i class="ph-arrow-left me-2" /> {{ $t('t-back-to-organizational-struture') }}
    </v-btn>
    <v-btn color="secondary" variant="elevated" @click="$emit('onStepChange', 6)">
    {{ $t('t-proceed') }} <i class="ph-arrow-right ms-2" />
    </v-btn>
    
  </v-card-actions>
</template>


