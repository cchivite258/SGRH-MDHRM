<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import FormCard from "@/app/common/components/FormCard.vue";
import FormPageHeader from "@/app/common/components/FormPageHeader.vue";
import { getApiErrorMessages } from "@/app/common/apiErrors";
import { roleService, userRoleService, userService } from "@/app/http/httpServiceProvider";
import type { RoleListingType } from "@/components/users/roles/types";
import type { UserListingType } from "@/components/users/types";
import type { UserRoleListingType } from "@/components/users/userRoles/types";

const emit = defineEmits(["loaded"]);
const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();

const userId = computed(() => String(route.params.id || ""));
const user = ref<UserListingType | null>(null);
const roles = ref<RoleListingType[]>([]);
const userRoles = ref<UserRoleListingType[]>([]);
const selectedRoleIds = ref<string[]>([]);
const initialRoleIds = ref<string[]>([]);
const associationIdByRoleId = ref<Record<string, number>>({});
const search = ref("");
const loading = ref(false);
const saving = ref(false);

const selectedRoleIdSet = computed(() => new Set(selectedRoleIds.value));

const userName = computed(() => {
  if (!user.value) return "";
  return [user.value.firstName, user.value.lastName].filter(Boolean).join(" ") || user.value.email;
});

const filteredRoles = computed(() => {
  const query = search.value.trim().toLowerCase();
  if (!query) return roles.value;

  return roles.value.filter(role => {
    return [role.name, role.description]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(query));
  });
});

const hasChanges = computed(() => {
  const initial = [...initialRoleIds.value].sort().join(",");
  const current = [...selectedRoleIds.value].sort().join(",");
  return initial !== current;
});

const setUserRoles = (items: UserRoleListingType[]) => {
  userRoles.value = items;
  selectedRoleIds.value = items
    .map(item => item.role?.id || item.roleId)
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  initialRoleIds.value = [...selectedRoleIds.value];
  associationIdByRoleId.value = items.reduce<Record<string, number>>((acc, item) => {
    const roleId = item.role?.id || item.roleId;
    if (roleId) {
      acc[roleId] = item.id;
    }
    return acc;
  }, {});
};

const loadData = async () => {
  loading.value = true;

  try {
    const [userResponse, rolesResponse, userRolesResponse] = await Promise.all([
      userService.findUserById(userId.value),
      roleService.getRoles(0, 10000000, "name", "asc"),
      userRoleService.getUserRolesByUser(userId.value),
    ]);

    user.value = userResponse;
    roles.value = rolesResponse.content;
    setUserRoles(userRolesResponse);
    emit("loaded", userResponse);
  } catch (error) {
    getApiErrorMessages(error, t("t-message-load-error")).forEach(message => toast.error(message));
  } finally {
    loading.value = false;
  }
};

const toggleRole = (roleId: string) => {
  if (selectedRoleIdSet.value.has(roleId)) {
    selectedRoleIds.value = selectedRoleIds.value.filter(id => id !== roleId);
    return;
  }

  selectedRoleIds.value = [...selectedRoleIds.value, roleId];
};

const clearAllSelection = () => {
  selectedRoleIds.value = [];
};

const selectAllRoles = () => {
  selectedRoleIds.value = roles.value.map(role => role.id);
};

const reloadUserRoles = async () => {
  const items = await userRoleService.getUserRolesByUser(userId.value);
  setUserRoles(items);
};

const onSave = async () => {
  if (!hasChanges.value) {
    toast.info(t("t-no-role-changes"));
    return;
  }

  saving.value = true;

  try {
    const existingAssociationIds = Object.values(associationIdByRoleId.value);
    if (existingAssociationIds.length) {
      await userRoleService.deleteManyUserRoles(existingAssociationIds);
    }

    if (selectedRoleIds.value.length) {
      await userRoleService.createManyUserRoles(
        selectedRoleIds.value.map(roleId => ({
          userId: userId.value,
          roleId,
        }))
      );
    }

    await reloadUserRoles();
    toast.success(t("t-user-roles-updated"));
  } catch (error) {
    getApiErrorMessages(error, t("t-message-save-error")).forEach(message => toast.error(message));
  } finally {
    saving.value = false;
  }
};

const onBack = () => {
  router.push("/users/users/list");
};

onMounted(loadData);
</script>

