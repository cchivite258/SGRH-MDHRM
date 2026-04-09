<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { getApiErrorMessages, getApiValidationErrors } from "@/app/common/apiErrors";
import { companyDetailsService } from "@/app/http/httpServiceProvider";
import type { InstitutionTypeListing } from "@/components/baseTables/institutionTypes/types";
import type { EntityInsertType } from "@/components/entities/types";
import { useInstitutionTypeStore } from "@/store/baseTables/institutionTypeStore";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const institutionTypeStore = useInstitutionTypeStore();
const props = defineProps({
  isViewMode: {
    type: Boolean,
    default: false
  }
});

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const loading = ref(false);
const errorMsg = ref("");
const apiFieldErrors = ref<Record<string, string[]>>({});

const entityId = computed<string | undefined>(() => {
  if (typeof route.params.id === "string") return route.params.id;
  if (Array.isArray(route.params.id)) return route.params.id[0];
  return undefined;
});

const isEditMode = computed(() => !!entityId.value);
const cardTitle = computed(() => {
  if (props.isViewMode) return "t-view-entity";
  return isEditMode.value ? "t-edit-entity" : "t-add-entity";
});

const formData = reactive<EntityInsertType>({
  name: "",
  description: null,
  address: null,
  phone: "",
  email: "",
  website: null,
  incomeTaxNumber: "",
  institutionType: undefined,
  enabled: true
});

const getServerErrors = (field: string) => apiFieldErrors.value?.[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => {
  return [
    ...rules,
    () => {
      const firstError = getServerErrors(field)[0];
      return firstError || true;
    }
  ];
};

const requiredRules = {
  name: [(v: string) => !!v || t("t-please-enter-institution-name")],
  institutionType: [(v: string) => !!v || t("t-please-enter-institution-type")],
  incomeTaxNumber: [
    (v: string) => !!v || t("t-please-enter-income-tax-number"),
    (v: string) => (v && v.length == 9) || t("t-lenght-must-be-9")
  ],
  address: [
    (v: string) => !!v || t("t-please-enter-address"),
    (v: string) => v.length <= 50 || t("t-max-length-50")
  ],
  phone: [
    (v: string) => !!v || t("t-please-enter-phone-number"),
    (v: string) => /^[0-9+() -]*$/.test(v) || t("t-invalid-phone-numebr")
  ],
  email: [
    (v: string) => !!v || t("t-please-enter-email-address"),
    (v: string) => /.+@.+\..+/.test(v) || t("t-invalid-email")
  ]
};

const institutionTypes = computed(() => {
  return (institutionTypeStore.enabledInstitutionTypes as InstitutionTypeListing[]).map((item) => ({
    value: item.id,
    label: item.name
  }));
});

const normalizeNullableText = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const normalizeRequiredText = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return value.trim();
};

