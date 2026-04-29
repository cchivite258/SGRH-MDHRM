<script lang="ts" setup>
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import FormCard from "@/app/common/components/FormCard.vue";
import FormPageHeader from "@/app/common/components/FormPageHeader.vue";
import Status from "@/app/common/components/Status.vue";
import { companyDetailsService } from "@/app/http/httpServiceProvider";
import type { EntityInsertType } from "@/components/entities/types";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const entityId = ref<string | null>(
  typeof route.params.id === "string"
    ? route.params.id
    : Array.isArray(route.params.id)
      ? route.params.id[0]
      : null
);

const entityData = reactive<EntityInsertType & { institutionTypeName?: string }>({
  name: "",
  description: null,
  address: null,
  phone: "",
  email: "",
  website: null,
  incomeTaxNumber: "",
  institutionType: undefined,
  enabled: true,
  institutionTypeName: ""
});

onMounted(async () => {
  if (!entityId.value) return;

  try {
    loading.value = true;
    const response = await companyDetailsService.getCompanyDetailsById(entityId.value);

    if (!response?.data) {
      throw new Error("Dados da entidade não disponíveis.");
    }

    Object.assign(entityData, response.data);
    entityData.institutionType = response.data.institutionType?.id || undefined;
    entityData.institutionTypeName = response.data.institutionType?.name || "-";
  } catch (error) {
    toast.error(t("t-error-loading-institution"));
  } finally {
    loading.value = false;
  }
});

const goBackToList = () => {
  router.push("/entities/list");
};
</script>

<template>
  <FormPageHeader
    :title="$t('t-view-entity')"
    subtitle="Consulte os dados institucionais e de contacto da entidade."
    :show-save="false"
    @back="goBackToList"
  />

  <FormCard class="entity-form-section">
    <v-card-text class="pt-0">
      <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

      <v-row>
        <v-col cols="12" class="text-right">
          <Status :status="entityData.enabled ? 'enabled' : 'disabled'" />
        </v-col>
      </v-row>

      <v-row class="mt-n10">
        <v-col cols="12">
          <div class="font-weight-bold mb-2">{{ $t("t-institution-name") }}</div>
          <div>{{ entityData.name || "-" }}</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">{{ $t("t-institution-type") }}</div>
          <div>{{ entityData.institutionTypeName || "-" }}</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">NUIT</div>
          <div>{{ entityData.incomeTaxNumber || "-" }}</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">{{ $t("t-address") }}</div>
          <div>{{ entityData.address || "-" }}</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">{{ $t("t-phone-number") }}</div>
          <div>{{ entityData.phone || "-" }}</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">{{ $t("t-email") }}</div>
          <div>{{ entityData.email || "-" }}</div>
        </v-col>
        <v-col cols="12" lg="6">
          <div class="font-weight-bold mb-2">{{ $t("t-website") }}</div>
          <div>{{ entityData.website || "-" }}</div>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <div class="font-weight-bold mb-2">{{ $t("t-description") }}</div>
          <div>{{ entityData.description || "-" }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </FormCard>
</template>
