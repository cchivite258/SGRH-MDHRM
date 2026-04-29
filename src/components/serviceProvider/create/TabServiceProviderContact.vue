<script lang="ts" setup>

import { ref, computed, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { ServiceProviderInsertType } from "@/components/serviceProvider/types";

// Configuração inicial
const { t } = useI18n();
const toast = useToast();

// Referência do formulário
const form2 = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Emits e Props
const emit = defineEmits<{
  (e: 'onStepChange', step: number): void;
  (e: 'save'): void;
  (e: 'update:modelValue', value: ServiceProviderInsertType): void;
  (e: 'clear-server-error', field: string): void;
}>();

const props = withDefaults(defineProps<{
  modelValue: ServiceProviderInsertType,
  loading?: boolean,
  serverErrors?: Record<string, string[]>,
  showActions?: boolean
}>(), {
  loading: false,
  serverErrors: () => ({}),
  showActions: true
});


// Dados computados do employee
let serviceProviderData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});


console.log("Dados a enviar para API:", JSON.stringify(serviceProviderData.value));

// Estado da UI
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const getServerErrors = (field: string) => props.serverErrors?.[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];
watch(
  () => props.serverErrors,
  async (errors) => {
    if (errors && Object.keys(errors).length > 0) {
      await nextTick();
      await form2.value?.validate();
    }
  },
  { deep: true }
);

watch(() => serviceProviderData.value.incomeTaxNumber, () => emit('clear-server-error', 'incomeTaxNumber'));
watch(() => serviceProviderData.value.personOfContactFullname1, () => emit('clear-server-error', 'personOfContactFullname1'));
watch(() => serviceProviderData.value.personOfContactPhone1, () => emit('clear-server-error', 'personOfContactPhone1'));
watch(() => serviceProviderData.value.personOfContactEmail1, () => emit('clear-server-error', 'personOfContactEmail1'));
watch(() => serviceProviderData.value.personOfContactFullname2, () => emit('clear-server-error', 'personOfContactFullname2'));
watch(() => serviceProviderData.value.personOfContactPhone2, () => emit('clear-server-error', 'personOfContactPhone2'));
watch(() => serviceProviderData.value.personOfContactEmail2, () => emit('clear-server-error', 'personOfContactEmail2'));

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  incomeTaxNumber: [
    (v: string) => !!v || t('t-please-enter-income-tax-number'),
    (v: string) => /^\d{9}$/.test(v) || t('t-income-tax-number-must-have-9-digits'),
  ],
  personOfContactFullname1: [
    (v: string) => !v || v.length <= 512 || t('t-maximum-512-characters'),
  ],
  personOfContactPhone1: [
    (v: string) => !v || v.length <= 20 || t('t-maximum-20-characters'),
  ],
  personOfContactEmail1: [
    (v: string) => !v || v.length <= 255 || t('t-maximum-255-characters'),
    (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t('t-invalid-email'),
  ],
  personOfContactFullname2: [
    (v: string) => !v || v.length <= 512 || t('t-maximum-512-characters'),
  ],
  personOfContactPhone2: [
    (v: string) => !v || v.length <= 20 || t('t-maximum-20-characters'),
  ],
  personOfContactEmail2: [
    (v: string) => !v || v.length <= 255 || t('t-maximum-255-characters'),
    (v: string) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t('t-invalid-email'),
  ],
}

/**
 * Valida e envia o formulário
 */
const validateForm = async () => {
  if (!form2.value) return false;

  const { valid } = await form2.value.validate();
  if (!valid) {
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return false;
  }

  return true;
};

const saveData = async () => {
  const valid = await validateForm();
  if (!valid) return;

  emit('save');
};

defineExpose({ saveData, validateForm });
</script>

<template>
  <v-form ref="form2" @submit.prevent="saveData">
    <Card :title="$t('t-contacts-service-provider')" elevation="0" title-class="pb-0">
      <!-- Mensagem de erro -->
      <transition name="fade">
        <v-alert v-if="errorMsg" :text="errorMsg" type="error" class="mb-4 mx-5 mt-3" variant="tonal" color="danger"
          density="compact" @click="errorMsg = ''" style="cursor: pointer;" />
      </transition>

      <v-card-text class="pt-0">
        <!-- Linha 1: NUIT e Nome do contacto 1 -->
        <v-row class="mt-2">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-income-tax-number') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="serviceProviderData.incomeTaxNumber" :placeholder="t('t-enter-income-tax-number')"
              :rules="applyServerErrorsToRules('incomeTaxNumber', requiredRules.incomeTaxNumber)" />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-full-name1') }}
            </div>
            <TextField v-model="serviceProviderData.personOfContactFullname1"
              :placeholder="t('t-enter-person-of-contact-full-name1')"
              :rules="applyServerErrorsToRules('personOfContactFullname1', requiredRules.personOfContactFullname1)" />
          </v-col>
        </v-row>

        <!-- Linha 2: Telefone e Email do contacto 1 -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-phone1') }}
            </div>
            <TextField v-model="serviceProviderData.personOfContactPhone1" :placeholder="t('t-enter-person-of-contact-phone1')"
              :rules="applyServerErrorsToRules('personOfContactPhone1', requiredRules.personOfContactPhone1)" />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-email1') }}
            </div>
            <TextField v-model="serviceProviderData.personOfContactEmail1" :placeholder="t('t-enter-person-of-contact-email1')"
              :rules="applyServerErrorsToRules('personOfContactEmail1', requiredRules.personOfContactEmail1)" />
          </v-col>
        </v-row>

        <!-- Linha 3: Nome e Telefone do contacto 2 -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-full-name2') }}
            </div>
            <TextField v-model="serviceProviderData.personOfContactFullname2"
              :placeholder="t('t-enter-person-of-contact-full-name2')"
              :rules="applyServerErrorsToRules('personOfContactFullname2', requiredRules.personOfContactFullname2)" />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-phone2') }}
            </div>
            <TextField v-model="serviceProviderData.personOfContactPhone2" :placeholder="t('t-enter-person-of-contact-phone2')"
              :rules="applyServerErrorsToRules('personOfContactPhone2', requiredRules.personOfContactPhone2)" />
          </v-col>
        </v-row>

        <!-- Linha 4: Email do contacto 2 -->
        <v-row class="mt-n6">
          <v-col cols="12">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-email2') }}
            </div>
            <TextField v-model="serviceProviderData.personOfContactEmail2" :placeholder="t('t-enter-person-of-contact-email2')"
              :rules="applyServerErrorsToRules('personOfContactEmail2', requiredRules.personOfContactEmail2)" />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Ações do formulário -->
      <v-card-actions v-if="showActions" class="d-flex justify-space-between mt-5">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', 1)" :disabled="loading">
          <i class="ph-arrow-left me-2" /> {{ $t('t-back-to-general-info') }}
        </v-btn>

        <v-btn color="secondary" variant="elevated" @click="saveData" :loading="loading">
          {{ $t('t-save') }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-form>
</template>


<style scoped>
/* Estilos consistentes com os outros componentes */
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
