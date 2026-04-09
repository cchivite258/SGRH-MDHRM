<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { LanguagesInsert } from "@/components/baseTables/languages/types";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { propertyTypes } from "@/components/baseTables/languages/listView/utils";
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
    type: Object as PropType<LanguagesInsert>,
    required: true,
  },
  error: {
    type: String,
    default: "",
  }
});

const isCreate = computed(() => prop.data.id === "-1");
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
const name = ref(formData.value.name || "");
const code = ref(formData.value.code || "");
const localizedName = ref(formData.value.localizedName || "");
const region = ref(formData.value.region || "");
const rtl = ref(isCreate.value ? null : formData.value.rtl ?? false);
const enabled = ref(formData.value.enabled);
const errorMessage = computed(() => prop.error);

const { t } = useI18n();

const requiredRules = {
  name: [(v: string) => !!v?.trim() || t("t-please-enter-language")],
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
    localizedName: localizedName.value,
    region: region.value,
    rtl: rtl.value,
    enabled: enabled.value
  };
  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    name: "trimToEmpty",
    code: "trimToNull",
    localizedName: "trimToNull",
    region: "trimToNull"
  });

  emit("onSubmit", data, {
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
      <Card :title="isCreate ? $t('t-add-language') : $t('t-edit-language')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>

        <v-divider />

        <v-card-text class="overflow-y-auto" :style="{ 'max-height': isCreate ? '70vh' : '45vh' }">
          <v-alert v-if="errorMessage" :text="errorMessage" type="error" variant="tonal" color="danger" class="mb-4"
            density="compact" />

          <v-row>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-language') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField v-model="name" :placeholder="$t('t-enter-language')" :rules="requiredRules.name" />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-code') }}
              </div>
              <TextField v-model="code" :placeholder="$t('t-enter-code')" hide-details />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-localized-name') }}
              </div>
              <TextField v-model="localizedName" :placeholder="$t('t-enter-localized-name')" hide-details />
            </v-col>
            <v-col cols="12" lg="6">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-region') }}
              </div>
              <TextField v-model="region" :placeholder="$t('t-enter-region')" hide-details />
            </v-col>
            <v-col cols="12">
              <div class="font-weight-bold mb-2">
                {{ $t('t-right-to-left') }}
              </div>
              <MenuSelect v-model="rtl as any" :items="propertyTypes" />
            </v-col>
          </v-row>
          <v-row class="mt-n6">
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
    </v-form>
  </v-dialog>
</template>

<style>
.text-extra-small {
  font-size: 0.70rem;
}
</style>
