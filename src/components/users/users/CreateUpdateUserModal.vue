<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { UserInsertType } from "@/components/users/types";
import { useI18n } from "vue-i18n";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import { useToast } from "vue-toastification";

const localLoading = ref(false);
const emit = defineEmits(["update:modelValue", "onSubmit"]);
const toast = useToast();

const prop = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<UserInsertType>,
    required: true,
  },
});

const isCreate = computed(() => prop.data.id === -1);
const formData = ref(prop.data);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const id = ref(formData.value.id || "");
const firstName = ref(formData.value.firstName || "");
const lastName = ref(formData.value.lastName || "");
const email = ref(formData.value.email || "");
const password = ref<{ value: string; isValid: boolean }>({ value: "", isValid: false });
const password_confirm = ref<{ value: string; isValid: boolean }>({ value: "", isValid: false });

const { t } = useI18n();

const requiredRules = {
  firstName: [(v: string) => !!v?.trim() || t("t-please-enter-firstname")],
  email: [
    (v: string) => !!v?.trim() || t("t-please-enter-email"),
    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim() || "") || t("t-invalid-email"),
  ],
  password: [
    (v: { value: string } | string) => {
      if (!isCreate.value) return true;
      const raw = typeof v === "object" && v !== null ? (v as { value?: string }).value : String(v ?? "");
      return !!raw?.trim() || t("t-please-enter-password");
    },
  ],
  passwordConfirm: [
    (v: { value: string } | string) => {
      if (!isCreate.value) return true;
      const raw = typeof v === "object" && v !== null ? (v as { value?: string }).value : String(v ?? "");
      return !!raw?.trim() || t("t-please-enter-password-confirm");
    },
    (v: { value: string } | string) => {
      if (!isCreate.value) return true;
      const confirm = typeof v === "object" && v !== null ? (v as { value?: string }).value : String(v ?? "");
      const pwd = password.value.value;
      return (confirm || "").trim() === (pwd || "").trim() || t("t-please-enter-same-password-and-password-confirm");
    },
  ],
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
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    ...(isCreate.value && {
      password: password.value.value,
      password_confirm: password_confirm.value.value,
    }),
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    firstName: "trimToEmpty",
    lastName: "trimToNull",
    email: "trimToEmpty",
    password: "trimToEmpty",
    password_confirm: "trimToEmpty",
  });

  emit("onSubmit", data, {
    onSuccess: () => {
      dialogValue.value = false;
    },
    onFinally: () => {
      localLoading.value = false;
    },
  });
};
</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-user') : $t('t-edit-user')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="overflow-y-auto" :style="{ 'max-height': isCreate ? '70vh' : '45vh' }">
          <v-row class="">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-firstname') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="firstName" :placeholder="$t('t-enter-firstname')" :rules="requiredRules.firstName" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-lastname') }}
              </div>
              <TextField v-model="lastName" :placeholder="$t('t-enter-lastname')" />
            </v-col>
          </v-row>

          <div class="font-weight-bold text-caption mb-1">
            {{ $t('t-email') }} <i class="ph-asterisk ph-xs text-danger" />
          </div>
          <TextField v-model="email" !isEmail :placeholder="$t('t-enter-email-form')" :rules="requiredRules.email" />

          <v-row v-if="isCreate">
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-password') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="password" isRequired isPassword :placeholder="$t('t-enter-password')"
                :rules="requiredRules.password" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-confirm-password') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="password_confirm" isRequired isPassword
                :placeholder="$t('t-enter-password-confirm')" :rules="requiredRules.passwordConfirm" />
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
    </v-form>
  </v-dialog>
</template>
