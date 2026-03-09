<script lang="ts" setup>
import { PropType, computed, ref, watch, onMounted } from "vue";
import { InvoiceAttachmentType } from "@/components/invoice/types";
import { useI18n } from "vue-i18n";
import { useToast } from 'vue-toastification';
import type { ApiErrorResponse } from "@/app/common/types/errorType";
import FileUploader from "@/app/common/components/FileUploader.vue";
import { getApiValidationErrors, getFirstApiErrorMessage } from "@/app/common/apiErrors";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue", "onSubmit"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<InvoiceAttachmentType | null>,
    required: false,
    default: () => ({
      id: undefined,
      file: new File([""], "filename.pdf"),
    })
  },
});

const localLoading = ref(false);
const errorMsg = ref("");
const serverErrors = ref<Record<string, string[]>>({});

// Form fields
const file = ref<any[]>([]);

watch(() => props.data, (newData) => {
  if (newData?.file) {
    file.value = [newData.file];
  } else {
    file.value = [];
  }
}, { immediate: true });

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
const toast = useToast();

const onSubmit = async () => {
  if (!form.value) return;
  serverErrors.value = {};

  const { valid } = await form.value.validate();
  const selectedFile = file.value[0]?.file || file.value[0] || null;
  const hasFile = !!selectedFile;

  if (!valid || !hasFile) {
    toast.error(t('t-validation-error'));
    errorMsg.value = t('t-please-correct-errors');
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
    return;
  }

  localLoading.value = true;

  const payload: InvoiceAttachmentType = {
    id: props.data?.id,
    file: selectedFile,
  };

  emit("onSubmit", payload, {
    onSuccess: () => dialogValue.value = false,
    onError: (error: { error?: ApiErrorResponse }) => {
      serverErrors.value = getApiValidationErrors(error);
      errorMsg.value = Object.keys(serverErrors.value).length > 0
        ? ""
        : getFirstApiErrorMessage(error, t('t-message-save-error')) || t('t-message-save-error');

      alertTimeout = setTimeout(() => {
        errorMsg.value = "";
        alertTimeout = null;
      }, 5000);
    },
    onFinally: () => localLoading.value = false
  });
};

onMounted(async () => {

});

</script>
<template>
  <v-dialog v-model="dialogValue" width="500">

    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="$t('t-attach-invoice')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
        <v-card-text>
          <v-row class="">
            <v-col cols="12" lg="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t('t-original-invoice') }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <FileUploader v-model="file" :multiple="false" />

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
