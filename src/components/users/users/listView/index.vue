<script lang="ts" setup>
import { ref, watch, computed, onMounted } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { userHeader } from "@/components/users/users/listView/utils";
import { UserListingType, UserInsertType } from "@/components/users/types";
import Status from "@/app/common/components/Status.vue";
import TableAction from "@/app/common/components/TableAction.vue";
import CreateUpdateUserModal from "@/components/users/users/CreateUpdateUserModal.vue";
import ViewUserModal from "@/components/users/users/ViewUserModal.vue";
import { formateDate } from "@/app/common/dateFormate";
import { useRouter } from "vue-router";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { useUserStore } from "@/store/userStore";
import { userService } from "@/app/http/httpServiceProvider";
import { useToast } from 'vue-toastification';
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue"
import CreateEditDialog from "@/components/realEstate/CreateEditDialog.vue"; import { Options } from "@/components/users/users/listView/utils";
import ChangePasswordModal from "@/components/users/users/ChangePasswordModal.vue";
import { changePasswordType } from "@/components/users/types";
import { onBeforeUnmount } from "vue";
import { changePasswordListingType } from "@/components/users/types";
import EnableAccountConfirmationDialog from "@/components/users/users/EnableAccountConfirmationDialog.vue";
import AdvancedFilter from "@/components/users/users/listView/AdvancedFilter.vue";

const { t } = useI18n();
//criacao da mensagem toast
const toast = useToast();

const userStore = useUserStore();

const lockerAction = ref<"enable" | "disable">("enable"); // ou string se preferir
const dialog = ref(false);
const viewDialog = ref(false);
const userData = ref<UserListingType | null>(null);
const passwordDialog = ref(false);

const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);
const deleteLoading = ref(false);
const changePasswordUserId = ref<number | null>(null);
// Junto com as outras refs
const changePasswordUser = ref<changePasswordListingType | null>(null);
const lockerDialog = ref(false);
const lockerId = ref<number | null>(null);
const lockerLoading = ref(false);


const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const onEnable = (id: number) => {
  const user = userStore.users.find((u) => u.id === id);
  if (!user) return;

  lockerId.value = id;
  lockerAction.value = user.enabled ? "disable" : "enable";
  lockerDialog.value = true;
};



const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  // Se o erro vier em formato de resposta do backend
  const message =
    error?.response?.data?.error.errors.passwordsMatching[0] ||
    error?.message ||
    t("t-message-save-error");

  errorMsg.value = message;

  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});

// Estado do componente
const searchQuery = ref("")
const searchProps = "firstName,lastName,email" // Campos de pesquisa
const itemsPerPage = ref(10)
const selectedUsers = ref<any[]>([]) /// Armazena os funcionários selecionados


// Computed properties
const loadingList = computed(() => userStore.loading)
const totalItems = computed(() => userStore.pagination.totalElements)

// Observa mudanças nos funcionários selecionados
watch(selectedUsers, (newSelection) => {
  console.log('Funcionários selecionados:', newSelection)
}, { deep: true })


interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: 'asc' | 'desc' }>;
}

const fetchUsers = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await userStore.fetchUsers(
    page - 1, // Ajuste para API que começa em 0
    itemsPerPage,
    sortBy[0]?.key || 'createdAt',
    sortBy[0]?.order || 'asc'
  )
}

const toggleSelection = (item: UserListingType) => {
  const index = selectedUsers.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedUsers.value = [...selectedUsers.value, item];
  } else {
    selectedUsers.value = selectedUsers.value.filter(selected => selected.id !== item.id);
  }
};


//Editar ou Criar utilizador
watch(dialog, (newVal: boolean) => {
  if (!newVal) {
    userData.value = null;
  }
});

