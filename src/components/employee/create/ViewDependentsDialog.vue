<script lang="ts" setup>
import { PropType, computed } from "vue";
import { DependentInsertType, DependentListingType } from "@/components/employee/types";
import { useI18n } from "vue-i18n";
import Status from "@/app/common/components/Status.vue";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);


// Utils
import {
  genderOptions,
  relationshipOptions
} from "@/components/employee/create/utils";


//get dos enums
const getGenderLabel = (value: string | undefined) => {
  const option = genderOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};

const getRelationshipLabel = (value: string | undefined) => {
  const option = relationshipOptions.find(opt => opt.value === value);
  return option ? option.label : value;
};


const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<DependentInsertType | DependentListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      firstName: "",
      middleName: "",
      gender: "",
      birthDate: undefined,
      relationship: "",
      employee: "",
      idCardNumber: "",
      idCardIssuer: "",
      idCardExpiryDate: undefined,
      idCardIssuanceDate: undefined,
      enabled: true
    })
  },
});

const dialogValue = computed({
  get() {
    return props.modelValue;
  },
  set(value: boolean) {
    emit("update:modelValue", value);
  },
});

const formatDate = (date: Date | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-PT');
};
</script>

<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <Card :title="$t('t-view-dependent')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-card-text class="overflow-y-auto" style="max-height: 70vh">
        <v-row class="">
          <v-col cols="12" lg="12" class="text-right">
            <Status :status="props.data?.enabled ? 'enabled' : 'disabled'" />
          </v-col>
        </v-row>
        <v-row class="mt-n6">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-firstname') }}
            </div>
            <div>{{ props.data?.firstName || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-middle-name') }}
            </div>
            <div>{{ props.data?.middleName || '-' }}</div>
          </v-col>
        </v-row>
        
        <v-row class="mt-3">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-lastname') }}
            </div>
            <div>{{ props.data?.lastName || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-relationship') }}
            </div>
            <div>{{ getRelationshipLabel(props.data?.relationship) || '-' }}</div>
          </v-col>
        </v-row>
        
        <v-row class="mt-3">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-gender') }}
            </div>
            <div>{{ getGenderLabel(props.data?.gender) || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-birth-date') }}
            </div>
            <div>{{ formatDate(props.data?.birthDate) }}</div>
          </v-col>
        </v-row>
        
        <v-row class="mt-3">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-id-card-number') }}
            </div>
            <div>{{ props.data?.idCardNumber || '-' }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-id-card-issuer') }}
            </div>
            <div>{{ props.data?.idCardIssuer || '-' }}</div>
          </v-col>
        </v-row>
        
        <v-row class="mt-3">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-id-card-expiry-date') }}
            </div>
            <div>{{ formatDate(props.data?.idCardExpiryDate) }}</div>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-id-card-issuance-date') }}
            </div>
            <div>{{ formatDate(props.data?.idCardIssuanceDate) }}</div>
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