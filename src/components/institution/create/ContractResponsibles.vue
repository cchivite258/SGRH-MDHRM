<script lang="ts" setup>
import { computed, PropType, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

// Components
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import Status from "@/app/common/components/Status.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateEditContractResponsibleDialog from "@/components/institution/create/CreateEditContractResponsibleDialog.vue";

// Stores e Services
import { contractParticipantService } from "@/app/http/httpServiceProvider";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { useContractParticipantStore } from "@/store/institution/contractParticipantStore";

// Types
import type {
  ContractParticipantPayloadType,
  ContractParticipantType
} from "@/components/institution/types";

// Utils
import {
  contractParticipantHeader,
  contractParticipantRoleOptions
} from "@/components/institution/create/utils";

const { t } = useI18n();
const toast = useToast();
const contractParticipantStore = useContractParticipantStore();

// props
const props = defineProps({
  contractId: {
    type: String as PropType<string | null>,
    default: null
  }
});

const institutionId = ref(props.contractId);

const dialog = ref(false);
const deleteDialog = ref(false);
const deleteLoading = ref(false);
const contractParticipantData = ref<(Partial<ContractParticipantType> & { contractId?: string | number }) | null>(null);
const deleteId = ref<string | null>(null);
const searchQuery = ref("");
const searchProps = "participant.firstName,participant.lastName,participant.email,role";
const itemsPerPage = ref(10);
const selectedContractParticipants = ref<ContractParticipantType[]>([]);

const loadingList = computed(() => contractParticipantStore.loading);
const totalItems = computed(() => contractParticipantStore.pagination.totalElements);

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
  search: string;
}

const fetchContractParticipants = async ({ page, itemsPerPage, sortBy, search }: FetchParams) => {
  if (!institutionId.value) return;

  await contractParticipantStore.fetchContractParticipants(
    institutionId.value,
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc',
    search,
    searchProps
  );
};

const getParticipantId = (item: ContractParticipantType) => String(item.id || "");

const getParticipantName = (item: ContractParticipantType) => {
  const fullName = `${item.participant?.firstName || ""} ${item.participant?.lastName || ""}`.trim();
  return fullName || item.participant?.username || item.participant?.email || "-";
};

const getRoleLabel = (role: string) =>
  contractParticipantRoleOptions.find((item) => item.value === role)?.label || role;

const toggleSelection = (item: ContractParticipantType) => {
  const index = selectedContractParticipants.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedContractParticipants.value = [...selectedContractParticipants.value, item];
  } else {
    selectedContractParticipants.value = selectedContractParticipants.value.filter(selected => selected.id !== item.id);
  }
};

watch(
  () => props.contractId,
  async (contractId) => {
    institutionId.value = contractId;
    selectedContractParticipants.value = [];

    if (!institutionId.value) return;

    await contractParticipantStore.fetchContractParticipants(
      institutionId.value,
      0,
      itemsPerPage.value
    );
  },
  { immediate: true }
);

watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    contractParticipantData.value = null;
  }
});

const onCreateEditClick = (data: ContractParticipantType | null) => {
  const contractId = institutionId.value || "";

  contractParticipantData.value = data
    ? {
      ...data,
      contractId: data.contractId || contractId
    }
    : {
      id: undefined,
      contractId,
      participantId: "",
      role: "RESPONSIBLE"
    };

  dialog.value = true;
};

const onSubmit = async (
  data: ContractParticipantPayloadType & { id?: string },
  callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }
) => {
  try {
    const payload: ContractParticipantPayloadType = {
      contractId: data.contractId,
      participantId: data.participantId,
      role: data.role
    };

    const response = data.id
      ? await contractParticipantService.updateParticipant(data.id, payload)
      : await contractParticipantService.createParticipant(payload);

    if (response.status === "error") {
      getApiErrorMessages(response.error, t('t-message-save-error')).forEach((message) => toast.error(message));
      callbacks?.onError?.({ error: response.error });
      return;
    }

    toast.success(data.id ? t('t-toast-message-update') : t('t-toast-message-created'));

    await contractParticipantStore.fetchContractParticipants(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t('t-message-save-error')).forEach((message) => toast.error(message));
    callbacks?.onError?.(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

const onDelete = (id: string) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  if (!deleteId.value) return;

  deleteLoading.value = true;
  try {
    const response = await contractParticipantService.deleteParticipant(deleteId.value);

    if (response.status === "error") {
      getApiErrorMessages(response.error, t('t-toast-message-deleted-erros')).forEach((message) => toast.error(message));
      return;
    }

    selectedContractParticipants.value = selectedContractParticipants.value.filter(
      item => item.id !== deleteId.value
    );
    await contractParticipantStore.fetchContractParticipants(
      institutionId.value,
      0,
      itemsPerPage.value
    );
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    getApiErrorMessages(error, t('t-toast-message-deleted-erros')).forEach((message) => toast.error(message));
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = null;
  }
};
</script>

<template>
  <div class="contract-responsibles-card__header">
    <h4 class="contract-responsibles-card__title text-body-1 font-weight-bold">
      {{ $t('t-contract-responsibles') }}
    </h4>
    <v-btn color="secondary" class="mx-1" @click="onCreateEditClick(null)">
      <i class="ph-plus-circle me-1" /> {{ $t('t-add-contract-responsible') }}
    </v-btn>
  </div>

  <v-row class="mt-2">
    <v-col cols="12" lg="12">
      <DataTableServer
        v-model="selectedContractParticipants"
        :headers="contractParticipantHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))"
        :items="contractParticipantStore.contract_participants"
        :items-per-page="itemsPerPage"
        :total-items="totalItems"
        :loading="loadingList"
        :search-query="searchQuery"
        :search-props="searchProps"
        @load-items="fetchContractParticipants"
        item-value="id"
        :show-select="false"
      >
        <template #body="{ items }">
          <tr v-for="item in items as ContractParticipantType[]" :key="getParticipantId(item)" height="50">
            <td>{{ getParticipantName(item) }}</td>
            <td>{{ item.participant?.email || '-' }}</td>
            <td>{{ getRoleLabel(item.role) }}</td>
            <td><Status :status="item.enabled ? 'enabled' : 'disabled'" /></td>
            <td class="text-end">
              <div class="d-flex justify-end">
                <TableAction
                  :can-view="false"
                  :can-edit="true"
                  :can-delete="true"
                  @onEdit="onCreateEditClick(item)"
                  @onDelete="onDelete(getParticipantId(item))"
                />
              </div>
            </td>
          </tr>
        </template>

        <template v-if="contractParticipantStore.contract_participants.length === 0" #body>
          <tr>
            <td :colspan="contractParticipantHeader.length" class="text-center py-10">
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

  <CreateEditContractResponsibleDialog v-model="dialog" :data="contractParticipantData" @onSubmit="onSubmit" />
  <RemoveItemConfirmationDialog v-model="deleteDialog" :loading="deleteLoading" @onConfirm="onConfirmDelete" />
</template>

<style scoped>
.contract-responsibles-card__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 36px;
}

.contract-responsibles-card__title {
  color: var(--form-card-title);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.35;
  margin: 0;
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
