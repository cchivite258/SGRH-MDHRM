<script lang="ts" setup>

import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";

// Components
import FormCard from "@/app/common/components/FormCard.vue";
import FormPageHeader from "@/app/common/components/FormPageHeader.vue";
import Step1 from "@/components/serviceProvider/create/TabGeneralInfo.vue";
import Step2 from "@/components/serviceProvider/create/TabServiceProviderContact.vue";

// Services & Types
import { serviceProviderService } from "@/app/http/httpServiceProvider";

import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore"
import { ServiceProviderInsertType } from "@/components/serviceProvider/types";

// Props
const props = defineProps({
  cardTitle: {
    type: String,
    default: ''
  }
});

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const serviceProviderStore = useServiceProviderStore();

// Refs
const step = ref(1);
const step1Ref = ref<{ validateForm: () => Promise<boolean> } | null>(null);
const step2Ref = ref<{ validateForm: () => Promise<boolean> } | null>(null);
const serviceProviderId = ref<string | null>(
  typeof route.params.id === 'string' ? route.params.id : Array.isArray(route.params.id) ? route.params.id[0] : null
);
const loading = ref(false);
const errorMsg = ref("");
const apiFieldErrors = ref<Record<string, string[]>>({});
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const basicDataValidated = ref(false);
const headerTitle = computed(() => props.cardTitle || (serviceProviderId.value ? t('t-edit-service-provider') : t('t-add-service-provider')));
const headerSaveLabel = computed(() => t('t-save'));

const goBackToList = () => {
  router.push('/service-provider/list');
};

const onHeaderSave = async () => {
  const isGeneralInfoValid = await step1Ref.value?.validateForm();
  const isContactValid = await step2Ref.value?.validateForm();

  if (!isGeneralInfoValid || !isContactValid) return;

  await saveServiceProvider(true);
};

// Dados reativos do formulário
let serviceProviderData = reactive<ServiceProviderInsertType>({
  // Dados da primeira tab
  name: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  website: '',
  incomeTaxNumber: '',
  personOfContactFullname1: '',
  personOfContactPhone1: '',
  personOfContactEmail1: '',
  personOfContactFullname2: '',
  personOfContactPhone2: '',
  personOfContactEmail2: '',
  providerTypeId: undefined,
  contractStartDate: undefined,
  contractEndDate: undefined,
  enabled: true,
  countryId: undefined,
  provinceId: undefined
});

/**
 * Trata erros da API de forma consistente
 * @param error - Objeto de erro da API
 */
const handleApiError = (error: any) => {
  // Limpa timeout anterior se existir
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  const messages = getApiErrorMessages(error, t('t-error-saving-clinic'));
  apiFieldErrors.value = getApiValidationErrors(error);
  messages.forEach((message) => toast.error(message));
  errorMsg.value = Object.keys(apiFieldErrors.value).length > 0 ? "" : messages.join("\n");

  // Configura timeout para limpar a mensagem
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

const clearApiFieldError = (field: string) => {
  if (!apiFieldErrors.value[field]) return;
  const next = { ...apiFieldErrors.value };
  delete next[field];
  apiFieldErrors.value = next;
};

/**
* Carrega dados do employee quando em modo de edição
*/
onMounted(async () => {
  if (serviceProviderId.value) {
    try {
      loading.value = true;
      basicDataValidated.value = true;
      const response = await serviceProviderService.getServiceProviderById(serviceProviderId.value);

      if (!response.data) {
        throw new Error("Dados de provedores de serviços não disponíveis.");
      }

      const data = response.data;

      // Atribui os dados básicos
      Object.assign(serviceProviderData, data);


    } catch (error) {
      toast.error(t('t-error-loading-service-provider'));
      console.error('Error loading service provider:', error);
    } finally {
      loading.value = false;
    }
  }
});


/**
 * Muda entre as abas do formulário
 * @param value - Número da aba (1 ou 2)
 */

const onStepChange = (value: number) => {
  // Permite sempre voltar para tabs anteriores
  if (value < step.value) {
    step.value = value;
    return;
  }

  // No modo de edição ou quando dados básicos já foram validados, permite navegar livremente
  if (serviceProviderId.value || basicDataValidated.value) {
    step.value = value;
    return;
  }

  // No modo criação, só permite avançar para a próxima tab sequencialmente
  if (value === step.value + 1 && basicDataValidated.value) {
    step.value = value;
  }
};

const onBasicDataValidated = () => {
  basicDataValidated.value = true;
};

watch(
  () => serviceProviderData,
  () => {
    if (!serviceProviderId.value && step.value === 1) {
      basicDataValidated.value = false;
    }
  },
  { deep: true }
);



/**
 * Salva os dados do employee
 * @param isFinalStep - Indica se é o passo final (salvar e sair)
 */
const wasEditing = !!serviceProviderId.value; // ← Guarda se já estava em modo edição

const saveServiceProvider = async (isFinalStep: boolean = false) => {
  try {
    loading.value = true;
    errorMsg.value = "";
    apiFieldErrors.value = {};

    console.log("Dados recebidos do Step1:", serviceProviderData);
    const normalizedPayload = { ...serviceProviderData } as ServiceProviderInsertType;
    normalizeObjectStringFieldsInPlace(normalizedPayload as Record<string, any>, {
      name: "trimToEmpty",
      description: "trimToEmpty",
      address: "trimToEmpty",
      phone: "trimToEmpty",
      email: "trimToNull",
      website: "trimToNull",
      incomeTaxNumber: "trimToEmpty",
      personOfContactFullname1: "trimToNull",
      personOfContactPhone1: "trimToNull",
      personOfContactEmail1: "trimToNull",
      personOfContactFullname2: "trimToNull",
      personOfContactPhone2: "trimToNull",
      personOfContactEmail2: "trimToNull",
    });

    let response;
    if (serviceProviderId.value) {
      // Modo edição
      response = await serviceProviderService.updateServiceProvider(serviceProviderId.value, normalizedPayload);
      console.log('Response from updateServiceProvider:', response);
    } else {
      // Modo criação
      response = await serviceProviderService.createServiceProvider(normalizedPayload);
      console.log('Response from createServiceProvider:', response);

      if (response?.data?.id) {
        serviceProviderId.value = response.data.id;
        serviceProviderStore.setCurrentServiceProviderId(response.data.id);
        basicDataValidated.value = true;
      } else {
        throw new Error(response?.error?.message || t('t-error-creating-service-provider'));
      }
    }

    // Verifica se a resposta contém erro
    if (response.status === 'error') {
      handleApiError(response.error);
      return;
    }
    // Salvar draft na store
    Object.assign(serviceProviderData, normalizedPayload);
    serviceProviderStore.setDraftServiceProvider(serviceProviderData);

    // Feedback de sucesso
    toast.success(
      wasEditing
        ? t('t-service-provider-updated-success')
        : t('t-service-provider-add-success')
    );
    // Redirecionamento ou próxima etapa
    if (isFinalStep) {
      await serviceProviderStore.fetchServiceProviders();
      router.push('/service-provider/list');
    } else {
      step.value++;
    }
  } catch (error: any) {
    handleApiError(error);

  } finally {
    loading.value = false;
  }
};

// Limpeza ao desmontar o componente
onBeforeUnmount(() => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }
});
</script>

