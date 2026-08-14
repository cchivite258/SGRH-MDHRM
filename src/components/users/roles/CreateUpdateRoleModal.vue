<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import type { PropType } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import type { RoleFormType } from "@/components/users/roles/types";

const localLoading = ref(false);
const emit = defineEmits(["update:modelValue", "onSubmit"]);
const toast = useToast();
const { t } = useI18n();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<RoleFormType>,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

const isCreate = computed(() => !props.data.id);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const id = ref(props.data.id);
const name = ref(props.data.name || "");
const description = ref(props.data.description || "");
const errorMessage = computed(() => props.error);

const requiredRules = {
  name: [
    (v: string) => !!v?.trim() || t("t-please-enter-role"),
    (v: string) => (v?.trim().length ?? 0) >= 3 || t("t-role-name-min-length"),
    (v: string) => (v?.trim().length ?? 0) <= 255 || t("t-role-name-max-length"),
  ],
};

watch(
  () => props.data,
  newVal => {
    id.value = newVal.id;
    name.value = newVal.name || "";
    description.value = newVal.description || "";
  },
  { immediate: true }
);

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const data: RoleFormType = {
    ...(!isCreate.value && { id: id.value }),
    name: name.value,
    description: description.value,
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    name: "trimToEmpty",
    description: "trimToEmpty",
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
  <v-dialog v-model="dialogValue" width="560" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="isCreate ? $t('t-add-role') : $t('t-edit-role')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="role-form overflow-y-auto" style="max-height: 70vh">
          <v-alert
            v-if="errorMessage"
            :text="errorMessage"
            type="error"
            class="mb-4"
            variant="tonal"
            color="danger"
            density="compact"
          />

          <v-row class="role-form__row">
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-name") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="name" :placeholder="$t('t-enter-role')" :rules="requiredRules.name" />
            </v-col>

            <v-col cols="12" class="mt-n4">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-description") }}
              </div>
              <TextArea v-model="description" :placeholder="$t('t-enter-description')" />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" @click="onSubmit" :loading="localLoading" :disabled="localLoading">
            {{ localLoading ? $t("t-saving") : $t("t-save") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.role-form {
  padding-bottom: 12px;
  padding-top: 16px;
}

.role-form__row {
  margin: -6px;
}

.role-form__row > :deep(.v-col),
.role-form__row > [class*="v-col-"] {
  padding: 6px !important;
}
</style>
