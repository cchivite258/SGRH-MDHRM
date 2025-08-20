<script lang="ts" setup>

import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useI18n } from 'vue-i18n';

// Components
import ButtonNav from "@/components/clinics/create/ButtonNav.vue";
import Step1 from "@/components/clinics/create/TabGeneralInfo.vue";
import Step2 from "@/components/clinics/create/TabClinicContact.vue";

// Services & Types
import { clinicService } from "@/app/http/httpServiceProvider";

import { useClinicStore } from "@/store/clinic/clinicStore"
import { ClinicInsertType } from "../types";

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
const clinicStore = useClinicStore();

// Refs
const step = ref(1);
const clinicId = ref<string | null>(
  typeof route.params.id === 'string' ? route.params.id : Array.isArray(route.params.id) ? route.params.id[0] : null
);
const loading = ref(false);
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const basicDataValidated = ref(false);

// Dados reativos do formulário
let clinicData = reactive<ClinicInsertType>({
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
  enabled: true
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

  // Mensagem de erro padrão
  let message = t('t-error-saving-clinic');

  // Tratamento específico para erros da API
  if (error?.response?.data) {
    if (error.response.data.error) {
      // Erros de validação
      errorMsg.value = error.response.data.message;
      alertTimeout = setTimeout(() => {
        errorMsg.value = "";
        alertTimeout = null;
      }, 5000);
    }
    message = error.response.data.message || message;
  }
  // Erros gerais
  else if (error.message) {
    message = error.message;
  }

  // Exibe erro no toast e no alert
  toast.error(message);
  errorMsg.value = message;

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
  if (clinicId.value) {
    try {
      loading.value = true;
      const response = await clinicService.getClinicById(clinicId.value);

      if (!response.data) {
        throw new Error("Dados da clinic não disponíveis.");
      }

      const data = response.data;

      // Atribui os dados básicos
      Object.assign(clinicData, data);


    } catch (error) {
      toast.error(t('t-error-loading-employee'));
      console.error('Error loading employee:', error);
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
  if (clinicId.value || clinicId.value) {
    step.value = value;
    return;
  }

  // No modo criação, só permite avançar para a próxima tab sequencialmente
  if (value === step.value + 1) {
    step.value = value;
  }
};



/**
 * Salva os dados do employee
 * @param isFinalStep - Indica se é o passo final (salvar e sair)
 */
const wasEditing = !!clinicId.value; // ← Guarda se já estava em modo edição

const saveClinic = async (isFinalStep: boolean = false) => {
  try {
    loading.value = true;
    errorMsg.value = "";

    console.log("Dados recebidos do Step1:", clinicData); // 👈 Aqui imprime os dados

    let response;
    if (clinicId.value) {
      // Modo edição
      response = await clinicService.updateClinic(clinicId.value, clinicData);
      console.log('Response from updateClinic:', response);
    } else {
      // Modo criação
      response = await clinicService.createClinic(clinicData);
      console.log('Response from createClinic:', response);

      if (response?.data?.id) {
        clinicId.value = response.data.id;
        clinicStore.setCurrentClinicId(response.data.id);
        basicDataValidated.value = true;
      } else {
        throw new Error(response?.error?.message || t('t-error-creating-clinic'));
      }
    }

    // Salvar draft na store
    clinicStore.setDraftClinic(clinicData);

    // Feedback de sucesso
    toast.success(
      wasEditing
        ? t('t-clinics-updated-success')
        : t('t-clinics-add-success')
    );
    // Redirecionamento ou próxima etapa
    if (isFinalStep) {
      await clinicStore.fetchClinics();
      router.push('/clinics/list');
    } else {
      step.value++;
    }
  } catch (error) {
    console.error('Error saving clinics:', error);
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
  <Card>
    <v-card-text>
      <!-- Navegação entre abas -->
      <ButtonNav v-model="step" class="mb-2" />

      <!-- Indicador de loading -->
      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-linear>

      <!-- Mensagens de erro -->
      <transition name="fade">
        <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
          density="compact" @click="errorMsg = ''" style="cursor: pointer; white-space: pre-line;" />
      </transition>

      <!-- Abas do formulário -->
      <Step1 v-if="step === 1" @onStepChange="onStepChange" v-model="clinicData" @save="saveClinic(false)"
        :loading="loading" />

      <Step2 v-if="step === 2" @onStepChange="onStepChange" v-model="clinicData" @save="saveClinic(true)"
        :loading="loading" />
    </v-card-text>
  </Card>
</template>

<style scoped>
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