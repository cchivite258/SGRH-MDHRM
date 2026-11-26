<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useToast } from "vue-toastification";
import { MAX_PAGE_SIZE } from "@/app/const";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { normalizeObjectStringFieldsInPlace } from "@/app/common/normalizers";
import { monthOptions } from "@/components/paymentOrderPeriod/listView/utils";
import type { PaymentOrderPeriodForm } from "@/components/paymentOrderPeriod/types";
import { useInstitutionStore } from "@/store/institution/institutionStore";

const emit = defineEmits(["update:modelValue", "onSubmit"]);
const toast = useToast();
const { t } = useI18n();
const institutionStore = useInstitutionStore();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

const localLoading = ref(false);
const form = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const today = new Date();
const contractId = ref<number | string | null>(null);
const year = ref<number | null>(today.getFullYear());
const month = ref<number | null>(today.getMonth() + 1);
const notes = ref("");

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const errorMessage = computed(() => props.error);

const contractOptions = computed(() =>
  (institutionStore.enabledInstitutions || []).map(item => ({
    value: item.id,
    label: item.name,
  }))
);

const monthSelectOptions = computed(() => monthOptions());

const requiredRules = {
  contractId: [(v: string | number | null) => !!v || t("t-please-enter-institution")],
  year: [
    (v: number | string | null) => (v !== null && v !== "") || t("t-please-enter-payment-order-year"),
    (v: number | string | null) => Number.isInteger(Number(v)) && Number(v) >= 2000 || t("t-payment-order-year-minimum"),
  ],
  month: [(v: number | string | null) => !!v || t("t-please-select-payment-order-month")],
};

onMounted(() => {
  institutionStore.fetchInstitutionsforListing(0, MAX_PAGE_SIZE);
});

const onSubmit = async () => {
  if (!form.value) return;

  const { valid } = await form.value.validate();
  if (!valid) {
    toast.error(t("t-validation-error"));
    return;
  }

  localLoading.value = true;

  const data: PaymentOrderPeriodForm = {
    contractId: contractId.value,
    year: Number(year.value),
    month: Number(month.value),
    notes: notes.value,
  };

  normalizeObjectStringFieldsInPlace(data as Record<string, any>, {
    notes: "trimToEmpty",
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
  <v-dialog v-model="dialogValue" width="720" scrollable>
    <v-form ref="form" @submit.prevent="onSubmit">
      <Card :title="$t('t-add-payment-order-batch')" title-class="py-0" style="overflow: hidden">
        <template #title-action>
          <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
        </template>
        <v-divider />

        <v-card-text class="payment-order-period-form overflow-y-auto" style="max-height: 70vh">
          <p class="payment-order-period-form__hint mb-4">
            {{ $t("t-payment-order-batch-hint") }}
          </p>

          <v-alert
            v-if="errorMessage"
            :text="errorMessage"
            type="error"
            class="mb-4"
            variant="tonal"
            color="danger"
            density="compact"
          />

          <v-row class="payment-order-period-form__row">
            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-contract") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="contractId"
                :items="contractOptions"
                :placeholder="$t('t-select-institution')"
                :rules="requiredRules.contractId"
                :loading="institutionStore.loading"
              />
            </v-col>

            <v-col cols="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-year") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <TextField
                v-model.number="year"
                type="number"
                min="2000"
                :placeholder="$t('t-enter-payment-order-year')"
                :rules="requiredRules.year"
              />
            </v-col>

            <v-col cols="6" class="mt-n3">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-month") }} <i class="ph-asterisk ph-xs text-danger" />
              </div>
              <MenuSelect
                v-model="month"
                :items="monthSelectOptions"
                :placeholder="$t('t-select-payment-order-month')"
                :rules="requiredRules.month"
              />
            </v-col>

            <v-col cols="12">
              <div class="font-weight-bold text-caption mb-1">
                {{ $t("t-notes") }}
              </div>
              <TextArea
                v-model="notes"
                :placeholder="$t('t-enter-notes')"
                rows="2"
                density="compact"
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="danger" class="me-1" @click="dialogValue = false">
            <i class="ph-x me-1" /> {{ $t("t-close") }}
          </v-btn>
          <v-btn color="primary" variant="elevated" :loading="localLoading" :disabled="localLoading" @click="onSubmit">
            {{ localLoading ? $t("t-saving") : $t("t-save") }}
          </v-btn>
        </v-card-actions>
      </Card>
    </v-form>
  </v-dialog>
</template>

<style scoped>
.payment-order-period-form {
  padding-top: 16px;
  padding-bottom: 12px;
}

.payment-order-period-form__hint {
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.45;
  margin: 0;
}

.payment-order-period-form__row {
  margin: -6px;
}

.payment-order-period-form__row > :deep(.v-col),
.payment-order-period-form__row > [class*="v-col-"] {
  padding: 6px !important;
}

.payment-order-period-form :deep(.v-input__details) {
  min-height: 18px;
  padding-top: 5px;
}

.payment-order-period-form :deep(.v-messages__message) {
  line-height: 1.25;
  margin-top: 2px !important;
}
</style>
