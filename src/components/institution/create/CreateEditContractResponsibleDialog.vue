<script lang="ts" setup>
import { PropType, computed, nextTick, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';

import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { getApiValidationErrors } from "@/app/common/apiErrors";
import { useUserStore } from "@/store/userStore";
import { contractParticipantRoleOptions } from "@/components/institution/create/utils";
import type {
  ContractParticipantPayloadType,
  ContractParticipantRole,
  ContractParticipantType
} from "@/components/institution/types";
import type { UserType1 } from "@/app/http/types";

const { t } = useI18n();
const toast = useToast();
const userStore = useUserStore();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'onSubmit', data: ContractParticipantPayloadType & { id?: string }, callbacks?: {
    onSuccess?: () => void,
    onError?: (error: any) => void,
    onFinally?: () => void
  }): void
}>();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<(Partial<ContractParticipantType> & { contractId?: string | number }) | null>,
    required: false,
    default: () => ({
      id: undefined,
      contractId: "",
      participantId: "",
      role: "RESPONSIBLE"
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});
const id = ref("");
const contractId = ref<string | number>("");
const participantId = ref<string | number>("");
const role = ref<ContractParticipantRole>("RESPONSIBLE");

watch(() => props.data, (newData) => {
  if (!newData) return;
  id.value = newData.id || "";
  contractId.value = newData.contractId || "";
  participantId.value = newData.participant?.id || newData.participantId || "";
  role.value = newData.role || "RESPONSIBLE";
}, { immediate: true });

const isCreate = computed(() => !id.value);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

const userOptions = computed(() =>
  (userStore.users as UserType1[]).map((user) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return {
      value: String(user.id),
      label: fullName ? `${fullName} (${user.email})` : user.email,
    };
  })
);

const requiredRules = {
  participantId: [
    (v: string | number) => !!v || t('t-required-field'),
  ],
  role: [
    (v: string | number) => !!v || t('t-required-field'),
  ],
};

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const getServerErrors = (field: string) => serverErrors.value[field] || [];

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await form.value?.validate();
  }
}, { deep: true });

const onSubmit = async () => {
  if (!form.value) return;
  serverErrors.value = {};

  const { valid } = await form.value.validate();

  if (!valid) {
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    setTimeout(() => errorMsg.value = "", 5000);
    return;
  }

  localLoading.value = true;

  emit("onSubmit", {
    id: id.value || undefined,
    contractId: contractId.value,
    participantId: participantId.value,
    role: role.value
  }, {
    onSuccess: () => dialogValue.value = false,
    onError: (error: any) => {
      serverErrors.value = getApiValidationErrors(error);
    },
    onFinally: () => localLoading.value = false
  });
};

onMounted(async () => {
  try {
    userStore.clearFilters();
    await userStore.fetchUsers(0, 10000000);
  } catch (error) {
    errorMsg.value = t("t-message-load-error");
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="600">
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-contract-responsible') : $t('t-edit-contract-responsible')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-2">
                Utilizador <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="participantId"
                :items="userOptions"
                :loading="userStore.loading"
                :rules="requiredRules.participantId"
                :error-messages="getServerErrors('participantId')"
                placeholder="Seleccione um utilizador"
              />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold mb-2">
                Papel <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="role"
                :items="contractParticipantRoleOptions"
                :rules="requiredRules.role"
                :error-messages="getServerErrors('role')"
                placeholder="Seleccione o papel"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <div>
            <v-btn color="danger" class="me-1" @click="dialogValue = false">
              <i class="ph-x me-1" /> {{ $t('t-close') }}
            </v-btn>
            <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
              {{ localLoading ? $t('t-saving') : $t('t-save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
