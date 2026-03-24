<script lang="ts" setup>
/**
 * TabGeneralInfo - Componente para informações gerais do instituicao
 * 
 */
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';

// Components
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";

// Stores imports
import { useInstitutionTypeStore } from '@/store/baseTables/institutionTypeStore';
import { useInstitutionStore } from '@/store/institution/institutionStore';


// Types
import type { InstitutionTypeListing } from '@/components/baseTables/institutionTypes/types';
import { InstitutionInsertType } from "@/components/institution/types";
import { email } from "@vuelidate/validators";


// Configuração inicial
const { t } = useI18n();
const toast = useToast();
const router = useRouter();


// Emits e Props
const emit = defineEmits(['onStepChange', 'save', 'update:modelValue']);

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
  }
});

// Stores
const institutionStore = useInstitutionStore();
const institutionTypeStore = useInstitutionTypeStore();

// Referências do formulário
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Dados computados do employee
let institutionData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});


// Estado da UI
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const getServerErrors = (field: string) => props.serverErrors?.[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => {
  return [
    ...rules,
    () => {
      const firstError = getServerErrors(field)[0];
      return firstError || true;
    }
  ];
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



/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  name: [
    (v: string) => !!v || t('t-please-enter-institution-name'),
  ],
  institutionType: [
    (v: string) => !!v || t('t-please-enter-institution-type'),
  ],
  incomeTaxNumber: [
    (v: string) => !!v || t('t-please-enter-income-tax-number'),
    (v: string) => (v && v.length == 9) || t('t-lenght-must-be-9'),
  ],
  address: [
    (v: string) => !!v || t('t-please-enter-address'),
    (v: string) => v.length <= 50 || t('t-max-length-50'),
  ],
  phone: [
    (v: string) => !!v || t('t-please-enter-phone-number'),
    (v: string) => /^[0-9+() -]*$/.test(v) || t('t-invalid-phone-numebr'),
  ],
  email: [
    (v: string) => !!v || t('t-please-enter-email-address'),
    (v: string) => /.+@.+\..+/.test(v) || t('t-invalid-email'),
  ],
};

/**
 * Opções para selects (tipos de instituicao)
 */
const institutionTypes = computed(() => {
  return (institutionTypeStore.enabledInstitutionTypes as InstitutionTypeListing[]).map((item) => ({
    value: item.id,
    label: item.name,
  }));
});

/**
 * Carrega dados iniciais quando o componente é montado
 */
onMounted(async () => {
  try {
    await institutionTypeStore.fetchInstitutionTypes();

  } catch (error) {
    console.error("Failed to load tipos de instituicao:", error);
    errorMsg.value = "Falha ao carregar  tipos de instituicao";
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
  }
});

/**
 * Volta para a lista de employees
 */
const onBack = () => {
  institutionStore.clearDraft();
  router.push('/institution/list');
};

const normalizeNullableText = (value: string | null | undefined): string | null => {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

const normalizeRequiredText = (value: string | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return value.trim();
};

/**
 * Valida e envia o formulário
 */
const submitGeneralInfo = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();

  if (!valid) {
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }
  institutionData.value = {
    ...institutionData.value,
    name: normalizeRequiredText(institutionData.value.name),
    incomeTaxNumber: normalizeRequiredText(institutionData.value.incomeTaxNumber),
    phone: normalizeRequiredText(institutionData.value.phone),
    email: normalizeRequiredText(institutionData.value.email),
    address: normalizeNullableText(institutionData.value.address),
    website: normalizeNullableText(institutionData.value.website),
    description: normalizeNullableText(institutionData.value.description),
  };

  emit('save', false);

};

</script>

<template>
  <v-form ref="form" @submit.prevent="submitGeneralInfo">
    <Card :title="$t('t-general-information')" elevation="0" title-class="pb-0">
      <transition name="fade">
        <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
          density="compact" @click="errorMsg = ''" style="cursor: pointer;" />
      </transition>
      <v-card-text class="pt-0">
        <v-row class="mt-n6">
          <v-col cols="12" lg="12" class="text-right">
            <div class="font-weight-bold">{{ $t('t-availability') }}</div>
            <v-checkbox v-model="institutionData.enabled" density="compact" color="primary" class="d-inline-flex">
              <template #label>
                <span>{{ $t('t-is-enabled') }}</span>
              </template>
            </v-checkbox>
          </v-col> 
        </v-row>
        <div class="font-weight-bold mb-2 mt-n6">
          {{ $t('t-institution-name') }} <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="institutionData.name" :placeholder="$t('t-enter-institution-name')"
          :rules="applyServerErrorsToRules('name', requiredRules.name)" />
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-institution-type') }} <i class="ph-asterisk ph-xs text-danger" />  
            </div>
            <MenuSelect v-model="institutionData.institutionType" :items="institutionTypes"
              :loading="institutionTypeStore.loading" :rules="requiredRules.institutionType"
              :error-messages="getServerErrors('institutionType')" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              NUIT <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="institutionData.incomeTaxNumber" :placeholder="$t('t-enter-nuit')"
              :rules="applyServerErrorsToRules('incomeTaxNumber', requiredRules.incomeTaxNumber)" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-address') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="institutionData.address" :placeholder="$t('t-enter-address')"
              :rules="applyServerErrorsToRules('address', requiredRules.address)" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-phone-number') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="institutionData.phone" :placeholder="$t('t-enter-phone-number')"
              :rules="applyServerErrorsToRules('phone', requiredRules.phone)" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-email') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="institutionData.email" :placeholder="$t('t-enter-email-address')"
              :rules="applyServerErrorsToRules('email', requiredRules.email)" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-website') }}
            </div>
            <TextField v-model="institutionData.website" :placeholder="$t('t-enter-website')"
              :rules="applyServerErrorsToRules('website', [])" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12" lg="12">
            <div class="font-weight-bold mb-2">{{ $t('t-description') }}</div>
            <TextArea v-model="institutionData.description" :placeholder="$t('t-enter-description')" />

          </v-col>
        </v-row>
        <!--<v-row class="">
        <v-col cols="12" lg="12">
          <div class="font-weight-bold mb-2">
            {{ $t('t-contract') }} <i class="ph-asterisk ph-xs text-danger" /> 
          </div>
          <ImageUploader v-model="img" />
        </v-col>
      </v-row>-->
      </v-card-text>

      <v-card-actions class="d-flex justify-space-between mt-3">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack()">
          {{ $t('t-back') }} <i class="ph-arrow-left ms-2" />
        </v-btn>
        <v-btn color="success" variant="elevated" @click="submitGeneralInfo" :loading="loading">
          {{ $t('t-save') }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-form>
</template>


<style scoped>
/* Estilos consistentes com o index.vue */
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
