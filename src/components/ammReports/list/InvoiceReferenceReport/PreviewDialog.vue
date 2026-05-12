<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { invoiceReferenceReportService } from "@/app/http/httpServiceProvider";
import { useInvoiceReferenceReportStore } from "@/store/reports/invoiceReferenceReportStore";
import { useRouter } from "vue-router";
import type { InvoiceReferenceReportFilterType } from "@/components/ammReports/types";
import { useInstitutionStore } from "@/store/institution/institutionStore";
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();
const reportStore = useInvoiceReferenceReportStore();
const institutionStore = useInstitutionStore();
const serviceProviderStore = useServiceProviderStore();

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);
const contractId = ref("");
const serviceProviderId = ref("");
const invoiceReferenceNumber = ref("");
const localLoading = ref(false);

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const institutions = computed(() => {
  return (institutionStore.enabledInstitutions || []).map((item: any) => ({
    value: item.id,
    label: item.name,
  }));
});

const providers = computed(() => {
  const list = serviceProviderStore.enabledServiceProviders?.length
    ? serviceProviderStore.enabledServiceProviders
    : serviceProviderStore.service_provider_list;

  return (list || []).map((item: any) => ({
    value: item.id,
    label: item.name,
  }));
});

const requiredRules = {
  contractId: [(v: string) => !!v || t("t-please-enter-institution")],
  serviceProviderId: [(v: string) => !!v || t("t-please-enter-service-provider")],
  invoiceReferenceNumber: [(v: string) => !!v?.trim() || t("t-please-enter-invoice-reference")],
};

const onSubmit = async () => {
  if (!form.value) return;
  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;
  const payload: InvoiceReferenceReportFilterType = {
    contractId: contractId.value,
    serviceProviderId: serviceProviderId.value,
    invoiceReferenceNumber: invoiceReferenceNumber.value.trim(),
  };

  const response = await invoiceReferenceReportService.createReport(payload);
  localLoading.value = false;

  if (response.status === "error") {
    toast.error(response.error?.message || t("t-error-generating-report"));
    return;
  }

  reportStore.setReport(response.data);
  emit("update:modelValue", false);
  router.push({ name: "ReportPreview100010" });
};

onMounted(async () => {
  await institutionStore.fetchInstitutionsforListing(0, 10000000);
  await serviceProviderStore.fetchServiceProvidersForDropdown(0, 10000000);
});
</script>

<template>
  <v-dialog :model-value="props.modelValue" width="500" persistent>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="$t('t-filters')" title-class="py-0">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="emit('update:modelValue', false)" />
        </template>

        <v-divider />
        <v-card-text>
          <v-row>
            <v-col cols="12" class="mt-1">
              <div class="font-weight-bold text-caption mb-1">{{ $t("t-institution") }} <i class="ph-asterisk text-danger" /></div>
              <MenuSelect v-model="contractId" :items="institutions" :rules="requiredRules.contractId" :loading="institutionStore.loading" />
            </v-col>

            <v-col cols="12" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">{{ $t("t-service-provider") }} <i class="ph-asterisk text-danger" /></div>
              <MenuSelect v-model="serviceProviderId" :items="providers" :rules="requiredRules.serviceProviderId" :loading="serviceProviderStore.loading" />
            </v-col>

            <v-col cols="12" class="mt-n6">
              <div class="font-weight-bold text-caption mb-1">{{ $t("t-invoice-reference") }} <i class="ph-asterisk text-danger" /></div>
              <TextField v-model="invoiceReferenceNumber" :placeholder="$t('t-enter-invoice-reference')" :rules="requiredRules.invoiceReferenceNumber" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="emit('update:modelValue', false)">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t("t-preparing") : $t("t-preview") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
