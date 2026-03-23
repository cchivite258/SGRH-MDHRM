<script lang="ts" setup>
/**
 * Institution Create/Edit Component - Main Container
 * 
 * Gerencia o fluxo de criação/edição de funcionários com duas abas:
 * 1. Informações Gerais
 * 2. Estrutura Organizacional
 * 3. Plano de Saúde
 * 4. Pessoas de Contacto
 */
import { ref, reactive, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";
import { normalizeStringValue } from "@/app/common/normalizers";

// Components
import ButtonNav from "@/components/institution/create/ButtonNav.vue";
import Step1 from "@/components/institution/create/TabGeneralInfo.vue";
import Step2 from "@/components/institution/create/TabPeriods.vue";
import Step3 from "@/components/institution/create/TabHealthPlan.vue";
import Step4 from "@/components/institution/create/TabOrganizationalStructure.vue";
import Step5 from "@/components/institution/create/TabContacts.vue";
import Step6 from "@/components/institution/create/TabServiceProvider.vue";
import Step7 from "@/components/institution/create/TabEmployees.vue";



//Stores
import { useInstitutionStore } from '@/store/institution/institutionStore';

// Services & Types
import { InstitutionInsertType } from "../types";
import { institutionService } from "@/app/http/httpServiceProvider";

// Inicialização de stores
const institutionStore = useInstitutionStore();

// Define emit for emitting events
const emit = defineEmits(['institution-created']);

// Composables
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast(); 

const isInstitutionEditRoute = () => route.name === "EditInstitution";
const isInstitutionCreateRoute = () => route.name === "CreateInstitution";
const isInstitutionFormRoute = () => isInstitutionEditRoute() || isInstitutionCreateRoute();

const getRouteInstitutionId = (): string | undefined => {
  if (!isInstitutionEditRoute()) return undefined;
  const rawId = route.params.id;
  if (typeof rawId === "string") return rawId;
  if (Array.isArray(rawId)) return rawId[0];
  return undefined;
};

// Refs
const step = ref(1); // Controla a aba atual (1 ou 2) 
const institutionId = ref<string | undefined>(getRouteInstitutionId());
const isCreated = ref(!institutionId.value); 
const loading = ref(false); // Estado de loading global
const errorMsg = ref(""); // Mensagem de erro global
const apiFieldErrors = ref<Record<string, string[]>>({});
let alertTimeout: ReturnType<typeof setTimeout> | null = null; // Timeout para mensagens de erro

const basicDataValidated = ref(false);

// Dados reativos do formulário
let institutionData = reactive<InstitutionInsertType>({
  // Dados da primeira tab
  name: '',
  address: '',
  phone: '',
  email: '',
  website: null,
  description: null,
  incomeTaxNumber: '',
  institutionType: undefined,

  // Dados da segunda tab
  maxNumberOfDependents: null,
  childrenMaxAge: null,
  healthPlanLimit: '',
  fixedAmount: null,
  salaryComponent: undefined,
  companyContributionPercentage: null,
  enabled: true

});

const loadInstitutionData = async (id: string) => {
  try {
    loading.value = true;
    const response = await institutionService.getInstitutionById(id);

    if (response && response.data) {
      Object.assign(institutionData, response.data);
      institutionData.institutionType = response.data.institutionType?.id || undefined;
    }
  } catch (error) {
    toast.error(t('t-error-loading-institution'));
    console.error('Error loading institution:', error);
  } finally {
    loading.value = false;
  }
};

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

  const messages = getApiErrorMessages(error, t('t-error-saving-employee'));
  messages.forEach((message) => toast.error(message));
  apiFieldErrors.value = getApiValidationErrors(error);
  errorMsg.value = Object.keys(apiFieldErrors.value).length > 0 ? "" : messages.join("\n");

  // Configura timeout para limpar a mensagem
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

/**
 * Carrega dados do employee quando em modo de edição
 */
onMounted(async () => {
  if (!isInstitutionFormRoute()) return;

  institutionStore.loadFromStorage();
  const routeInstitutionId = getRouteInstitutionId();

  // Em modo edição, o ID da rota é a fonte de verdade.
  if (routeInstitutionId) {
    institutionId.value = routeInstitutionId;
    basicDataValidated.value = true;
    await loadInstitutionData(routeInstitutionId);
    return;
  }

  // Em modo criação, permite retomar o draft salvo.
  if (institutionStore.currentInstitutionId) {
    institutionId.value = institutionStore.currentInstitutionId;
    basicDataValidated.value = true;
  }

  if (institutionId.value) {
    await loadInstitutionData(institutionId.value);
  }
});

watch(
  () => route.params.id,
  async () => {
    if (!isInstitutionEditRoute()) return;

    const routeInstitutionId = getRouteInstitutionId();

    // Se saiu de edição para create, não manter ID anterior em memória.
    if (!routeInstitutionId) {
      institutionId.value = undefined;
      return;
    }

    if (institutionId.value === routeInstitutionId) return;
    institutionId.value = routeInstitutionId;
    basicDataValidated.value = true;
    await loadInstitutionData(routeInstitutionId);
  }
);

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
  if (institutionId.value || basicDataValidated.value) {
    step.value = value;
    return;
  }

  // No modo criação, só permite avançar para a próxima tab sequencialmente
  if (value === step.value + 1) {
    step.value = value;
  }
};