<template>
  <div class="user-roles-page">
    <FormPageHeader
      :title="$t('t-manage-user-roles')"
      :subtitle="user ? `${userName} - ${$t('t-user-roles-subtitle')}` : $t('t-user-roles-subtitle')"
      :loading="saving"
      :save-disabled="loading || saving"
      @back="onBack"
      @save="onSave"
    />

    <FormCard>
      <div v-if="loading" class="user-roles-page__loading">
        <v-progress-linear color="primary" indeterminate />
      </div>

      <div v-else>
        <div class="user-roles-page__head">
          <div>
            <h2>{{ $t("t-roles") }}</h2>
            <p>{{ $t("t-user-roles-selection-helper") }}</p>
          </div>

          <div class="user-roles-page__summary">
            <strong>{{ selectedRoleIds.length }}</strong>
            <span>{{ $t("t-selected-roles") }}</span>
          </div>
        </div>

        <div class="user-roles-page__toolbar">
          <v-text-field
            v-model="search"
            variant="solo"
            density="compact"
            hide-details
            prepend-inner-icon="ph-magnifying-glass"
            :placeholder="$t('t-search-for-roles')"
            class="user-roles-page__search"
          />

          <v-btn color="secondary" variant="outlined" :disabled="!roles.length" @click="selectAllRoles">
            <i class="ph-check-square-offset me-2" />
            {{ $t("t-select-all") }}
          </v-btn>

          <v-btn color="danger" variant="text" :disabled="!selectedRoleIds.length" @click="clearAllSelection">
            <i class="ph-x me-2" />
            {{ $t("t-clear-all") }}
          </v-btn>
        </div>

        <div v-if="!filteredRoles.length" class="user-roles-page__empty">
          {{ $t("t-no-roles-found") }}
        </div>

        <div v-else class="user-roles-page__role-list">
          <label
            v-for="role in filteredRoles"
            :key="role.id"
            class="user-roles-page__role-item"
            :class="{ 'is-selected': selectedRoleIdSet.has(role.id) }"
          >
            <v-checkbox
              :model-value="selectedRoleIdSet.has(role.id)"
              color="secondary"
              density="compact"
              hide-details
              @update:model-value="toggleRole(role.id)"
            />
            <span>
              <strong>{{ role.name }}</strong>
              <small v-if="role.description">{{ role.description }}</small>
            </span>
          </label>
        </div>
      </div>
    </FormCard>

    <div v-if="!loading" class="user-roles-page__footer-actions">
      <v-btn color="secondary" variant="outlined" :disabled="saving" @click="onBack">
        <i class="ph-arrow-left me-2" />
        {{ $t("t-back-to-list") }}
      </v-btn>

      <v-btn color="secondary" variant="elevated" :loading="saving" :disabled="loading || saving" @click="onSave">
        <i class="ph-floppy-disk me-2" />
        {{ $t("t-save") }}
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.user-roles-page__loading {
  padding: 20px 0;
}

.user-roles-page__head {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.user-roles-page__head h2 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  margin: 0 0 4px;
}

.user-roles-page__head p {
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.35;
  margin: 0;
}

.user-roles-page__summary {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e5ebf3;
  border-radius: 8px;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 8px;
  min-height: 34px;
  padding: 6px 10px;
}

.user-roles-page__summary strong {
  color: #0f172a;
  font-size: 1rem;
}

.user-roles-page__summary span {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 600;
}

.user-roles-page__toolbar {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(220px, 1fr) auto auto;
  margin-bottom: 12px;
}

.user-roles-page__search {
  margin-bottom: 0;
}

.user-roles-page__toolbar .v-btn,
.user-roles-page__footer-actions .v-btn {
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 36px;
  padding-inline: 14px;
  text-transform: none;
}

.user-roles-page__role-list {
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr;
}

.user-roles-page__role-item {
  align-items: flex-start;
  border: 1px solid #e5ebf3;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  gap: 6px;
  grid-template-columns: 26px minmax(0, 1fr);
  min-height: 72px;
  padding: 10px;
}

.user-roles-page__role-item.is-selected {
  background: #f8fafc;
  border-color: #94a3b8;
}

.user-roles-page__role-item strong {
  color: #172033;
  display: block;
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.2;
}

.user-roles-page__role-item small {
  color: #64748b;
  display: block;
  font-size: 0.72rem;
  line-height: 1.3;
  margin-top: 3px;
}

.user-roles-page__empty {
  align-items: center;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  display: flex;
  font-size: 0.84rem;
  justify-content: center;
  min-height: 180px;
  padding: 18px;
  text-align: center;
}

.user-roles-page__footer-actions {
  border-top: 1px solid #e5ebf3;
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 16px;
  padding-top: 18px;
}

@media (max-width: 991px) {
  .user-roles-page__toolbar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575px) {
  .user-roles-page__head {
    align-items: flex-start;
    flex-direction: column;
  }

  .user-roles-page__footer-actions {
    grid-template-columns: 1fr;
  }

  .user-roles-page__footer-actions {
    display: grid;
  }
}
</style>
