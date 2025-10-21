<script lang="ts" setup>

import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { ClinicInsertType } from "../types";

// Configuração inicial
const { t } = useI18n();
const toast = useToast();

// Referência do formulário
const form2 = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

// Emits e Props
const emit = defineEmits<{
  (e: 'onStepChange', step: number): void;
  (e: 'save'): void;
  (e: 'update:modelValue', value: ClinicInsertType): void;
}>();

const props = defineProps<{
  modelValue: ClinicInsertType,
  loading?: boolean
}>();


// Dados computados do employee
let clinicData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});


console.log("Dados a enviar para API:", JSON.stringify(clinicData.value));

// Estado da UI
const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  incomeTaxNumber: [
    (v: string) => !!v || t('t-please-enter-income-tax-number'),
    (v: string) => /^\d{9}$/.test(v) || t('t-income-tax-number-must-have-9-digits'),
  ],
  personOfContactFullname1: [
    (v: string) => !!v || t('t-please-enter-person-of-contact-full-name1'),
    (v: string) => v.length <= 100 || t('t-maximum-100-characters'),
  ],
  personOfContactPhone1: [
    (v: string) => !!v || t('t-please-enter-person-of-contact-phone1'),
    (v: string) => (v.replace(/\D/g, '').length === 9) || t('t-phone-must-have-9-digits'),
  ],
  personOfContactEmail1: [
    (v: string) => !!v || t('t-please-enter-person-of-contact-email1'),
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t('t-invalid-email'),
  ],
  personOfContactFullname2: [
    (v: string) => !!v || t('t-please-enter-person-of-contact-full-name2'),
    (v: string) => v.length <= 100 || t('t-maximum-100-characters'),
  ],
  personOfContactPhone2: [
    (v: string) => !!v || t('t-please-enter-person-of-contact-phone2'),
    (v: string) => (v.replace(/\D/g, '').length === 9) || t('t-phone-must-have-9-digits'),
  ],
  personOfContactEmail2: [
    (v: string) => !!v || t('t-please-enter-person-of-contact-email2'),
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || t('t-invalid-email'),
  ],
}

/**
 * Valida e envia o formulário
 */
const saveData = async () => {
  if (!form2.value) return;

  const { valid } = await form2.value.validate();
  if (!valid) {
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }
  emit('save');
};
</script>

<template>
  <v-form ref="form2" @submit.prevent="saveData">
    <Card :title="$t('t-contacts-clinic')" elevation="0" title-class="pb-0">
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
            <TextField v-model="clinicData.incomeTaxNumber" :placeholder="t('t-enter-income-tax-number')"
              :rules="requiredRules.incomeTaxNumber" />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-full-name1') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="clinicData.personOfContactFullname1"
              :placeholder="t('t-enter-person-of-contact-full-name1')"
              :rules="requiredRules.personOfContactFullname1" />
          </v-col>
        </v-row>

        <!-- Linha 2: Telefone e Email do contacto 1 -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-phone1') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="clinicData.personOfContactPhone1" :placeholder="t('t-enter-person-of-contact-phone1')"
              :rules="requiredRules.personOfContactPhone1" />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-email1') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="clinicData.personOfContactEmail1" :placeholder="t('t-enter-person-of-contact-email1')"
              :rules="requiredRules.personOfContactEmail1" />
          </v-col>
        </v-row>

        <!-- Linha 3: Nome e Telefone do contacto 2 -->
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-full-name2') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="clinicData.personOfContactFullname2"
              :placeholder="t('t-enter-person-of-contact-full-name2')"
              :rules="requiredRules.personOfContactFullname2" />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-phone2') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="clinicData.personOfContactPhone2" :placeholder="t('t-enter-person-of-contact-phone2')"
              :rules="requiredRules.personOfContactPhone2" />
          </v-col>
        </v-row>

        <!-- Linha 4: Email do contacto 2 -->
        <v-row class="mt-n6">
          <v-col cols="12">
            <div class="font-weight-bold mb-2">
              {{ $t('t-person-of-contact-email2') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="clinicData.personOfContactEmail2" :placeholder="t('t-enter-person-of-contact-email2')"
              :rules="requiredRules.personOfContactEmail2" />
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Ações do formulário -->
      <v-card-actions class="d-flex justify-space-between mt-5">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', 1)" :disabled="loading">
          {{ $t('t-back-to-general-info') }} <i class="ph-arrow-left ms-2" />
        </v-btn>

        <v-btn color="success" variant="elevated" @click="saveData" :loading="loading">
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