const clearApiFieldError = (field: string) => {
  if (!apiFieldErrors.value[field]) return;
  const next = { ...apiFieldErrors.value };
  delete next[field];
  apiFieldErrors.value = next;
};

// Modifique a função onStepChange para:
const onStepChangeforDialog = (value: number) => {
  // Se veio de query param, respeita esse valor
  if (route.query.tab) {
    const tabFromQuery = Number(route.query.tab);
    if (!isNaN(tabFromQuery)) {  // Corrigido: parêntese fechando
      step.value = tabFromQuery;
      // Remove o query param para não interferir em navegações futuras
      router.replace({ query: {} });
      return;
    }
  }

  // Permite sempre voltar para tabs anteriores
  if (value < step.value) {
    step.value = value;
    return;
  }

  // No modo de edição ou quando dados básicos já foram validados, permite navegar livremente
  if (institutionId.value || basicDataValidated.value) {
    step.value = value;
    return;
  }

  // No modo criação, só permite avançar para a próxima tab sequencialmente
  if (value === step.value + 1) {
    step.value = value;
  }
};

// E o watcher deve ficar assim:
watch(() => route.query.tab, (newTab) => {
  if (newTab) {
    const tabNumber = Number(newTab);
    if (!isNaN(tabNumber)) {  // Corrigido: parêntese fechando
      onStepChange(tabNumber);
    }
  }
}, { immediate: true });


/**
 * Salva os dados do employee
 * @param isFinalStep - Indica se é o passo final (salvar e sair)
 */
const saveInstitution = async (isFinalStep: boolean = false) => { 
  try {
    loading.value = true;
    errorMsg.value = "";
    apiFieldErrors.value = {};
    institutionData.website = normalizeStringValue(institutionData.website, "trimToNull");

    let response;
    if (institutionId.value) {
      // Modo edição
      response = await institutionService.updateInstitution(institutionId.value, institutionData);

    } else {

      // Modo criação
      response = await institutionService.createInstitution(institutionData);

      if (response?.data?.id) {
        institutionId.value = response.data.id;
        institutionStore.setCurrentInstitutionId(response.data.id);
        basicDataValidated.value = true;

        emit('institution-created', response.data.id);
      } else {
        throw new Error(response?.error?.message || t('t-error-creating-employee'));
      }
    }

    // Salvar draft na store
    institutionStore.setDraftInstitution(institutionData);

    // Feedback de sucesso
    toast.success(isCreated.value
      ? t('t-institution-created-success')
      : t('t-institution-updated-success'));

    // Redirecionamento ou próxima etapa
    if (isFinalStep) {
      await institutionStore.fetchInstitutions();
      router.push('/institution/list');
    } else {
      step.value++;
    }

  } catch (error) {
    console.error('Error saving institution:', error);
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
  <Card title="">
    <v-card-text>
      <ButtonNav v-model="step" class="mb-2" :institution-id="institutionId as string"
        :basic-data-validated="basicDataValidated" />

        <!-- Indicador de loading -->
        <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

        <!-- Mensagens de erro -->
      <transition name="fade">
        <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
          density="compact" @click="errorMsg = ''" style="cursor: pointer; white-space: pre-line;" />
      </transition>

      <Step1 v-if="step === 1" @onStepChange="onStepChange" v-model="institutionData" @save="saveInstitution(false)"
        :loading="loading" :server-errors="apiFieldErrors" @clear-server-error="clearApiFieldError" />
      <Step2 v-if="step === 2" @onStepChange="onStepChange" :institution-id="institutionId" />
      <Step3 v-if="step === 3" @onStepChange="onStepChange" :institution-id="institutionId"/>
      <Step4 v-if="step === 4" @onStepChange="onStepChange" :institution-id="institutionId"/>
      <Step5 v-if="step === 5" @onStepChange="onStepChange" :institution-id="institutionId"/>
      <Step6 v-if="step === 6" @onStepChange="onStepChange" :institution-id="institutionId"/>
      <Step7 v-if="step === 7" @onStepChange="onStepChange" :institution-id="institutionId"/>
    </v-card-text>
  </Card>
</template>
