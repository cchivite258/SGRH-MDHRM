<script lang="ts" setup>
import { PropType, computed, ref, watch, onMounted } from "vue";
import { ServiceProviderInsertType, ServiceProviderListingType } from "@/components/institution/types";
import { ServiceProviderListingForListType } from "@/components/serviceProvider/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

const { t } = useI18n();
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'onSubmit', data: ServiceProviderInsertType, callbacks?: {  
    onSuccess?: () => void,
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
const id = ref("");
const serviceProvider = ref<string | number>(""); // Pode ser string ou number

// Watch for data changes
watch(() => props.data, (newData) => {
  if (!newData) return;
  
  id.value = newData.id || "";
  
  // Tratamento para ambos os tipos de dados
  if (typeof newData.serviceProvider === 'object' && newData.serviceProvider !== null) {
    serviceProvider.value = newData.serviceProvider.id; // Para ServiceProviderListingType
  } else {
    serviceProvider.value = newData.serviceProvider; // Para ServiceProviderInsertType
  }
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

const onSubmit = async () => {
  if (!formClinic.value) return;

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
    enabled: true
  };

  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onFinally: () => localLoading.value = false
  });
};

onMounted(async () => {
  try {
    await serviceProviderStore.fetchServiceProvidersForDropdown();
  } catch (error) {
    console.error("Failed to load service providers:", error);
    errorMsg.value = "Falha ao carregar prestadores de serviço";
    setTimeout(() => errorMsg.value = "", 5000);
  }
});
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" >
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
          <v-col cols="12" lg="12">
            <div class="font-weight-bold mb-2">
              {{ $t('t-service-provider') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect v-model="serviceProvider" :items="clinics"
              :loading="serviceProviderStore.loading" :rules="requiredRules.serviceProvider" />
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
