<script lang="ts" setup>
import { computed, onMounted } from "vue";
import { formateDate } from "@/app/common/dateFormate";
import { ServiceProviderInsertType } from "@/components/serviceProvider/types";
import { useUserStore } from "@/store/userStore";
import type { UserType1 } from "@/app/http/types";

const userStore = useUserStore();

const emit = defineEmits<{
  (e: "onStepChange", step: number): void;
  (e: "save"): void;
  (e: "update:modelValue", value: ServiceProviderInsertType): void;
}>();

const props = withDefaults(defineProps<{
  modelValue: ServiceProviderInsertType;
  loading?: boolean;
  showActions?: boolean;
}>(), {
  loading: false,
  showActions: true
});

const serviceProviderData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  }
});

const formatUser = (user: Pick<UserType1, "firstName" | "lastName" | "email">) => {
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  if (fullName && user.email) return `${fullName} (${user.email})`;
  return fullName || user.email || "-";
};

const formatResponsible = computed(() => {
  const responsible = serviceProviderData.value.responsible;
  if (!responsible) {
    const user = (userStore.users as UserType1[]).find(
      (item) => String(item.id) === String(serviceProviderData.value.responsibleId)
    );

    return user ? formatUser(user) : "-";
  }

  return formatUser(responsible);
});

onMounted(async () => {
  if (serviceProviderData.value.responsible && userStore.users.length > 0) return;

  userStore.clearFilters();
  await userStore.fetchUsers(0, 10000000);
});
</script>

<template>
  <Card :title="$t('t-contract')" elevation="0" title-class="pb-0">
    <v-card-text class="pt-0">
      <v-row class="mt-2">
        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t("t-contract-start-date") }}
          </div>
          <div>{{ formateDate(serviceProviderData.contractStartDate) || "-" }}</div>
        </v-col>

        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t("t-contract-end-date") }}
          </div>
          <div>{{ formateDate(serviceProviderData.contractEndDate) || "-" }}</div>
        </v-col>

        <v-col cols="12" lg="4">
          <div class="font-weight-bold mb-2">
            {{ $t("t-contract-responsible") }}
          </div>
          <div>{{ formatResponsible }}</div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-card-actions v-if="showActions" class="d-flex justify-space-between mt-3">
      <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', 1)" :disabled="loading">
        <i class="ph-arrow-left me-2" /> {{ $t("t-back-to-general-info") }}
      </v-btn>

      <v-btn color="secondary" variant="elevated" @click="emit('onStepChange', 3)" :disabled="loading">
        {{ $t("t-proceed") }} <i class="ph-arrow-right ms-2" />
      </v-btn>
    </v-card-actions>
  </Card>
</template>
