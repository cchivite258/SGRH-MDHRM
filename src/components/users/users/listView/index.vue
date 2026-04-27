<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import DataTableServer from "@/app/common/components/DataTableServer.vue";
import ListingPageShell from "@/app/common/components/listing/ListingPageShell.vue";
import Status from "@/app/common/components/Status.vue";
import CreateUpdateUserModal from "@/components/users/users/CreateUpdateUserModal.vue";
import ViewUserModal from "@/components/users/users/ViewUserModal.vue";
import RemoveItemConfirmationDialog from "@/app/common/components/RemoveItemConfirmationDialog.vue";
import { useUserStore } from "@/store/userStore";
import { userService } from "@/app/http/httpServiceProvider";
import { UserListingType } from "@/components/users/types";
import { userHeader, Options } from "@/components/users/users/listView/utils";
import ChangePasswordModal from "@/components/users/users/ChangePasswordModal.vue";
import { changePasswordType, changePasswordListingType } from "@/components/users/types";
import EnableAccountConfirmationDialog from "@/components/users/users/EnableAccountConfirmationDialog.vue";
import AdvancedFilter from "@/components/users/users/listView/AdvancedFilter.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";

const { t } = useI18n();
const toast = useToast();
const userStore = useUserStore();

const lockerAction = ref<"enable" | "disable">("enable");
const dialog = ref(false);
const viewDialog = ref(false);
const userData = ref<UserListingType | null>(null);
const passwordDialog = ref(false);
const deleteDialog = ref(false);
const deleteId = ref<number | null>(null);
const deleteLoading = ref(false);
const changePasswordUserId = ref<number | null>(null);
const changePasswordUser = ref<changePasswordListingType | null>(null);
const lockerDialog = ref(false);
const lockerId = ref<number | null>(null);
const lockerLoading = ref(false);
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const searchQuery = ref("");
const searchProps = "firstName,lastName,email";
const itemsPerPage = ref(10);
const currentPage = ref(1);
const selectedUsers = ref<any[]>([]);

const loadingList = computed(() => userStore.loading);
const totalItems = computed(() => userStore.pagination.totalElements);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / itemsPerPage.value)));

const resetListingFilters = () => {
  userStore.clearFilters();
  searchQuery.value = "";
  selectedUsers.value = [];
};

const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const message = getApiErrorMessages(error, t("t-message-save-error"))[0] || t("t-message-save-error");
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

watch(selectedUsers, newSelection => {
  console.log("Utilizadores selecionados:", newSelection);
}, { deep: true });

interface FetchParams {
  page: number;
  itemsPerPage: number;
  sortBy: Array<{ key: string; order: "asc" | "desc" }>;
}

const fetchUsers = async ({ page, itemsPerPage, sortBy }: FetchParams) => {
  await userStore.fetchUsers(
    page - 1,
    itemsPerPage,
    sortBy[0]?.key || "createdAt",
    sortBy[0]?.order || "asc"
  );
};

const toggleSelection = (item: UserListingType) => {
  const index = selectedUsers.value.findIndex(selected => selected.id === item.id);
  if (index === -1) {
    selectedUsers.value = [...selectedUsers.value, item];
  } else {
    selectedUsers.value = selectedUsers.value.filter(selected => selected.id !== item.id);
  }
};

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
  }
  dialog.value = true;
};

const onSubmit = async (data: UserListingType, callbacks?: {
  onSuccess?: () => void,
  onFinally?: () => void
}) => {
  try {
    if (!data.id) {
      await userService.createUser(data);
      toast.success(t('t-toast-message-created'));
    } else {
      await userService.updateUser(data.id, data);
      toast.success(t('t-toast-message-update'));
    }

    await userStore.fetchUsers(0, itemsPerPage.value);
    callbacks?.onSuccess?.();
  } catch (error) {
    getApiErrorMessages(error, t('t-message-save-error')).forEach(message => toast.error(message));
  } finally {
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
    getApiErrorMessages(error, t('t-message-save-error')).forEach(message => toast.error(message));
    handleApiError(error);
  } finally {
    callbacks?.onFinally?.();
  }
};

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
    userData.value = data;
  }
  viewDialog.value = true;
};