const loadEntity = async (id: string) => {
  loading.value = true;
  try {
    const response = await companyDetailsService.getCompanyDetailsById(id);
    const data = response.data;

    formData.name = data.name || "";
    formData.description = data.description || null;
    formData.address = data.address || null;
    formData.phone = data.phone || "";
    formData.email = data.email || "";
    formData.website = data.website || null;
    formData.incomeTaxNumber = data.incomeTaxNumber || "";
    formData.institutionType = data.institutionType?.id || undefined;
    formData.enabled = data.enabled ?? true;
  } catch (error) {
    toast.error(t("t-error-loading-institution"));
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  if (props.isViewMode) return;
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  loading.value = true;
  errorMsg.value = "";
  apiFieldErrors.value = {};

  const payload: EntityInsertType = {
    ...formData,
    name: normalizeRequiredText(formData.name),
    incomeTaxNumber: normalizeRequiredText(formData.incomeTaxNumber),
    phone: normalizeRequiredText(formData.phone),
    email: normalizeRequiredText(formData.email),
    address: normalizeNullableText(formData.address),
    website: normalizeNullableText(formData.website),
    description: normalizeNullableText(formData.description)
  };

  try {
    const response = isEditMode.value
      ? await companyDetailsService.updateCompanyDetails(entityId.value as string, payload)
      : await companyDetailsService.createCompanyDetails(payload);

    if (response.status === "error") {
      const messages = getApiErrorMessages(response.error, t("t-message-save-error"));
      apiFieldErrors.value = getApiValidationErrors(response.error);
      messages.forEach((message) => toast.error(message));
      errorMsg.value = Object.keys(apiFieldErrors.value).length > 0 ? "" : messages.join("\n");
      return;
    }

    toast.success(isEditMode.value ? t("t-entity-updated-success") : t("t-entity-created-success"));
    router.push("/entities/list");
  } catch (error) {
    const messages = getApiErrorMessages(error, t("t-message-save-error"));
    apiFieldErrors.value = getApiValidationErrors(error);
    messages.forEach((message) => toast.error(message));
    errorMsg.value = Object.keys(apiFieldErrors.value).length > 0 ? "" : messages.join("\n");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await institutionTypeStore.fetchInstitutionTypes();

  if (entityId.value) {
    await loadEntity(entityId.value);
  }
});
</script>

<template>
  <Card :title="$t(cardTitle)">
    <v-form ref="form" @submit.prevent="submit">
      <v-card-text class="pt-0">
        <transition name="fade">
          <v-alert
            v-if="errorMsg"
            :text="errorMsg"
            type="error"
            class="mb-4 mt-2"
            variant="tonal"
            color="danger"
            density="compact"
            @click="errorMsg = ''"
            style="cursor: pointer; white-space: pre-line"
          />
        </transition>

        <v-row class="mt-n6">
          <v-col cols="12" lg="12" class="text-right">
            <div class="font-weight-bold">{{ $t('t-availability') }}</div>
            <v-checkbox
              v-model="formData.enabled"
              density="compact"
              color="primary"
              class="d-inline-flex"
              :disabled="props.isViewMode"
            >
              <template #label>
                <span>{{ $t('t-is-enabled') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>

        <div class="font-weight-bold mb-2 mt-n6">
          {{ $t('t-institution-name') }} <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField
          v-model="formData.name"
          :placeholder="$t('t-enter-institution-name')"
          :rules="applyServerErrorsToRules('name', requiredRules.name)"
          :disabled="props.isViewMode"
        />

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-institution-type') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-if="props.isViewMode"
              :model-value="institutionTypes.find((item) => item.value === formData.institutionType)?.label || ''"
              :disabled="true"
            />
            <MenuSelect
              v-else
              v-model="formData.institutionType"
              :items="institutionTypes"
              :loading="institutionTypeStore.loading"
              :rules="requiredRules.institutionType"
              :error-messages="getServerErrors('institutionType')"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">NUIT <i class="ph-asterisk ph-xs text-danger" /></div>
            <TextField
              v-model="formData.incomeTaxNumber"
              :placeholder="$t('t-enter-nuit')"
              :rules="applyServerErrorsToRules('incomeTaxNumber', requiredRules.incomeTaxNumber)"
              :disabled="props.isViewMode"
            />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-address') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="formData.address"
              :placeholder="$t('t-enter-address')"
              :rules="applyServerErrorsToRules('address', requiredRules.address)"
              :disabled="props.isViewMode"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-phone-number') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="formData.phone"
              :placeholder="$t('t-enter-phone-number')"
              :rules="applyServerErrorsToRules('phone', requiredRules.phone)"
              :disabled="props.isViewMode"
            />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-email') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="formData.email"
              :placeholder="$t('t-enter-email-address')"
              :rules="applyServerErrorsToRules('email', requiredRules.email)"
              :disabled="props.isViewMode"
            />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">{{ $t('t-website') }}</div>
            <TextField
              v-model="formData.website"
              :placeholder="$t('t-enter-website')"
              :rules="applyServerErrorsToRules('website', [])"
              :disabled="props.isViewMode"
            />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="12">
            <div class="font-weight-bold mb-2">{{ $t('t-description') }}</div>
            <TextArea
              v-model="formData.description"
              :placeholder="$t('t-enter-description')"
              :disabled="props.isViewMode"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="d-flex justify-space-between mt-3">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="router.push('/entities/list')">
          {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
        </v-btn>
        <v-btn v-if="!props.isViewMode" color="success" variant="elevated" type="submit" :loading="loading">
          {{ $t('t-save') }}
        </v-btn>
      </v-card-actions>
    </v-form>
  </Card>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

