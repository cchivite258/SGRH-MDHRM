<script lang="ts" setup>
import { PropType, computed, ref, watch, onMounted, nextTick } from "vue";
import { ServiceProviderInsertType, ServiceProviderListingType } from "@/components/institution/types";
import { ServiceProviderListingForListType } from "@/components/serviceProvider/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { getApiValidationErrors, getFirstApiErrorMessage } from "@/app/common/apiErrors";

const { t } = useI18n();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'onSubmit', data: ServiceProviderInsertType, callbacks?: {  
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
    type: Object as PropType<ServiceProviderInsertType | ServiceProviderListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      serviceProvider: "",
      company: ""
    })
  },
});

// Stores
const serviceProviderStore = useServiceProviderStore();
const localLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});
const id = ref("");
const serviceProvider = ref<string | number>(""); // Pode ser string ou number
const isBusinessDays = ref(false);
const gracePeriod = ref<number | string | null>(null);
const maxDaysAfterService = ref<number | string | null>(null);
const suppressServiceProviderDefaults = ref(false);

const applyServiceProviderDefaults = () => {
  const selectedServiceProvider = (serviceProviderStore.enabledServiceProviders as ServiceProviderListingForListType[])
    .find((item) => String(item.id) === String(serviceProvider.value));

  if (!selectedServiceProvider) return;

  maxDaysAfterService.value = selectedServiceProvider.maxDaysAfterService ?? null;
  gracePeriod.value = selectedServiceProvider.gracePeriod ?? null;
  isBusinessDays.value = !!selectedServiceProvider.isBusinessDays;
};

// Watch for data changes
watch(() => props.data, async (newData) => {
  if (!newData) return;

  suppressServiceProviderDefaults.value = true;
  
  id.value = newData.id || "";
  
  // Tratamento para ambos os tipos de dados
  if (typeof newData.serviceProvider === 'object' && newData.serviceProvider !== null) {
    serviceProvider.value = newData.serviceProvider.id; // Para ServiceProviderListingType
  } else {
    serviceProvider.value = newData.serviceProvider; // Para ServiceProviderInsertType
  }
  isBusinessDays.value = !!newData.isBusinessDays;
  gracePeriod.value = newData.gracePeriod ?? null;
  maxDaysAfterService.value = newData.maxDaysAfterService ?? null;

  await nextTick();
  suppressServiceProviderDefaults.value = false;
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

const requiredRules = {
  serviceProvider: [
    (v: string) => !!v || t('t-please-enter-service-provider'),
  ],
  optionalPositiveNumber: [
    (v: string | number | null | undefined) => v === null || v === undefined || v === "" || Number(v) >= 0 || t("t-value-must-be-zero-or-greater")
  ],
  requiredPositiveNumber: [
    (v: string | number | null | undefined) => v !== null && v !== undefined && v !== "" || t("t-required-field"),
    (v: string | number | null | undefined) => Number(v) >= 0 || t("t-value-must-be-zero-or-greater")
  ]
};


const clinics = computed(() => {
  return (serviceProviderStore.enabledServiceProviders as ServiceProviderListingForListType[]).map((item) => ({
    value: item.id,
    label: item.name,
  }));
});

const formClinic = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const toast = useToast();
const getServerErrors = (field: string) => serverErrors.value[field] || [];
const toNullableNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await formClinic.value?.validate();
  }
}, { deep: true });

watch(serviceProvider, () => {
  if (suppressServiceProviderDefaults.value || !serviceProvider.value) return;
  applyServiceProviderDefaults();
});

const onSubmit = async () => {
  if (!formClinic.value) return;
  serverErrors.value = {};

  const { valid } = await formClinic.value.validate();
  
  if (!valid) {
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    setTimeout(() => errorMsg.value = "", 5000);
    return;
  }

  localLoading.value = true;

  const payload: ServiceProviderInsertType = {
    id: id.value || undefined,
    serviceProvider: serviceProvider.value.toString(), // Garante que seja string
    company: props.data?.company ?? "",
    isBusinessDays: isBusinessDays.value,
    gracePeriod: toNullableNumber(gracePeriod.value),
    maxDaysAfterService: toNullableNumber(maxDaysAfterService.value),
    enabled: true
  };

  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onError: (error: any) => {
      serverErrors.value = getApiValidationErrors(error);
    },
    onFinally: () => localLoading.value = false
  });
};

onMounted(async () => {
  try {
    await serviceProviderStore.fetchServiceProvidersForDropdown();
    if (!id.value && serviceProvider.value) {
      applyServiceProviderDefaults();
    }
  } catch (error) {
    console.error("Failed to load service providers:", error);
    errorMsg.value = "Falha ao carregar prestadores de serviço";
    errorMsg.value = getFirstApiErrorMessage(error, t("t-message-load-error")) || t("t-message-load-error");
    setTimeout(() => errorMsg.value = "", 5000);
  }
});
</script>
<template>
  <v-dialog v-model="dialogValue" width="760" >
    <v-form ref="formClinic" @submit.prevent="onSubmit"> 
    <Card :title="isCreate ? $t('t-add-contracted-service-provider') : $t('t-edit-contracted-service-provider')" title-class="py-0"
      style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
      <v-card-text >
        <v-row class="">
          <v-col cols="12" lg="8">
            <div class="font-weight-bold mb-2">
              {{ $t('t-service-provider') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="serviceProvider" :items="clinics"
              :loading="serviceProviderStore.loading" :rules="requiredRules.serviceProvider"
              :error-messages="getServerErrors('serviceProvider')" />
          </v-col>
            <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2">
              {{ $t('t-is-business-days') }}
            </div>
            <v-checkbox v-model="isBusinessDays" density="compact" color="primary" class="d-inline-flex">
              <template #label>
                <span>{{ $t('t-count-business-days') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-max-days-after-service') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="maxDaysAfterService"
              type="number"
              :placeholder="$t('t-enter-max-days-after-service')"
              :rules="requiredRules.requiredPositiveNumber"
            />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-grace-period') }}
            </div>
            <TextField
              v-model="gracePeriod"
              type="number"
              :placeholder="$t('t-enter-grace-period')"
              :rules="requiredRules.optionalPositiveNumber"
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
