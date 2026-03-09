<script lang="ts" setup>
import { PropType, computed, ref, watch, nextTick } from "vue";
import { ContactPersonInsertType } from "@/components/institution/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import { getApiValidationErrors } from "@/app/common/apiErrors";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  // No CreateEditContactDialog.vue
  data: {
    type: Object as PropType<ContactPersonInsertType | null>,
    required: false,
    default: () => ({
      id: undefined,
      fullname: "",
      phone: "",
      email: "",
      company: "",
      enabled: true
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});

// Form fields
const id = ref("");
const fullname = ref("");
const phone = ref("");
const email = ref("");
const enabled = ref(true);

// Watch for data changes
watch(() => props.data, (newData) => {
  if (!newData) return;
  id.value = newData.id || "";
  fullname.value = newData.fullname || "";
  phone.value = newData.phone || "";
  email.value = newData.email || "";
  enabled.value = newData.enabled;
}, { immediate: true });


const isCreate = computed(() => !id.value);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

/**
 * Regras de validação para os campos do formulário
 */
const requiredRules = {
  fullname: [
    (v: string) => !!v || t('t-please-enter-fullname'),
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

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const toast = useToast();
const getServerErrors = (field: string) => serverErrors.value[field] || [];
const applyServerErrorsToRules = (field: string, rules: Array<(value: any) => string | boolean>) => [
  ...rules,
  (value: any) => {
    const hasFrontendError = rules.some((rule) => rule(value) !== true);
    if (hasFrontendError) return true;
    return getServerErrors(field)[0] || true;
  }
];

watch(serverErrors, async (errors) => {
  if (Object.keys(errors).length > 0) {
    await nextTick();
    await form.value?.validate();
  }
}, { deep: true });

const onSubmit = async () => {
  if (!form.value) return;
  serverErrors.value = {};

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

  localLoading.value = true;

  const payload: ContactPersonInsertType = {
    id: id.value || undefined,
    fullname: fullname.value,
    phone: phone.value,
    email: email.value,
    company: props.data?.company ?? "",
    enabled: enabled.value
  };

  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onError: (error: any) => {
      serverErrors.value = getApiValidationErrors(error);
    },
    onFinally: () => localLoading.value = false
  });
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500">
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-contact-person') : $t('t-edit-contact-person')" title-class="py-0"
        style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
        <v-card-text>
          <v-row class="">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-fullname') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="fullname" :placeholder="$t('t-enter-fullname')"
                :rules="applyServerErrorsToRules('fullname', requiredRules.fullname)" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-phone') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="phone" :placeholder="$t('t-enter-phone')"
                :rules="applyServerErrorsToRules('phone', requiredRules.phone)" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-email') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="email" !isEmail :placeholder="$t('t-enter-email-form')"
                :rules="applyServerErrorsToRules('email', requiredRules.email)" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
            <v-col cols="12" lg="12" class="">
              <div class="font-weight-bold">{{ $t('t-enabled') }}</div>
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
            <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading"
              :disabled="localLoading">
              {{ localLoading ? $t('t-saving') : $t('t-save') }}
            </v-btn>
          </div>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>