watch(passwordDialog, val => {
  if (!val) {
    changePasswordUser.value = null;
    errorMsg.value = "";
  }
});

const onChangePassword = (data: UserListingType | null) => {
  if (!data) return;

  changePasswordUser.value = {
    id: data.id,
    newPassword: "",
    confirmPassword: "",
    passwordsMatching: true,
  };

  changePasswordUserId.value = data.id;
  passwordDialog.value = true;
};

const onEnable = (id: number) => {
  const user = userStore.users.find(u => u.id === id);
  if (!user) return;

  lockerId.value = id;
  lockerAction.value = user.enabled ? "disable" : "enable";
  lockerDialog.value = true;
};

const onConfirmEnableAccount = async () => {
  lockerLoading.value = true;

  try {
    const user = userStore.users.find(u => u.id === lockerId.value);
    if (!user) {
      toast.error(t("t-message-user-not-found"));
      return;
    }

    const wasEnabled = user.enabled;
    await userService.enableUser(lockerId.value!);
    await userStore.fetchUsers();

    if (wasEnabled) {
      toast.success(t("t-toast-message-user-disabled"));
    } else {
      toast.success(t("t-toast-message-user-enabled"));
    }
  } catch (error) {
    getApiErrorMessages(error, t("t-message-enable-error")).forEach(message => toast.error(message));
  } finally {
    lockerLoading.value = false;
    lockerDialog.value = false;
    lockerId.value = null;
  }
};

watch(deleteDialog, (newVal: boolean) => {
  if (!newVal) {
    deleteId.value = null;
  }
});

const onDelete = (id: number) => {
  deleteId.value = id;
  deleteDialog.value = true;
};

const onConfirmDelete = async () => {
  deleteLoading.value = true;

  try {
    await userService.deleteUser(deleteId.value!);
    selectedUsers.value = selectedUsers.value.filter(user => user.id !== deleteId.value);
    await userStore.fetchUsers(0, itemsPerPage.value);
    toast.success(t('t-toast-message-deleted'));
  } catch (error) {
    getApiErrorMessages(error, t('t-toast-message-deleted-erros')).forEach(message => toast.error(message));
  } finally {
    deleteLoading.value = false;
    deleteDialog.value = false;
    deleteId.value = null;
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
      onEnable(data.id);
      break;
  }
};

const getDynamicOptions = (user: UserListingType) => {
  return Options.map(option => {
    if (option.value === "enable") {
      return {
        ...option,
        title: user.enabled ? t("t-disable") : t("t-enable")
      };
    }
    return {
      ...option,
      title: t(`t-${option.title}`)
    };
  });
};

onMounted(() => {
  resetListingFilters();
});
</script>

