<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";

import ButtonNav from "@/components/institution/create/ButtonNav.vue";
import FormCard from "@/app/common/components/FormCard.vue";
import FormPageHeader from "@/app/common/components/FormPageHeader.vue";
import ContractResponsibles from "@/components/institution/create/ContractResponsibles.vue";
import Step1 from "@/components/institution/create/TabGeneralInfo.vue";
import Step2 from "@/components/institution/create/TabPeriods.vue";
import Step3 from "@/components/institution/create/TabHealthPlan.vue";
import Step4 from "@/components/institution/create/TabOrganizationalStructure.vue";
import Step5 from "@/components/institution/create/TabContacts.vue";
import Step6 from "@/components/institution/create/TabServiceProvider.vue";
import Step7 from "@/components/institution/create/TabEmployees.vue";

import { InstitutionInsertType } from "../types";
import { institutionService } from "@/app/http/httpServiceProvider";
import { CONTRACT_FORM_TABS, getAllowedFormTabs } from "@/app/permissions/formTabs";
import { usePermissions } from "@/composables/usePermissions";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const { canAny } = usePermissions();

const props = defineProps({
  cardTitle: {
    type: String,
    default: ""
  }
});

const step = ref(1);
const step1Ref = ref<{ submitGeneralInfo: () => Promise<void> } | null>(null);
const institutionId = ref<string | undefined>(undefined);
const loading = ref(false);
const errorMsg = ref("");
const apiFieldErrors = ref<Record<string, string[]>>({});
const basicDataValidated = ref(false);
const headerTitle = computed(() => props.cardTitle || (institutionId.value ? t("t-edit-institution") : t("t-add-institution")));
const canUseHeaderSave = computed(() => step.value === 1);
const headerSaveLabel = computed(() => institutionId.value ? t("t-save-and-proceed") : t("t-save"));
const accessibleContractFormTabs = computed(() => getAllowedFormTabs(CONTRACT_FORM_TABS, canAny));
const contractFormSteps = computed(() => accessibleContractFormTabs.value.map((tab) => tab.value));
const firstAllowedContractStep = computed(() => contractFormSteps.value[0] || 1);
const currentContractStepIndex = computed(() => contractFormSteps.value.indexOf(step.value));
const previousContractStep = computed(() => contractFormSteps.value[currentContractStepIndex.value - 1] || null);
const nextContractStep = computed(() => contractFormSteps.value[currentContractStepIndex.value + 1] || null);
const isContractStepAllowed = (value: number) => contractFormSteps.value.includes(value);
const ensureContractStepAllowed = () => {
  if (!isContractStepAllowed(step.value)) {
    step.value = firstAllowedContractStep.value;
  }
};

const goBackToList = () => {
  router.push("/institution/list");
};

const onHeaderSave = async () => {
  if (step.value !== 1) return;
  await step1Ref.value?.submitGeneralInfo();
};

const institutionData = reactive<InstitutionInsertType>({
  code: null,
  erpCode: null,
  name: "",
  description: null,
  companyDetailsId: undefined,
  responsibleId: undefined,
  address: null,
  phone: "",
  email: "",
  website: null,
  incomeTaxNumber: "",
  institutionType: undefined,
  enabled: true
});

const toSingleString = (value: unknown): string | undefined => {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const firstString = value.find((item): item is string => typeof item === "string");
    return firstString;
  }
  return undefined;
};

const getRouteInstitutionId = (): string | undefined => {
  const byParam = toSingleString(route.params.id);
  if (byParam) return byParam;

  return toSingleString(route.query.institutionId);
};

const clearApiFieldError = (field: string) => {
  if (!apiFieldErrors.value[field]) return;
  const next = { ...apiFieldErrors.value };
  delete next[field];
  apiFieldErrors.value = next;
};

