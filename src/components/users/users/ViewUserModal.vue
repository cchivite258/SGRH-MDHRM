<script lang="ts" setup>
import { PropType, computed, ref } from "vue";
import { UserInsertType } from "@/components/users/types";
import { statusOptions } from "@/components/realEstate/agent/utils";
import { colors } from "@/components/ui/utils";
import { useI18n } from "vue-i18n";


const localLoading = ref(false);
const emit = defineEmits(["update:modelValue"]);
const errorMsg = ref("");

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

const dialogValue = computed({
  get() {
    return prop.modelValue;
  },
  set(dialog: boolean) {
    emit("update:modelValue", dialog);
  },
}); 

const id =  ref(formData.value.id || "");
const firstName = ref(formData.value.firstName || "");
const lastName = ref(formData.value.lastName || "");
const email = ref(formData.value.email || "");
//const enable = ref(formData.value.enable || true);

// Remove as refs de password se não for criação
const password = ref(isCreate ? formData.value.password || "" : "");
const password_confirm = ref(isCreate ? formData.value.password_confirm || "" : "");

const { t } = useI18n();


</script>
<template>
  <v-dialog v-model="dialogValue" width="500" scrollable>
    <Card :title="$t('t-view-user')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>
      <v-divider />

      <v-alert v-if="errorMsg" :text="errorMsg" variant="tonal" color="danger" class="mx-5 mt-3" density="compact" />
      <v-card-text class="overflow-y-auto" :style="{ 
      'max-height': isCreate ? '70vh' : '45vh' 
    }">
        <v-row class="">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-firstname') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="firstName" :placeholder="$t('t-enter-firstname')" disabled/>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption mb-1">
              {{ $t('t-lastname') }}
            </div>
            <TextField v-model="lastName" :placeholder="$t('t-enter-lastname')" disabled />
          </v-col>
        </v-row>
        <div class="font-weight-bold text-caption mb-1">
          {{ $t('t-email') }} <i class="ph-asterisk ph-xs text-danger" />
        </div>
        <TextField v-model="email" !isEmail :placeholder="$t('t-enter-email-form')" disabled/>
        <v-row v-if="isCreate">
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption  mb-1">
              {{ $t('t-password') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="password" hide-details isRequired isPassword :placeholder="$t('t-enter-password')" />
          </v-col>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold text-caption  mb-1">
              {{ $t('t-confirm-password') }} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField v-model="password_confirm" hide-details isRequired isPassword
              :placeholder="$t('t-enter-password-confirm')" disabled/>
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