<template>
  <ListingPageShell
    class="user-listing-page"
    :title="$t('t-users-list')"
    subtitle="Consulte, pesquise e faça a gestão dos utilizadores registados."
    :action-label="$t('t-add-user')"
    :page="currentPage"
    :items-per-page="itemsPerPage"
    :total-items="totalItems"
    :total-pages="totalPages"
    @update:page="currentPage = $event"
    @action="onCreateEditClick(null)"
  >
    <template #filters>
      <AdvancedFilter />
    </template>

    <template #pagination-summary>
      {{ $t("t-showing") }}
      <b>{{ (currentPage - 1) * itemsPerPage + 1 }}-{{ Math.min(currentPage * itemsPerPage, totalItems) }}</b>
      {{ $t("t-of") }}
      <b>{{ totalItems }}</b>
      {{ $t("t-results") }}
    </template>

    <DataTableServer v-model="selectedUsers" v-model:page="currentPage"
      :headers="userHeader.map(item => ({ ...item, title: $t(`t-${item.title}`) }))" :items="userStore.users"
      :items-per-page="itemsPerPage" :total-items="totalItems" :loading="loadingList" :search-query="searchQuery"
      :search-props="searchProps" @load-items="fetchUsers" item-value="id" :show-pagination="false" show-select>
      <template #body="{ items }">
        <tr v-for="item in items as UserListingType[]" :key="item.id" class="user-listing-table__row">
          <td data-label="">
            <v-checkbox :model-value="selectedUsers.some(selected => selected.id === item.id)"
              @update:model-value="toggleSelection(item)" hide-details density="compact" />
          </td>
          <td data-label="Nome" class="user-listing-table__primary-cell">
            {{ item.firstName }} {{ item.lastName }}
          </td>
          <td data-label="Email">{{ item.email }}</td>
          <td data-label="Estado">
            <Status :status="item.enabled ? 'active' : 'unactive'" />
          </td>
          <td data-label="Bloqueado?">
            <Status :status="item.accountLocked ? 'block' : 'unblock'" />
          </td>
          <td data-label="Acção" class="user-listing-table__actions-cell">
            <ListMenuWithIcon :menuItems="getDynamicOptions(item)" @onSelect="onSelect($event, item)" />
          </td>
        </tr>
      </template>

      <template v-if="userStore.users.length === 0" #body>
        <tr>
          <td :colspan="userHeader.length + 1" class="user-listing-table__empty-state text-center py-10">
            <v-avatar size="72" color="secondary" variant="tonal" class="user-listing-table__empty-avatar">
              <i class="ph-magnifying-glass" style="font-size: 30px" />
            </v-avatar>
            <div class="user-listing-table__empty-title mt-3">
              {{ $t('t-search-not-found-message') }}
            </div>
            <div class="user-listing-table__empty-subtitle mt-1">
              Ajuste os filtros ou faça uma nova pesquisa.
            </div>
          </td>
        </tr>
      </template>
    </DataTableServer>
  </ListingPageShell>

  <ChangePasswordModal v-if="changePasswordUser" v-model="passwordDialog" :data="changePasswordUser" :error="errorMsg"
    @onSubmit="onSubmitChangePassword" />

  <CreateUpdateUserModal v-if="userData" v-model="dialog" :data="userData" @onSubmit="onSubmit" />

  <ViewUserModal v-if="userData" v-model="viewDialog" :data="userData" />

  <RemoveItemConfirmationDialog v-if="deleteId" v-model="deleteDialog" @onConfirm="onConfirmDelete"
    :loading="deleteLoading" />

  <EnableAccountConfirmationDialog v-if="lockerId" v-model="lockerDialog" :action="lockerAction"
    @onConfirm="onConfirmEnableAccount" :loading="lockerLoading" />
</template>

<style scoped>
.user-listing-page :deep(.data-table-server-wrapper) {
  background: #ffffff;
  border: 1px solid #e8edf3;
  border-radius: 14px;
  overflow: hidden;
}

.user-listing-page :deep(.v-table),
.user-listing-page :deep(.v-data-table) {
  border-radius: 14px;
}

.user-listing-page :deep(.v-table__wrapper) {
  overflow-x: hidden !important;
}

.user-listing-page :deep(.v-table__wrapper > table > thead),
.user-listing-page :deep(.v-data-table thead) {
  background: #f3f6fa;
}

.user-listing-page :deep(.v-table__wrapper > table > thead > tr > th),
.user-listing-page :deep(.v-data-table-header th),
.user-listing-page :deep(.v-data-table__th) {
  background-color: #f3f6fa !important;
  border-bottom: 1px solid #d8e1ec;
  color: #334155;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0;
  padding-top: 10px;
  padding-bottom: 10px;
  text-transform: none;
}

.user-listing-page :deep(.v-table__wrapper > table) {
  table-layout: auto;
  width: 100%;
}

.user-listing-page :deep(.v-data-table__th .v-data-table-header__content) {
  align-items: center;
  color: inherit;
  font-weight: 700;
  gap: 6px;
  white-space: nowrap;
}

.user-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child),
.user-listing-page :deep(.v-data-table-header th:last-child),
.user-listing-page :deep(.v-data-table__th:last-child) {
  text-align: center !important;
}

