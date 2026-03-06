<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { CountryInsertType } from "@/components/baseTables/country/types";
import { useI18n } from "vue-i18n";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import { useToast } from "vue-toastification";

const emit = defineEmits(["update:modelValue", "onSubmit"]);
const toast = useToast();

const prop = defineProps({
  modelValue: { type: Boolean, default: false },
  data: { type: Object as PropType<CountryInsertType>, required: true },
  error: { type: String, default: "" }
});

const { t } = useI18n();

const isCreate = computed(() => prop.data.id === "-1");
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
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
const enabled = ref(formData.value.enabled);
const errorMessage = computed(() => prop.error);

const localLoading = ref(false);

const requiredRules = {
  name: [(v: string) => !!v?.trim() || t("t-please-enter-name")],
  code: [(v: string) => !!v?.trim() || t("t-please-enter-code")],
  iso2Code: [(v: string) => !!v?.trim() || t("t-please-enter-iso2-code")],
  iso3Code: [(v: string) => !!v?.trim() || t("t-please-enter-iso3-code")],
  phoneCode: [(v: string) => !!v?.trim() || t("t-please-enter-phone-code")],
  currency: [(v: string) => !!v?.trim() || t("t-please-enter-currency")],
  currencySymbol: [(v: string) => !!v?.trim() || t("t-please-enter-currency-symbol")],
  currencyCode: [(v: string) => !!v?.trim() || t("t-please-enter-currency-code")],
};

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

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
  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    name: "trimToEmpty",
    code: "trimToEmpty",
    iso2Code: "trimToEmpty",
    iso3Code: "trimToEmpty",
    phoneCode: "trimToEmpty",
    currency: "trimToEmpty",
    currencySymbol: "trimToEmpty",
    currencyCode: "trimToEmpty"
  });

  emit('onSubmit', data, {
    onSuccess: () => {
      dialogValue.value = false;
    },
    onFinally: () => {
      localLoading.value = false;
    }
  });
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-country') : $t('t-edit-country')" title-class="py-0">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>

        <v-divider />
        <v-card-text class="overflow-y-auto" :style="{ 'max-height': isCreate ? '70vh' : '45vh' }">
          <v-alert v-if="errorMessage" :text="errorMessage" type="error" class="mb-4" variant="tonal" color="danger"
            density="compact" />

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-name') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="name" :placeholder="$t('t-enter-name')" :rules="requiredRules.name" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-country-code') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="code" :placeholder="$t('t-enter-code')" :rules="requiredRules.code" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-iso2Code') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="iso2Code" :placeholder="$t('t-enter-iso2-code')" :rules="requiredRules.iso2Code" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-iso3Code') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="iso3Code" :placeholder="$t('t-enter-iso3-code')" :rules="requiredRules.iso3Code" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-phone-code') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="phoneCode" :placeholder="$t('t-enter-phone-code')" :rules="requiredRules.phoneCode" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-currency') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="currency" :placeholder="$t('t-enter-currency')" :rules="requiredRules.currency" />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-currency-symbol') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="currencySymbol" :placeholder="$t('t-enter-currency-symbol')" :rules="requiredRules.currencySymbol" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-currency-code') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="currencyCode" :placeholder="$t('t-enter-currency-code')" :rules="requiredRules.currencyCode" />
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
    </v-form>
  </v-dialog>
</template>
