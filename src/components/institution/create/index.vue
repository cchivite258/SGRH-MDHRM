<script lang="ts" setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";

import ButtonNav from "@/components/institution/create/ButtonNav.vue";
import FormCard from "@/app/common/components/FormCard.vue";
import FormPageHeader from "@/app/common/components/FormPageHeader.vue";
import Step1 from "@/components/institution/create/TabGeneralInfo.vue";
import Step2 from "@/components/institution/create/TabPeriods.vue";
import Step3 from "@/components/institution/create/TabHealthPlan.vue";
import Step4 from "@/components/institution/create/TabOrganizationalStructure.vue";
import Step5 from "@/components/institution/create/TabContacts.vue";
import Step6 from "@/components/institution/create/TabServiceProvider.vue";
import Step7 from "@/components/institution/create/TabEmployees.vue";

import { InstitutionInsertType } from "../types";
import { institutionService } from "@/app/http/httpServiceProvider";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();

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
const headerSaveLabel = computed(() => t("t-save-and-proceed"));

const goBackToList = () => {
  router.push("/institution/list");
};

const onHeaderSave = async () => {
  if (step.value !== 1) return;
  await step1Ref.value?.submitGeneralInfo();
};

const institutionData = reactive<InstitutionInsertType>({
  name: "",
  description: null,
  companyDetailsId: undefined,
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
    institutionData.description = data.description || data.companyDetails?.description || null;
    institutionData.companyDetailsId = data.companyDetailsId || data.companyDetails?.id;
    institutionData.address = data.address || data.companyDetails?.address || null;
    institutionData.phone = data.phone || data.companyDetails?.phone || "";
    institutionData.email = data.email || data.companyDetails?.email || "";
    institutionData.website = data.website || data.companyDetails?.website || null;
    institutionData.incomeTaxNumber = data.incomeTaxNumber || data.companyDetails?.incomeTaxNumber || "";
    institutionData.institutionType = String(data.institutionType?.id || data.companyDetails?.institutionType?.id || "") || undefined;
    institutionData.enabled = data.enabled;
    basicDataValidated.value = true;
  } catch (error) {
    toast.error(t("t-error-loading-institution"));
  } finally {
    loading.value = false;
  }
};

const onStepChange = (value: number) => {
  if (!institutionId.value && value > 1 && !basicDataValidated.value) return;
  step.value = value;
};

const saveInstitution = async () => {
  loading.value = true;
  errorMsg.value = "";
  apiFieldErrors.value = {};

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

      institutionId.value = response?.data?.id;
      basicDataValidated.value = true;
      toast.success(t("t-institution-created-success"));
    }

    if (step.value === 1) {
      step.value = 2;
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

watch(
  () => route.query.tab,
  (newTab) => {
    if (!newTab) return;
    const tabNumber = Number(newTab);
    if (!isNaN(tabNumber) && tabNumber >= 1 && tabNumber <= 7) {
      step.value = tabNumber;
    }
  },
  { immediate: true }
);

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
    :institution-id="institutionId as string"
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

  <FormCard v-if="step === 1" class="institution-form-section">
    <Step1
      ref="step1Ref"
      v-model="institutionData"
      @save="saveInstitution"
      :loading="loading"
      :server-errors="apiFieldErrors"
      :show-actions="false"
      @clear-server-error="clearApiFieldError"
    />
  </FormCard>

  <FormCard v-if="step === 2" class="institution-form-section">
    <Step2 @onStepChange="onStepChange" :institution-id="institutionId" />
  </FormCard>

  <FormCard v-if="step === 3" class="institution-form-section">
    <Step3 @onStepChange="onStepChange" :institution-id="institutionId" />
  </FormCard>

  <FormCard v-if="step === 4" class="institution-form-section">
    <Step4 @onStepChange="onStepChange" :institution-id="institutionId" />
  </FormCard>

  <FormCard v-if="step === 5" class="institution-form-section">
    <Step5 @onStepChange="onStepChange" :institution-id="institutionId" />
  </FormCard>

  <FormCard v-if="step === 6" class="institution-form-section">
    <Step6 @onStepChange="onStepChange" :institution-id="institutionId" />
  </FormCard>

  <FormCard v-if="step === 7" class="institution-form-section">
    <Step7 @onStepChange="onStepChange" :institution-id="institutionId" />
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
