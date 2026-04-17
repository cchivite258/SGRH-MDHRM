<script lang="ts" setup>
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";

import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { companyDetailsService } from "@/app/http/httpServiceProvider";
import type { EntityListingType } from "@/components/entities/types";
import { InstitutionInsertType } from "@/components/institution/types";

const { t } = useI18n();
const toast = useToast();
const router = useRouter();

const emit = defineEmits(["onStepChange", "save", "update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Object as () => InstitutionInsertType,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  serverErrors: {
    type: Object as () => Record<string, string[]>,
    default: () => ({})
  },
  showActions: {
    type: Boolean,
    default: true
  }
});

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const companyDetails = ref<EntityListingType[]>([]);

const institutionData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  }
});

const selectedEntity = computed(() => {
  const selectedId = String(institutionData.value.companyDetailsId || "");
  return companyDetails.value.find((item) => String(item.id) === selectedId) || null;
});

const companyDetailsOptions = computed(() => {
  return companyDetails.value
    .filter((item) => item.enabled)
    .map((item) => ({
      value: item.id,
      label: item.name
    }));
});

const getServerErrors = (field: string) => props.serverErrors?.[field] || [];

const requiredRules = {
  name: [(v: string) => !!String(v || "").trim() || t("t-please-enter-institution-name")],
  companyDetailsId: [(v: string | number) => !!v || t("t-please-enter-institution")]
};

watch(
  () => props.serverErrors,
  async (errors) => {
    if (errors && Object.keys(errors).length > 0) {
      await nextTick();
      await form.value?.validate();
    }
  },
  { deep: true }
);

const applySelectedEntityToForm = () => {
  const selected = selectedEntity.value;
  if (!selected) return;

  institutionData.value.address = selected.address || null;
  institutionData.value.phone = selected.phone || "";
  institutionData.value.email = selected.email || "";
  institutionData.value.website = selected.website || null;
  institutionData.value.incomeTaxNumber = selected.incomeTaxNumber || "";
  institutionData.value.institutionType = String(selected.institutionType?.id || "") || undefined;
};

watch(
  () => selectedEntity.value,
  () => {
    applySelectedEntityToForm();
  },
  { immediate: true }
);

const onBack = () => {
  router.push("/institution/list");
};

const submitGeneralInfo = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  emit("save", false);
};

defineExpose({ submitGeneralInfo });

onMounted(async () => {
  try {
    const response = await companyDetailsService.getCompanyDetails(0, 500, "createdAt", "asc");
    companyDetails.value = response.content || [];
    applySelectedEntityToForm();
  } catch (error) {
    toast.error(t("t-message-save-error"));
  }
});
</script>

<template>
  <v-form ref="form" @submit.prevent="submitGeneralInfo">
    <Card title="Informações Gerais do Contrato" elevation="0" title-class="pb-0">
      <v-card-text class="pt-0">
        <v-row class="mt-n3">
          <v-col cols="12" lg="12" class="text-right">
            <div class="font-weight-bold">{{ $t('t-availability') }}</div>
            <v-checkbox v-model="institutionData.enabled" density="compact" color="primary" class="d-inline-flex">
              <template #label>
                <span>{{ $t('t-is-enabled') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>

        <v-row class="mt-n9">
          <v-col cols="12" lg="12">
            <div class="font-weight-bold mb-2">
              {{ $t('t-contract-name') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="institutionData.name"
              :rules="requiredRules.name"
              :error-messages="getServerErrors('name')"
            />
          </v-col>
        </v-row>

        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-entity') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <MenuSelect
              v-model="institutionData.companyDetailsId"
              :items="companyDetailsOptions"
              :rules="requiredRules.companyDetailsId"
              :error-messages="getServerErrors('companyDetailsId')"
            />
          </v-col>
          
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">{{ $t('t-institution-type') }}</div>
            <TextField :model-value="selectedEntity?.institutionType?.name || ''" :disabled="true" />
          </v-col>
        </v-row>


        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">NUIT</div>
            <TextField v-model="institutionData.incomeTaxNumber" :disabled="true" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">{{ $t('t-phone-number') }}</div>
            <TextField v-model="institutionData.phone" :disabled="true" />
          </v-col>
        </v-row>

        <v-row class="">
          
          <v-col cols="12" lg="12" class="mt-n6">
            <div class="font-weight-bold ">{{ $t('t-contract-description') }}</div>
            <TextArea
              v-model="institutionData.description"
              :error-messages="getServerErrors('description')"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions v-if="showActions" class="d-flex justify-space-between mt-3">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack()">
          <i class="ph-arrow-left me-2" /> {{ $t('t-back') }}
        </v-btn>
        <v-btn color="secondary" variant="elevated" @click="submitGeneralInfo" :loading="loading">
          {{ $t('t-save-and-proceed') }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-form>
</template>
