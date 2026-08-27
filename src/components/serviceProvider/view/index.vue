<script lang="ts" setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

import FormCard from "@/app/common/components/FormCard.vue";
import FormPageHeader from "@/app/common/components/FormPageHeader.vue";
import Step1 from "@/components/serviceProvider/view/TabGeneralInfo.vue";
import Step2 from "@/components/serviceProvider/view/TabContractInfo.vue";
import Step3 from "@/components/serviceProvider/view/TabServiceProviderContact.vue";
import ButtonNav from "@/components/serviceProvider/view/ButtonNav.vue";
import { serviceProviderService } from "@/app/http/httpServiceProvider";
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";
import { ServiceProviderInsertType } from "@/components/serviceProvider/types";
import { SERVICE_PROVIDER_FORM_TABS, getAllowedFormTabs } from "@/app/permissions/formTabs";
import { usePermissions } from "@/composables/usePermissions";

const props = defineProps({
  cardTitle: {
    type: String,
    default: ""
  }
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const serviceProviderStore = useServiceProviderStore();
const { canAny } = usePermissions();

const step = ref(1);
const serviceProviderId = ref<string | null>(
  typeof route.params.id === "string" ? route.params.id : Array.isArray(route.params.id) ? route.params.id[0] : null
);
const loading = ref(false);
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const headerTitle = computed(() => props.cardTitle || t("t-view-service-provider"));
const accessibleServiceProviderFormTabs = computed(() => getAllowedFormTabs(SERVICE_PROVIDER_FORM_TABS, canAny));
const serviceProviderFormSteps = computed(() => accessibleServiceProviderFormTabs.value.map((tab) => tab.value));
const firstAllowedServiceProviderStep = computed(() => serviceProviderFormSteps.value[0] || 1);
const currentStepIndex = computed(() => serviceProviderFormSteps.value.indexOf(step.value));
const isLastStep = computed(() => currentStepIndex.value === serviceProviderFormSteps.value.length - 1);
const previousServiceProviderStep = computed(() => serviceProviderFormSteps.value[currentStepIndex.value - 1]);
const nextServiceProviderStep = computed(() => serviceProviderFormSteps.value[currentStepIndex.value + 1]);
const isServiceProviderStepAllowed = (value: number) => serviceProviderFormSteps.value.includes(value);
const ensureServiceProviderStepAllowed = () => {
  if (!isServiceProviderStepAllowed(step.value)) {
    step.value = firstAllowedServiceProviderStep.value;
  }
};

let serviceProviderData = reactive<ServiceProviderInsertType>({
  code: null,
  erpCode: null,
  name: "",
  description: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  incomeTaxNumber: "",
  personOfContactFullname1: "",
  personOfContactPhone1: "",
  personOfContactEmail1: "",
  personOfContactFullname2: "",
  personOfContactPhone2: "",
  personOfContactEmail2: "",
  providerTypeId: undefined,
  responsibleId: undefined,
  contractStartDate: undefined,
  contractEndDate: undefined,
  isBusinessDays: false,
  maxDaysAfterService: null,
  enabled: true,
  countryId: undefined,
  provinceId: undefined
});

const goBackToList = () => {
  router.push("/service-provider/list");
};

const handleApiError = (error: any) => {
  if (alertTimeout) {
    clearTimeout(alertTimeout);
    alertTimeout = null;
  }

  let message = t("t-error-saving-service-provider");
  if (error?.response?.data) {
    message = error.response.data.message || message;
  } else if (error.message) {
    message = error.message;
  }

  toast.error(message);
  errorMsg.value = message;
  alertTimeout = setTimeout(() => {
    errorMsg.value = "";
    alertTimeout = null;
  }, 5000);
};

onMounted(async () => {
  if (!serviceProviderId.value) return;

  try {
    loading.value = true;
    const response = await serviceProviderService.getServiceProviderById(serviceProviderId.value);

    if (!response.data) {
      throw new Error("Dados do prestador de servicos nao disponiveis.");
    }

    Object.assign(serviceProviderData, response.data);
  } catch (error) {
    toast.error(t("t-error-loading-service-provider"));
    console.error("Error loading service provider:", error);
  } finally {
    loading.value = false;
  }
});

const onStepChange = (value: number) => {
  if (!isServiceProviderStepAllowed(value)) return;
  step.value = value;
};

watch(accessibleServiceProviderFormTabs, ensureServiceProviderStepAllowed, { immediate: true });

const saveServiceProvider = async (isFinalStep: boolean = false) => {
  try {
    loading.value = true;
    errorMsg.value = "";

    let response;
    if (serviceProviderId.value) {
      response = await serviceProviderService.updateServiceProvider(serviceProviderId.value, serviceProviderData);
    } else {
      response = await serviceProviderService.createServiceProvider(serviceProviderData);

      if (response?.data?.id) {
        serviceProviderId.value = response.data.id;
        serviceProviderStore.setCurrentServiceProviderId(response.data.id);
      } else {
        throw new Error(response?.error?.message || t("t-error-creating-service-provider"));
      }
    }

    serviceProviderStore.setDraftServiceProvider(serviceProviderData);
    toast.success(serviceProviderId.value ? t("t-service-providers-updated-success") : t("t-service-providers-add-success"));

    if (isFinalStep) {
      await serviceProviderStore.fetchServiceProviders();
      router.push("/service-provider/list");
    } else {
      step.value++;
    }
  } catch (error) {
    console.error("Error saving service providers:", error);
    handleApiError(error);
  } finally {
    loading.value = false;
  }
};

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
    subtitle="Consulte os dados do provedor de servico em blocos claros."
    :loading="loading"
    :show-save="false"
    @back="goBackToList"
  />

  <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

  <div class="service-provider-form-tabs">
    <ButtonNav v-model="step" @update:model-value="onStepChange" />
  </div>

  <FormCard v-show="step === 1 && isServiceProviderStepAllowed(1)" class="service-provider-form-section">
    <transition name="fade">
      <v-alert
        v-if="errorMsg"
        :text="errorMsg"
        type="error"
        class="mb-4 mx-5 mt-3"
        variant="tonal"
        color="danger"
        density="compact"
        @click="errorMsg = ''"
        style="cursor: pointer; white-space: pre-line;"
      />
    </transition>

    <Step1
      v-model="serviceProviderData"
      :loading="loading"
      :show-actions="false"
      @on-step-change="onStepChange"
      @save="saveServiceProvider(false)"
    />
  </FormCard>

  <FormCard v-show="step === 2 && isServiceProviderStepAllowed(2)" class="service-provider-form-section">
    <Step2
      v-model="serviceProviderData"
      :loading="loading"
      :show-actions="false"
      @on-step-change="onStepChange"
      @save="saveServiceProvider(true)"
    />
  </FormCard>

  <FormCard v-show="step === 3 && isServiceProviderStepAllowed(3)" class="service-provider-form-section">
    <Step3
      v-model="serviceProviderData"
      :loading="loading"
      :show-actions="false"
      @on-step-change="onStepChange"
      @save="saveServiceProvider(true)"
    />
  </FormCard>

  <div class="service-provider-form-footer-actions">
    <v-btn
      class="service-provider-form-footer-actions__back"
      color="secondary"
      variant="outlined"
      :disabled="loading"
      @click="previousServiceProviderStep ? onStepChange(previousServiceProviderStep) : goBackToList()"
    >
      <i class="ph-arrow-left me-2" />
      {{ previousServiceProviderStep ? $t("t-back") : $t("t-back-to-list") }}
    </v-btn>

    <v-btn
      v-if="!isLastStep"
      class="service-provider-form-footer-actions__next"
      color="secondary"
      variant="elevated"
      :disabled="loading"
      @click="nextServiceProviderStep && onStepChange(nextServiceProviderStep)"
    >
      {{ $t("t-proceed") }} <i class="ph-arrow-right ms-2" />
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

.service-provider-form-footer-actions__next,
.service-provider-form-footer-actions__back {
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 36px;
  padding-inline: 14px;
  text-transform: none;
}

.service-provider-form-footer-actions__next {
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

:deep(.dp__input) {
  height: 2.63rem;
}

.custom-phone-input {
  background-color: #fff;
  border: 1px solid #DDE1EF;
  border-radius: 3px;
  padding: 0;
  color: #ABABAB !important;
}

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

:deep(.m-input-input::placeholder) {
  font-size: 0.75rem !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.v-alert {
  position: relative;
  overflow: hidden;
}

.v-alert::after {
  content: "";
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
