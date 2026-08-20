<script lang="ts" setup>
import { computed, type PropType } from "vue";
import { useI18n } from "vue-i18n";
import { formateDate } from "@/app/common/dateFormate";
import Status from "@/app/common/components/Status.vue";
import type { UserListingType } from "@/components/users/types";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<UserListingType>,
    required: true,
  },
});

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
});

const displayValue = (value?: string | number | null) => {
  return value === 0 || value ? value : "-";
};

const formatDateValue = (value?: string | Date) => {
  return formateDate(value) || "-";
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="720" scrollable>
    <Card :title="$t('t-view-user')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row>
          <v-col cols="12" class="text-right">
            <Status :status="data.enabled ? 'active' : 'unactive'" />
          </v-col>
          <v-col cols="12" lg="6" class="mt-n6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-firstname") }}</div>
            <div>{{ data.firstName || "-" }}</div>
          </v-col>
          <v-col cols="12" lg="6" class="mt-n6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-lastname") }}</div>
            <div>{{ data.lastName || "-" }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-email") }}</div>
            <div>{{ data.email || "-" }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-username") }}</div>
            <div>{{ data.username || "-" }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-two-factor") }}</div>
            <div>{{ data.twoFactor ? t("t-yes") : t("t-no") }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-required-change-password") }}</div>
            <div>{{ data.requiredChangePassword ? t("t-yes") : t("t-no") }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-failed-logins") }}</div>
            <div>{{ displayValue(data.failedsLogin) }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-last-successful-login") }}</div>
            <div>{{ formatDateValue(data.lastSucessfulLogin) }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-last-failed-login") }}</div>
            <div>{{ formatDateValue(data.lastFailedLogin) }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-last-password-update") }}</div>
            <div>{{ formatDateValue(data.lastPasswordUpdate) }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-password-expiration-date") }}</div>
            <div>{{ formatDateValue(data.passwordExpirationDate) }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">{{ $t("t-account-locked") }}</div>
            <Status :status="data.accountLocked ? 'block' : 'unblock'" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t("t-close") }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
