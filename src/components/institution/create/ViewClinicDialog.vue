<script lang="ts" setup>
import { PropType, computed, watch, ref, onMounted } from "vue";
import { ClinicInsertType, ClinicListingType } from "@/components/institution/types";
import { ClinicListingForListType } from "@/components/clinics/types";
import { useClinicStore } from "@/store/clinic/clinicStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ClinicInsertType | ClinicListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      clinic: "",
      company: ""
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

const clinicStore = useClinicStore();
const clinic = ref<string>("");

watch(
  () => props.data,
  (newData) => {
    if (!newData) return;
    if (typeof newData.clinic === "object" && newData.clinic !== null) {
      clinic.value = newData.clinic.id.toString();
    } else {
      clinic.value = newData.clinic?.toString() || "";
    }
  },
  { immediate: true }
);

const clinicName = computed(() => {
  const match = clinicStore.clinics_list.find((item: ClinicListingForListType) => item.id.toString() === clinic.value);
  return match?.name || "-";
});

onMounted(async () => {
  try {
    await clinicStore.fetchClinicsForDropdown();
  } catch (error) {
    console.error("Erro ao carregar clínicas:", error);
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="500" >
    <Card :title="$t('t-view-contracted-clinic')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text >
        <v-row>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-clinic') }}</div>
            <div>{{ clinicName }}</div>
          </v-col>
        </v-row>

        <v-row class="mt-3" v-if="props.data?.company">
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-company') }}</div>
            <div>{{ props.data.company }}</div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="d-flex justify-end">
        <v-btn color="danger" class="me-1" @click="dialogValue = false">
          <i class="ph-x me-1" /> {{ $t('t-close') }}
        </v-btn>
      </v-card-actions>
    </Card>
  </v-dialog>
</template>