const loadInstitutionData = async (id: string) => {
  loading.value = true;
  try {
    const response = await institutionService.getInstitutionById(id);
    const data = response.data;

    institutionData.name = data.name || data.companyDetails?.name || "";
    institutionData.code = data.code || null;
    institutionData.erpCode = data.erpCode || null;
    institutionData.description = data.description || data.companyDetails?.description || null;
    institutionData.companyDetailsId = data.companyDetailsId || data.companyDetails?.id;
    institutionData.responsibleId = data.responsibleId || data.responsible?.id || undefined;
    institutionData.address = data.address || data.companyDetails?.address || null;
    institutionData.phone = data.phone || data.companyDetails?.phone || "";
    institutionData.email = data.email || data.companyDetails?.email || "";
    institutionData.website = data.website || data.companyDetails?.website || null;
    institutionData.incomeTaxNumber = data.incomeTaxNumber || data.companyDetails?.incomeTaxNumber || "";
    institutionData.institutionType = String(data.institutionType?.id || data.companyDetails?.institutionType?.id || "") || undefined;
    institutionData.enabled = data.enabled;
    basicDataValidated.value = true;
  } catch (error) {
    getApiErrorMessages(error, t("t-error-loading-institution")).forEach((message) => toast.error(message));
  } finally {
    loading.value = false;
  }
};

const onStepChange = (value: number) => {
  if (!isContractStepAllowed(value)) return;
  if (!institutionId.value && value > 1 && !basicDataValidated.value) return;
  step.value = value;
};

const goToNextAvailableStep = () => {
  const currentStepIndex = contractFormSteps.value.indexOf(step.value);
  if (currentStepIndex === -1) {
    step.value = firstAllowedContractStep.value;
    return;
  }

  const nextStep = contractFormSteps.value[currentStepIndex + 1];
  if (nextStep) {
    step.value = nextStep;
  }
};

const saveInstitution = async () => {
  loading.value = true;
  errorMsg.value = "";
  apiFieldErrors.value = {};
  const isNewInstitution = !institutionId.value;

  try {
    let response: any;
    if (institutionId.value) {
      await institutionService.updateInstitution(institutionId.value, institutionData);
      toast.success(t("t-institution-updated-success"));
    } else {
      response = await institutionService.createInstitution(institutionData);
      if (response?.status === "error") {
        const messages = getApiErrorMessages(response.error, t("t-message-save-error"));
        apiFieldErrors.value = getApiValidationErrors(response.error);
        messages.forEach((m) => toast.error(m));
        return;
      }

      institutionId.value = response?.data?.id !== undefined && response?.data?.id !== null
        ? String(response.data.id)
        : undefined;

      if (institutionId.value) {
        const createdContract = await institutionService.getInstitutionById(institutionId.value);
        institutionData.code = createdContract.data.code || null;
        institutionData.erpCode = createdContract.data.erpCode || institutionData.erpCode || null;
      }

      basicDataValidated.value = true;
      toast.success(t("t-institution-created-success"));
    }

    if (step.value === 1 && !isNewInstitution) {
      goToNextAvailableStep();
    }
  } catch (error) {
    const messages = getApiErrorMessages(error, t("t-message-save-error"));
    apiFieldErrors.value = getApiValidationErrors(error);
    messages.forEach((m) => toast.error(m));
    errorMsg.value = Object.keys(apiFieldErrors.value).length ? "" : messages.join("\n");
  } finally {
    loading.value = false;
  }
};

const applyRouteTab = () => {
  const routeTab = toSingleString(route.query.tab);
  if (!routeTab) return;

  const tabNumber = Number(routeTab);
  if (isNaN(tabNumber) || tabNumber < 1 || tabNumber > 7) return;

  onStepChange(tabNumber);
};

watch(
  [
    () => route.query.tab,
    institutionId,
    basicDataValidated,
    () => contractFormSteps.value.join(",")
  ],
  applyRouteTab,
  { immediate: true }
);

watch(accessibleContractFormTabs, ensureContractStepAllowed, { immediate: true });

onMounted(async () => {
  institutionId.value = getRouteInstitutionId();
  if (institutionId.value) {
    await loadInstitutionData(institutionId.value);
  }
});
</script>