<template>
  <FormPageHeader
    :title="headerTitle"
    subtitle="Crie e organize os dados do provedor de serviço em blocos claros."
    :save-label="headerSaveLabel"
    :loading="loading"
    @back="goBackToList"
    @save="onHeaderSave"
  />

  <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>
      <!-- Navegação entre abas -->
  <!-- Indicador de loading -->
  <FormCard class="service-provider-form-section">

      <!-- Mensagens de erro -->
      <transition name="fade">
        <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
          density="compact" @click="errorMsg = ''" style="cursor: pointer; white-space: pre-line;" />
      </transition>

      <!-- Abas do formulário -->
      <Step1 ref="step1Ref" @onStepChange="onStepChange" v-model="serviceProviderData"
        @save="saveServiceProvider(false)" :loading="loading" :server-errors="apiFieldErrors"
        :show-actions="false" @clear-server-error="clearApiFieldError" @validated="onBasicDataValidated" />

  </FormCard>

  <FormCard class="service-provider-form-section mt-5">
      <Step2 ref="step2Ref" @onStepChange="onStepChange" v-model="serviceProviderData"
        @save="saveServiceProvider(true)" :loading="loading" :server-errors="apiFieldErrors"
        :show-actions="false" @clear-server-error="clearApiFieldError" />
  </FormCard>

  <div class="service-provider-form-footer-actions">
    <v-btn class="service-provider-form-footer-actions__save" color="secondary" variant="elevated" :loading="loading"
      @click="onHeaderSave">
      <i class="ph-floppy-disk me-2" />
      {{ headerSaveLabel }}
    </v-btn>

    <v-btn class="service-provider-form-footer-actions__back" color="secondary" variant="outlined" :disabled="loading"
      @click="goBackToList">
      <i class="ph-arrow-left me-2" />
      {{ $t('t-back-to-list') }}
    </v-btn>
  </div>
</template>

<style scoped>
.service-provider-form-tabs {
  margin-bottom: 24px;
}

.service-provider-form-footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.service-provider-form-footer-actions__save,
.service-provider-form-footer-actions__back {
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 36px;
  padding-inline: 14px;
  text-transform: none;
}

.service-provider-form-footer-actions__save {
  box-shadow: none;
}

@media (max-width: 767px) {
  .service-provider-form-tabs {
    margin-bottom: 18px;
  }

  .service-provider-form-footer-actions {
    flex-direction: column;
    align-items: stretch;
    margin-top: 18px;
  }
}

/* Estilos para o date picker */
:deep(.dp__input) {
  height: 2.63rem;
}

/* Estilos para inputs de telefone */
.custom-phone-input {
  background-color: #fff;
  border: 1px solid #DDE1EF;
  border-radius: 3px;
  padding: 0;
  color: #ABABAB !important;
}

/* Ajustes para inputs com label */
:deep(.m-input.--has-label .m-input-input) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0.8rem !important;
}

:deep(.m-input.--sm .m-input-input),
:deep(.m-input.--sm .m-input-label) {
  font-size: 0.8rem !important;
  color: #ABABAB !important;
}

/* Placeholder */
:deep(.m-input-input::placeholder) {
  font-size: 0.75rem !important;
}

/* Transição para mensagens de erro */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Barra de progresso para alertas */
.v-alert {
  position: relative;
  overflow: hidden;
}

.v-alert::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  transform: scaleX(0);
  transform-origin: left;
  animation: progressBar 5s linear forwards;
}

@keyframes progressBar {
  to {
    transform: scaleX(1);
  }
}
</style>
