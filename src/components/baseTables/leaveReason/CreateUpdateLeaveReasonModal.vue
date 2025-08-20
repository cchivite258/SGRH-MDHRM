<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { HospitalProcedureTypeInsert } from "@/components/baseTables/hospitalProcedureType/types";
import { useI18n } from "vue-i18n";

const localLoading = ref(false);
const emit = defineEmits(["update:modelValue", "onSubmit"]);

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<HospitalProcedureTypeInsert>,
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
const enabled = ref(formData.value.enabled)

// Erro vindo da API
const errorMessage = computed(() => prop.error);

// Erro de validação local
const validationAlertMessage = ref("");
let validationAlertTimeout: ReturnType<typeof setTimeout> | null = null;

const { t } = useI18n();

const validateForm = () => {
  let isValid = true;
  const messages: string[] = [];

  if (validationAlertTimeout) {
    clearTimeout(validationAlertTimeout);
    validationAlertTimeout = null;
  }

  validationAlertMessage.value = "";

  if (!name.value.trim()) {
    messages.push(t("t-please-enter-leave-reason"));
    isValid = false;
  }

  if (messages.length > 0) {
    validationAlertMessage.value = messages.join("<br/>");

    validationAlertTimeout = setTimeout(() => {
      validationAlertMessage.value = "";
      validationAlertTimeout = null;
    }, 5000);
  }

  return isValid;
};

const onSubmit = () => {
  if (!validateForm()) {
    return;
  }

  localLoading.value = true;

  const data = {
    ...(!isCreate.value && { id: id.value }),
    name: name.value,
    description: description.value,
    enabled: enabled.value
  };

  emit("onSubmit", data, {
    onSuccess: () => {
      dialogValue.value = false;
      if (validationAlertTimeout) {
        clearTimeout(validationAlertTimeout);
        validationAlertTimeout = null;
      }
      validationAlertMessage.value = "";
    },
    onFinally: () => {
      localLoading.value = false;
    },
  });
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <Card :title="isCreate ? $t('t-add-leave-reason') : $t('t-edit-leave-reason')" title-class="py-0"
      style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text class="overflow-y-auto" :style="{ 'max-height': isCreate ? '70vh' : '45vh' }">

        <!-- Erro vindo da API -->
        <v-alert v-if="errorMessage" :text="errorMessage" type="error" class="mb-4" variant="tonal" color="danger"
          density="compact" />

        <!-- Erro de validação local -->
        <v-alert v-if="validationAlertMessage" :text="validationAlertMessage" type="error" class="mb-4" variant="tonal"
          color="danger" density="compact" />

        <v-row>
          <v-col cols="12" lg="12">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t("t-reason") }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="name" :placeholder="$t('t-enter-reason')" hide-details />
          </v-col>

          <v-col cols="12" lg="12">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t("t-description") }}
            </div>
            <TextArea v-model="description" :placeholder="$t('t-enter-description')" hide-details />
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
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t("t-saving") : $t("t-save") }}
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