<template>
  <FormPageHeader
    :title="headerTitle"
    subtitle="Crie e organize os dados do contrato em blocos claros."
    :save-label="headerSaveLabel"
    :loading="loading"
    :show-save="canUseHeaderSave"
    @back="goBackToList"
    @save="onHeaderSave"
  />

  <ButtonNav
    v-model="step"
    class="institution-form-tabs"
    :institution-id="institutionId || ''"
    :basic-data-validated="basicDataValidated"
  />

  <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

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
      style="cursor: pointer; white-space: pre-line"
    />
  </transition>

  <FormCard v-if="step === 1 && isContractStepAllowed(1)" class="institution-form-section">
    <Step1
      ref="step1Ref"
      v-model="institutionData"
      :institution-id="institutionId || ''"
      @save="saveInstitution"
      :loading="loading"
      :server-errors="apiFieldErrors"
      :show-actions="false"
      @clear-server-error="clearApiFieldError"
    />
  </FormCard>

  <FormCard v-if="step === 1 && isContractStepAllowed(1) && institutionId" class="institution-form-section institution-form-section--responsibles">
    <ContractResponsibles :contract-id="institutionId" />
  </FormCard>

  <FormCard v-if="step === 2 && isContractStepAllowed(2)" class="institution-form-section">
    <Step2
      @onStepChange="onStepChange"
      :institution-id="institutionId"
      :previous-step="previousContractStep"
      :next-step="nextContractStep"
    />
  </FormCard>

  <FormCard v-if="step === 3 && isContractStepAllowed(3)" class="institution-form-section">
    <Step3
      @onStepChange="onStepChange"
      :institution-id="institutionId"
      :previous-step="previousContractStep"
      :next-step="nextContractStep"
    />
  </FormCard>

  <FormCard v-if="step === 4 && isContractStepAllowed(4)" class="institution-form-section">
    <Step4
      @onStepChange="onStepChange"
      :institution-id="institutionId"
      :previous-step="previousContractStep"
      :next-step="nextContractStep"
    />
  </FormCard>

  <FormCard v-if="step === 5 && isContractStepAllowed(5)" class="institution-form-section">
    <Step5
      @onStepChange="onStepChange"
      :institution-id="institutionId"
      :previous-step="previousContractStep"
      :next-step="nextContractStep"
    />
  </FormCard>

  <FormCard v-if="step === 6 && isContractStepAllowed(6)" class="institution-form-section">
    <Step6
      @onStepChange="onStepChange"
      :institution-id="institutionId"
      :previous-step="previousContractStep"
      :next-step="nextContractStep"
    />
  </FormCard>

  <FormCard v-if="step === 7 && isContractStepAllowed(7)" class="institution-form-section">
    <Step7
      @onStepChange="onStepChange"
      :institution-id="institutionId"
      :previous-step="previousContractStep"
      :next-step="nextContractStep"
    />
  </FormCard>

  <div v-if="step === 1" class="institution-form-footer-actions">
    <v-btn
      class="institution-form-footer-actions__save"
      color="secondary"
      variant="elevated"
      :loading="loading"
      @click="onHeaderSave"
    >
      <i class="ph-floppy-disk me-2" />
      {{ headerSaveLabel }}
    </v-btn>

    <v-btn
      class="institution-form-footer-actions__back"
      color="secondary"
      variant="outlined"
      :disabled="loading"
      @click="goBackToList"
    >
      <i class="ph-arrow-left me-2" />
      {{ $t('t-back-to-list') }}
    </v-btn>
  </div>
</template>

<style scoped>
.institution-form-tabs {
  margin-bottom: 24px;
}

.institution-form-section + .institution-form-section {
  margin-top: 24px;
}

.institution-form-section--responsibles :deep(.form-card__body) {
  padding-top: 0 !important;
}

.institution-form-footer-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.institution-form-footer-actions__save,
.institution-form-footer-actions__back {
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0;
  min-height: 36px;
  padding-inline: 14px;
  text-transform: none;
}

.institution-form-footer-actions__save {
  box-shadow: none;
}

@media (max-width: 767px) {
  .institution-form-tabs {
    margin-bottom: 18px;
  }

  .institution-form-section + .institution-form-section {
    margin-top: 18px;
  }

  .institution-form-footer-actions {
    flex-direction: column;
    align-items: stretch;
    margin-top: 18px;
  }
}
</style>
