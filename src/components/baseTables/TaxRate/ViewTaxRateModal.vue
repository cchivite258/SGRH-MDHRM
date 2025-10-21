<script lang="ts" setup>
import { PropType, computed, ref, watch } from "vue";
import { TaxRateTypeInsert } from "@/components/baseTables/TaxRate/types";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { statusOptions } from "@/components/realEstate/agent/utils";
import { colors } from "@/components/ui/utils";
import { useI18n } from "vue-i18n";

const localLoading = ref(false);
const emit = defineEmits(["update:modelValue", "onSubmit"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<TaxRateTypeInsert>,
    required: true,
  },
  error: {
    type: String,
    default: "",
  }
});

const isCreate = computed(() => prop.data.id === "-1");
const formData = ref(prop.data);

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
const description = ref(formData.value.description || "");
const rate = ref(formData.value.rate || "");
const enabled = ref(formData.value.enabled);
const errorMessage = computed(() => prop.error);


const validationAlertMessage = ref('');

let validationAlertTimeout: ReturnType<typeof setTimeout> | null = null;

const formErrors = ref<Record<string, string>>({
  name: '',
  description: '',
  rate: '',
});

const { t } = useI18n();

const validateForm = () => {
  let isValid = true;

  // Limpar erros anteriores
  Object.keys(formErrors.value).forEach((key) => {
    formErrors.value[key] = '';
  });

  if (validationAlertTimeout) {
    clearTimeout(validationAlertTimeout);
    validationAlertTimeout = null;
  }
  validationAlertMessage.value = '';

  // Verificações de erro — mostrar só o primeiro
  if (!name.value.trim()) {
    const msg = t('t-please-enter-name-tax-rate');
    formErrors.value.name = msg;
    validationAlertMessage.value = msg;
    isValid = false;
  } else if (rate.value === "" || isNaN(Number(rate.value))) {
    const msg = t('t-please-enter-valid-rate');
    formErrors.value.rate = msg;
    validationAlertMessage.value = msg;
    isValid = false;
  }

  if (!isValid) {
    validationAlertTimeout = setTimeout(() => {
      validationAlertMessage.value = '';
      validationAlertTimeout = null;
    }, 5000);
  }

  return isValid;
};


watch(
  () => prop.data,
  (newVal) => {
    id.value = newVal.id || "";
    name.value = newVal.name || "";
    description.value = newVal.description || "";
    rate.value = newVal.rate || "";
    enabled.value = newVal.enabled;
  },
  { immediate: true }
);
const onSubmit = () => {
  if (!validateForm()) {
    return;
  }

  localLoading.value = true;

  const data = {
    ...(!isCreate.value && { id: id.value }),
    name: name.value,
    description: description.value,
    rate: rate.value,
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
    <Card :title="$t('t-view-tax-rate') " title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" :style="{
        'max-height': isCreate ? '70vh' : '45vh'
      }">
        <v-alert v-if="errorMessage" :text="errorMessage" type="error" class="mb-4" variant="tonal" color="danger"
          density="compact" />

        <v-alert v-if="validationAlertMessage" :text="validationAlertMessage" type="error" class="mb-4" variant="tonal"
          color="danger" density="compact" />

        <v-row>
          <v-col cols="6" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-name') }} 
            </div>
            <div>{{ name || '-' }}</div>
          </v-col>
          <v-col cols="6" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-rate') }} 
            </div>
            <div>{{ rate || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="12">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-description') }}
            </div>
            <div>{{ description || '-' }}</div>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <div>
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t('t-close') }}
          </v-btn>
        </div>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>