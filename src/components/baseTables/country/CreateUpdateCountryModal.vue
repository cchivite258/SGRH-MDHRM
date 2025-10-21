<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { CountryInsertType } from "@/components/baseTables/country/types";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["update:modelValue", "onSubmit"]);

const prop = defineProps({
  modelValue: { type: Boolean, default: false },
  data: { type: Object as PropType<CountryInsertType>, required: true },
  error: { type: String, default: "" } // <- erro da API
});

const { t } = useI18n();

const isCreate = computed(() => prop.data.id === "-1");
const dialogValue = computed({
  get: () => prop.modelValue,
  set: (val: boolean) => emit("update:modelValue", val),
});

const formData = ref(prop.data);
const id = ref(formData.value.id || "");
const name = ref(formData.value.name || "");
const code = ref(formData.value.code || "");
const iso2Code = ref(formData.value.iso2Code || "");
const iso3Code = ref(formData.value.iso3Code || "");
const phoneCode = ref(formData.value.phoneCode || "");
const currency = ref(formData.value.currency || "");
const currencySymbol = ref(formData.value.currencySymbol || "");
const currencyCode = ref(formData.value.currencyCode || "");
const errorMessage = computed(() => prop.error); // <- mostrar erro da API
const validationAlertMessage = ref('');
const enabled = ref(formData.value.enabled);
let validationAlertTimeout: ReturnType<typeof setTimeout> | null = null;
const localLoading = ref(false);

const formErrors = ref<Record<string, string>>({
  name: '',
  code: '',
  iso2Code: '',
  iso3Code: '',
  phoneCode: '',
  currency: '',
  currencySymbol: '',
  currencyCode: '',
});

const validateForm = () => {
  let isValid = true;

  // Limpar erros anteriores
  Object.keys(formErrors.value).forEach(key => {
    formErrors.value[key] = '';
  });

  validationAlertMessage.value = '';

  const addError = (field: keyof typeof formErrors.value, msg: string) => {
    formErrors.value[field] = msg;
    validationAlertMessage.value = msg;

    if (validationAlertTimeout) clearTimeout(validationAlertTimeout);
    validationAlertTimeout = setTimeout(() => {
      validationAlertMessage.value = '';
      validationAlertTimeout = null;
    }, 5000);
  };

  if (!name.value.trim()) {
    addError('name', t('t-please-enter-name'));
    return false;
  }

  if (!code.value.trim()) {
    addError('code', t('t-please-enter-code'));
    return false;
  }

  if (!iso2Code.value.trim()) {
    addError('iso2Code', t('t-please-enter-iso2-code'));
    return false;
  }

  if (!iso3Code.value.trim()) {
    addError('iso3Code', t('t-please-enter-iso3-code'));
    return false;
  }

  if (!phoneCode.value.trim()) {
    addError('phoneCode', t('t-please-enter-phone-code'));
    return false;
  }

  if (!currency.value.trim()) {
    addError('currency', t('t-please-enter-currency'));
    return false;
  }

  if (!currencySymbol.value.trim()) {
    addError('currencySymbol', t('t-please-enter-currency-symbol'));
    return false;
  }

  if (!currencyCode.value.trim()) {
    addError('currencyCode', t('t-please-enter-currency-code'));
    return false;
  }

  return isValid;
};


console.log(errorMessage.value, 'errorMessage.value');

const onSubmit = () => {
  if (!validateForm()) return;

  localLoading.value = true;

  const data = {
    ...(!isCreate.value && { id: id.value }),
    name: name.value,
    code: code.value,
    iso2Code: iso2Code.value,
    iso3Code: iso3Code.value,
    phoneCode: phoneCode.value,
    currency: currency.value,
    currencySymbol: currencySymbol.value,
    currencyCode: currencyCode.value,
    enabled: enabled.value
  };

  emit('onSubmit', data, {
    onSuccess: () => {
      dialogValue.value = false;
      validationAlertMessage.value = '';
    },
    onFinally: () => {
      localLoading.value = false;
    }
  });
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <Card :title="isCreate ? $t('t-add-country') : $t('t-edit-country')" title-class="py-0">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />
      <v-card-text class="overflow-y-auto" :style="{ 'max-height': isCreate ? '70vh' : '45vh' }">

        <!-- ERRO DA API -->
        <v-alert v-if="errorMessage" :text="errorMessage" type="error" class="mb-4" variant="tonal" color="danger"
          density="compact" />

        <!-- ERROS DE VALIDAÇÃO -->
        <v-alert v-if="validationAlertMessage" :text="validationAlertMessage" type="error" class="mb-4" variant="tonal"
          color="danger" density="compact" />

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-name') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="name" :placeholder="$t('t-enter-name')" :error-messages="formErrors.name"
              hide-details="auto" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-country-code') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="code" :placeholder="$t('t-enter-code')" :error-messages="formErrors.code"
              hide-details="auto" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-iso2Code') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="iso2Code" :placeholder="$t('t-enter-iso2-code')" :error-messages="formErrors.iso2Code"
              hide-details="auto" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-iso3Code') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="iso3Code" :placeholder="$t('t-enter-iso3-code')" :error-messages="formErrors.iso3Code"
              hide-details="auto" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-phone-code') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="phoneCode" :placeholder="$t('t-enter-phone-code')"
              :error-messages="formErrors.phoneCode" hide-details="auto" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-currency') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="currency" :placeholder="$t('t-enter-currency')" :error-messages="formErrors.currency"
              hide-details="auto" />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-currency-symbol') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="currencySymbol" :placeholder="$t('t-enter-currency-symbol')"
              :error-messages="formErrors.currencySymbol" hide-details="auto" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-currency-code') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="currencyCode" :placeholder="$t('t-enter-currency-code')"
              :error-messages="formErrors.currencyCode" hide-details="auto" />
          </v-col>
        </v-row>
        <v-row class="">
          <v-col cols="12" lg="12" class="">
            <div class="font-weight-bold">{{ $t('t-availability') }}</div>
            <v-checkbox v-model="enabled" density="compact" color="primary" class="d-inline-flex">
              <template #label>
                <span>{{ $t('t-is-enabled') }}</span>
              </template>
            </v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t('t-close') }}
        </v-btn>
        <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
          {{ localLoading ? $t('t-saving') : $t('t-save') }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