const onCreateEditClick = (data: UserListingType | null) => {
  if (!data) {
    userData.value = {
      id: -1,
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      enabled: false,
      accountLocked: false,
      twoFactor: false,
      failedsLogin: "",
      lastSucessfulLogin: "",
      lastFailedLogin: "",
      lastPasswordUpdate: "",
      passwordExpirationDate: ""
    };
  } else {
    userData.value = data;
    //console.log('userData.value', userData.value);
  }
  dialog.value = true;
};


const onSubmit = async (data: UserListingType, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!data.id) {
      //console.log('insert');
      await userService.createUser(data);
      toast.success(t('t-toast-message-created'));
    } else {
      //console.log('update');
      await userService.updateUser(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    // Recarrega os dados
    await userStore.fetchUsers(0, itemsPerPage.value)

    // Callback de sucesso (fecha a modal)
    callbacks?.onSuccess?.();
  } catch (error) {
    console.error("Erro ao salvar usuário:", error);
    toast.error(t('t-message-save-error'));

  } finally {
    // Callback para desativar o loading
    callbacks?.onFinally?.();
  }
};


const onSubmitChangePassword = async (data: changePasswordType, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!changePasswordUserId.value) {
      toast.error(t('t-message-user-not-selected'));
      return;
    }

    await userService.changePasswordUser(changePasswordUserId.value, data);
    toast.success(t('t-toast-message-created'));
    callbacks?.onSuccess?.();
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    toast.error(t('t-message-save-error'));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

//Consulta do utilizador
watch(viewDialog, (newVal: boolean) => {
  if (!newVal) {
    userData.value = null;
  }
});

const onViewClick = (data: UserListingType | null) => {
  if (!data) {
    userData.value = {
      id: -1,
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      enabled: false,
      accountLocked: false,
      twoFactor: false,
      failedsLogin: "",
      lastSucessfulLogin: "",
      lastFailedLogin: "",
      lastPasswordUpdate: "",
      passwordExpirationDate: ""
    };
  } else {
    //console.log('data userdata', data);
    userData.value = data;
    console.log('userData.value', userData.value);
  }
  viewDialog.value = true;
};

watch(passwordDialog, (val) => {
  if (!val) {
    changePasswordUser.value = null;
    errorMsg.value = ""; // limpa o erro ao fechar
  }
});

const onChangePassword = (data: UserListingType | null) => {
  if (!data) return;

  // Transforma o UserListingType num objeto do tipo changePasswordListingType
  changePasswordUser.value = {
    id: data.id,
    newPassword: "",
    confirmPassword: "",
    passwordsMatching: true,
  };

  changePasswordUserId.value = data.id;
  passwordDialog.value = true;
};

const onConfirmEnableAccount = async () => {
  lockerLoading.value = true;

  try {
    const user = userStore.users.find((u) => u.id === lockerId.value);
    if (!user) {
      toast.error(t("t-message-user-not-found"));
      return;
    }

    const wasEnabled = user.enabled;

    // Chamada da API
    await userService.enableUser(lockerId.value!);

    // Atualiza a lista de utilizadores
    await userStore.fetchUsers();

    // Toast com base no estado anterior
    if (wasEnabled) {
      toast.success(t("t-toast-message-user-disabled"));

    } else {
      toast.success(t("t-toast-message-user-enabled"));
    }
  } catch (error) {
    toast.error(t("t-message-enable-error"));
    console.error("Erro ao alterar estado da conta:", error);
  } finally {
    lockerLoading.value = false;
    lockerDialog.value = false;
    lockerId.value = null;
  }
};

//Delete do utilizador
watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});
const onDelete = (id: number) => {
  deleteId.value = id;
  console.log('delete id', deleteId.value);
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  deleteLoading.value = true;

  try {
    await userService.deleteUser(deleteId.value!);

    // 1. Remove o usuário deletado da seleção se estiver selecionado
    selectedUsers.value = selectedUsers.value.filter(user => user.id !== deleteId.value);

    // 2. Recarrega os dados mantendo a paginação atual
    await userStore.fetchUsers(0, itemsPerPage.value);

    // 3. Feedback visual
    toast.success(t('t-toast-message-deleted'));

  } catch (error) {
    toast.error(t('t-toast-message-deleted-erros'));
    console.error("Delete error:", error);

    // Opcional: Mostrar detalhes do erro se disponível
    const errorMessage = (error as any)?.response?.data?.message || t('t-message-delete-error-unknown');
    toast.error(errorMessage);

  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = null; // Limpa o ID após a operação
  }
};

