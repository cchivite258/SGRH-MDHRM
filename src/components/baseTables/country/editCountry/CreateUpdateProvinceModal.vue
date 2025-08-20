<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { ProvinceInsertType } from "@/components/baseTables/country/types";
import { useI18n } from "vue-i18n";

const localLoading = ref(false);
const emit = defineEmits(["update:modelValue", "onSubmit"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ProvinceInsertType>,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    default: "",
  }
});

const isCreate = computed(() => prop.data.id === "-1");

const formData = ref({
  ...prop.data,
  country: prop.country,
});

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const id = ref(formData.value.id || "");
const name = ref(formData.value.name || "");
const code = ref(formData.value.code || "");
const enabled = ref(formData.value.enabled)

const { t } = useI18n();

// Erros do backend
const errorMessage = computed(() => prop.error);

// Erros de validação do formulário
const validationAlertMessage = ref('');
let validationAlertTimeout: ReturnType<typeof setTimeout> | null = null;

const formErrors = ref<Record<string, string>>({
  name: '',
  code: ''
});

const validateForm = () => {
  // Limpa erros antigos
  Object.keys(formErrors.value).forEach(key => {
    formErrors.value[key] = '';
  });

  if (validationAlertTimeout) {
    clearTimeout(validationAlertTimeout);
    validationAlertTimeout = null;
  }

  validationAlertMessage.value = '';

  // Campo name
  if (!name.value.trim()) {
    const msg = t('t-please-enter-province-name');
    formErrors.value.name = msg;
    validationAlertMessage.value = msg;

    validationAlertTimeout = setTimeout(() => {
      validationAlertMessage.value = '';
      validationAlertTimeout = null;
    }, 5000);

    return false;
  }

  // Campo code
  if (!code.value.trim()) {
    const msg = t('t-please-enter-province-code');
    formErrors.value.code = msg;
    validationAlertMessage.value = msg;

    validationAlertTimeout = setTimeout(() => {
      validationAlertMessage.value = '';
      validationAlertTimeout = null;
    }, 5000);

    return false;
  }

  return true;
};


const onSubmit = () => {
  if (!validateForm()) return;

  localLoading.value = true;

  const data = {
    ...(!isCreate.value && { id: id.value }),
    name: name.value,
    code: code.value,
    country: prop.country,
    enabled: enabled.value
  };

  emit('onSubmit', data, {
    onSuccess: () => {
      dialogValue.value = false;
      if (validationAlertTimeout) {
        clearTimeout(validationAlertTimeout);
        validationAlertTimeout = null;
      }
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
    <Card :title="isCreate ? $t('t-add-province') : $t('t-edit-province')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text class="overflow-y-auto" :style="{ 'max-height': isCreate ? '70vh' : '45vh' }">
        <!-- Erro da API -->
        <v-alert v-if="errorMessage" :text="errorMessage" type="error" variant="tonal" color="danger" class="mb-4"
          density="compact" />

        <!-- Erros de validação -->
        <v-alert v-if="validationAlertMessage" :text="validationAlertMessage" type="error" variant="tonal" color="danger"
          class="mb-4" density="compact" />

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-name') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="name" :placeholder="$t('t-enter-name')"
              :error-messages="formErrors.name ? [formErrors.name] : []" hide-details />
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-province-code') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="code" :placeholder="$t('t-enter-code')"
              :error-messages="formErrors.code ? [formErrors.code] : []" hide-details />
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
        <div>
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t('t-saving') : $t('t-save') }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>

<style>
.text-extra-small {
  font-size: 0.70rem;
}
</style>
