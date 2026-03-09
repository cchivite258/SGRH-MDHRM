<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import Status from "@/app/common/components/Status.vue";
import ButtonNav from "@/components/institution/create/ButtonNav.vue";
import Step2 from "@/components/institution/create/TabPeriods.vue";
import Step3 from "@/components/institution/create/TabHealthPlan.vue";
import Step4 from "@/components/institution/create/TabOrganizationalStructure.vue";
import Step5 from "@/components/institution/create/TabContacts.vue";
import Step6 from "@/components/institution/create/TabServiceProvider.vue";
import Step7 from "@/components/institution/create/TabEmployees.vue";
import { institutionService } from "@/app/http/httpServiceProvider";
import type { InstitutionInsertType } from "@/components/institution/types";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();

const loading = ref(false);
const step = ref(1);
const institutionId = ref<string | null>(
  typeof route.params.id === "string"
    ? route.params.id
    : Array.isArray(route.params.id)
      ? route.params.id[0]
      : null
);

const institutionData = reactive<InstitutionInsertType & { institutionTypeName?: string }>({
  name: "",
  address: "",
  phone: "",
  email: "",
  website: null,
  description: null,
  incomeTaxNumber: "",
  institutionType: undefined,
  maxNumberOfDependents: null,
  childrenMaxAge: null,
  healthPlanLimit: "",
  fixedAmount: null,
  salaryComponent: undefined,
  companyContributionPercentage: null,
  enabled: true,
  institutionTypeName: ""
});

const onStepChange = (value: number) => {
  step.value = value;
};

onMounted(async () => {
  if (!institutionId.value) return;

  try {
    loading.value = true;
    const response = await institutionService.getInstitutionById(institutionId.value);

    if (!response?.data) {
      throw new Error("Dados da entidade não disponíveis.");
    }

    Object.assign(institutionData, response.data);
    institutionData.institutionType = response.data.institutionType?.id || undefined;
    institutionData.institutionTypeName = response.data.institutionType?.name || "-";
  } catch (error) {
    toast.error(t("t-error-loading-institution"));
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <Card>
    <v-card-text>
      <ButtonNav v-model="step" class="mb-2" :institution-id="institutionId as string" :basic-data-validated="true" />

      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <Card v-if="step === 1" :title="$t('t-general-information')" elevation="0" title-class="pb-0">
        <v-card-text class="pt-0">
          <v-row>
            <v-col cols="12" class="text-right">
              <Status :status="institutionData.enabled ? 'enabled' : 'disabled'" />
            </v-col>
          </v-row>

          <v-row class="mt-n10">
            <v-col cols="12">
              <div class="font-weight-bold mb-2">{{ $t("t-institution-name") }}</div>
              <div>{{ institutionData.name || "-" }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">{{ $t("t-institution-type") }}</div>
              <div>{{ institutionData.institutionTypeName || "-" }}</div>
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">NUIT</div>
              <div>{{ institutionData.incomeTaxNumber || "-" }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">{{ $t("t-address") }}</div>
              <div>{{ institutionData.address || "-" }}</div>
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">{{ $t("t-phone-number") }}</div>
              <div>{{ institutionData.phone || "-" }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">{{ $t("t-email") }}</div>
              <div>{{ institutionData.email || "-" }}</div>
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold mb-2">{{ $t("t-website") }}</div>
              <div>{{ institutionData.website || "-" }}</div>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12">
              <div class="font-weight-bold mb-2">{{ $t("t-description") }}</div>
              <div>{{ institutionData.description || "-" }}</div>
            </v-col>
          </v-row>
        </v-card-text>
      </Card>

      <Step2 v-if="step === 2" :institution-id="institutionId" :is-view-mode="true" @onStepChange="onStepChange" />
      <Step3 v-if="step === 3" :institution-id="institutionId" :is-view-mode="true" @onStepChange="onStepChange" />
      <Step4 v-if="step === 4" :institution-id="institutionId" :is-view-mode="true" @onStepChange="onStepChange" />
      <Step5 v-if="step === 5" :institution-id="institutionId" :is-view-mode="true" @onStepChange="onStepChange" />
      <Step6 v-if="step === 6" :institution-id="institutionId" :is-view-mode="true" @onStepChange="onStepChange" />
      <Step7 v-if="step === 7" :institution-id="institutionId || undefined" :is-view-mode="true" @onStepChange="onStepChange" />
    </v-card-text>
  </Card>
</template>