const onSelect = (option: string, data: UserListingType) => {
  switch (option) {
    case "view":
      onViewClick(data);
      break;
    case "edit":
      onCreateEditClick(data);
      break;
    case "delete":
      onDelete(data.id);
      break;
    case "change":
      onChangePassword(data);
      break;
    case "enable":
      onEnable(data.id); // <- agora usa a modal
      break;
  }
};

const getDynamicOptions = (user: UserListingType) => {
  return Options.map(option => {
    if (option.value === "enable") {
      return {
        ...option,
        title: user.enabled ? t("t-disable") : t("t-enable")  // Traduções devem existir
      };
    }
    return {
      ...option,
      title: t(`t-${option.title}`)
    };
  });
};


</script>
<template>
  <v-card>
    <v-card-title class="mt-2">
      <v-row justify="space-between">
        <v-col lg="12">
          <AdvancedFilter />
        </v-col>
      </v-row>
      <v-row justify="space-between" class="mt-n6">
        <v-col lg="8">
        </v-col>
        <v-col lg="auto">
          <v-btn color="secondary" @click="onCreateEditClick(null)">
            <i class="ph-user-plus me-1" /> {{ $t('t-add-user') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="mt-2">
      <DataTableServer v-model="selectedUsers"
        :headers="userHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" :items="userStore.users"
        :items-per-page="itemsPerPage" :total-items="totalItems" :loading="loadingList" :search-query="searchQuery"
        :search-props="searchProps" @load-items="fetchUsers" item-value="id" show-select>
        <template #body="{ items }">
          <tr v-for="item in items as UserListingType[]" :key="item.id" height="50">
            <td>
              <v-checkbox :model-value="selectedUsers.some(selected => selected.id === item.id)"
                @update:model-value="toggleSelection(item)" hide-details density="compact" />
            </td>
            <td>
              {{ item.firstName }} {{ item.lastName }}
            </td>
            <td>{{ item.email }}</td>
            <td>
              <Status :status="item.enabled ? 'active' : 'unactive'" />
            </td>
            <td>
              <Status :status="item.accountLocked ? 'block' : 'unblock'" />
            </td>
            <td>
              <ListMenuWithIcon :menuItems="getDynamicOptions(item)" @onSelect="onSelect($event, item)" />
            </td>
          </tr>
        </template>

        <template v-if="userStore.users.length === 0" #body>
          <tr>
            <td :colspan="userHeader.length" class="text-center py-10">
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

      <div v-if="!fetchUsers.length" class="text-center pa-7">
        <div class="mb-3">
          <v-avatar color="primary" variant="tonal" size="x-large">
            <i class="ph-magnifying-glass ph-lg"></i>
          </v-avatar>
        </div>
        <div class="text-subtitle-1 font-weight-bold">
          {{ $t('t-search-not-found-message') }}
        </div>
      </div>
    </v-card-text>
  </v-card>

  <ChangePasswordModal v-if="changePasswordUser" v-model="passwordDialog" :data="changePasswordUser" :error="errorMsg"
    @onSubmit="onSubmitChangePassword" />

  <CreateUpdateUserModal v-if="userData" v-model="dialog" :data="userData" @onSubmit="onSubmit" />

  <ViewUserModal v-if="userData" v-model="viewDialog" :data="userData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />

  <EnableAccountConfirmationDialog v-if="lockerId" v-model="lockerDialog" :action="lockerAction"
    @onConfirm="onConfirmEnableAccount" :loading="lockerLoading" />

</template>
