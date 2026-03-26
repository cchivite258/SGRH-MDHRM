<script lang="ts" setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";

import ButtonNav from "@/components/institution/create/ButtonNav.vue";
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

const step = ref(1);
const institutionId = ref<string | undefined>(undefined);
const loading = ref(false);
const errorMsg = ref("");
const apiFieldErrors = ref<Record<string, string[]>>({});
const basicDataValidated = ref(false);

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
  <Card title="">
    <v-card-text>
      <ButtonNav
        v-model="step"
        class="mb-2"
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

      <Step1
        v-if="step === 1"
        v-model="institutionData"
        @save="saveInstitution"
        :loading="loading"
        :server-errors="apiFieldErrors"
        @clear-server-error="clearApiFieldError"
      />
      <Step2 v-if="step === 2" @onStepChange="onStepChange" :institution-id="institutionId" />
      <Step3 v-if="step === 3" @onStepChange="onStepChange" :institution-id="institutionId" />
      <Step4 v-if="step === 4" @onStepChange="onStepChange" :institution-id="institutionId" />
      <Step5 v-if="step === 5" @onStepChange="onStepChange" :institution-id="institutionId" />
      <Step6 v-if="step === 6" @onStepChange="onStepChange" :institution-id="institutionId" />
      <Step7 v-if="step === 7" @onStepChange="onStepChange" :institution-id="institutionId" />
    </v-card-text>
  </Card>
</template>