.user-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child .v-data-table-header__content),
.user-listing-page :deep(.v-data-table-header th:last-child .v-data-table-header__content),
.user-listing-page :deep(.v-data-table__th:last-child .v-data-table-header__content) {
  justify-content: center;
}

.user-listing-page :deep(.v-data-table-header__sort-icon) {
  color: #94a3b8;
  font-size: 0.82rem;
  opacity: 1;
}

.user-listing-page :deep(.v-data-table__td) {
  background: #ffffff;
}

.user-listing-page :deep(.v-data-table__tr td) {
  border-bottom: 1px solid #eef2f7;
  color: #334155;
  font-size: 0.8rem;
  padding-top: 20px;
  padding-bottom: 20px;
  vertical-align: middle;
}

.user-listing-page :deep(.v-data-table__tr:hover) {
  background: #fcfdff !important;
}

.user-listing-page :deep(.v-data-table__tr:hover td:first-child) {
  box-shadow: inset 2px 0 0 #cbd5e1;
}

.user-listing-page :deep(.v-data-table__td--select),
.user-listing-page :deep(.v-data-table__th--select) {
  width: 48px;
}

.user-listing-page :deep(.v-selection-control) {
  min-height: auto;
}

.user-listing-page :deep(.v-checkbox .v-selection-control) {
  justify-content: center;
}

.user-listing-page :deep(.v-checkbox .v-selection-control__wrapper) {
  color: #64748b;
}

.user-listing-table__primary-cell {
  color: #334155;
  font-weight: 500;
  line-height: 1.45;
}

.user-listing-page :deep(.v-chip) {
  font-size: 0.8rem !important;
  font-weight: 500 !important;
}

.user-listing-page :deep(.v-chip .status-chip),
.user-listing-page :deep(.v-chip .v-chip__content) {
  font-size: inherit;
  font-weight: inherit;
}

.user-listing-table__actions-cell {
  white-space: nowrap;
}

.user-listing-page :deep(.user-listing-table__actions-cell .v-btn) {
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: none;
}

.user-listing-table__empty-state {
  padding-top: 52px !important;
  padding-bottom: 52px !important;
}

.user-listing-table__empty-avatar {
  border: 1px solid #e2e8f0;
}

.user-listing-table__empty-title {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 700;
}

.user-listing-table__empty-subtitle {
  color: #64748b;
  font-size: 0.82rem;
}

@media (min-width: 768px) {
  .user-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child),
  .user-listing-page :deep(.v-table__wrapper > table > thead > tr > th:first-child) {
    padding-left: 24px;
  }

  .user-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child),
  .user-listing-page :deep(.v-table__wrapper > table > thead > tr > th:last-child) {
    padding-right: 24px;
  }
}

@media (max-width: 767px) {
  .user-listing-page :deep(.v-table__wrapper > table > thead) {
    display: none;
  }

  .user-listing-page :deep(.v-table__wrapper > table > tbody) {
    display: grid;
    gap: 12px;
  }

  .user-listing-page :deep(.v-table__wrapper > table > tbody > tr) {
    background: #ffffff;
    border: 1px solid #e5edf6;
    border-radius: 14px;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
    display: block;
    overflow: hidden;
    padding: 12px 12px 8px;
  }

  .user-listing-page :deep(.v-table__wrapper > table > tbody > tr > td) {
    align-items: flex-start;
    border-bottom: 1px solid #eef2f7;
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    padding: 12px 0;
    width: 100%;
  }

  .user-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:last-child) {
    border-bottom: 0;
    padding-bottom: 2px;
  }

  .user-listing-page :deep(.v-table__wrapper > table > tbody > tr > td::before) {
    color: #64748b;
    content: attr(data-label);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .user-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child) {
    border-bottom: 0;
    display: flex;
    justify-content: flex-end;
    padding-top: 0;
    padding-bottom: 2px;
  }

  .user-listing-page :deep(.v-table__wrapper > table > tbody > tr > td:first-child::before) {
    content: "";
    display: none;
  }

  .user-listing-table__actions-cell {
    display: block !important;
  }
}
</style>
