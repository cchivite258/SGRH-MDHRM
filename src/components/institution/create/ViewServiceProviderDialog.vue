<script lang="ts" setup>
import { PropType, computed, watch, ref, onMounted } from "vue";
import { ServiceProviderInsertType, ServiceProviderListingType } from "@/components/institution/types";
import { ServiceProviderListingForListType } from "@/components/serviceProvider/types";
import { useServiceProviderStore } from "@/store/serviceProvider/serviceProviderStore";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object as PropType<ServiceProviderInsertType | ServiceProviderListingType | null>,
    required: false,
    default: () => ({
      id: undefined,
      serviceProvider: "",
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

const serviceProviderStore = useServiceProviderStore();
const serviceProvider = ref<string>("");

watch(
  () => props.data,
  (newData) => {
    if (!newData) return;
    if (typeof newData.serviceProvider === "object" && newData.serviceProvider !== null) {
      serviceProvider.value = newData.serviceProvider.id.toString();
    } else {
      serviceProvider.value = newData.serviceProvider?.toString() || "";
    }
  },
  { immediate: true }
);

const serviceProviderName = computed(() => {
  const match = serviceProviderStore.service_provider_list.find((item: ServiceProviderListingForListType) => item.id.toString() === serviceProvider.value);
  return match?.name || "-";
});

onMounted(async () => {
  try {
    await serviceProviderStore.fetchServiceProvidersForDropdown();
  } catch (error) {
    console.error("Erro ao carregar provedores de serviço:", error);
  }
});
</script>

<template>
  <v-dialog v-model="dialogValue" width="500" >
    <Card :title="$t('t-view-contracted-service-provider')" title-class="py-0" style="overflow: hidden">
      <template #title-action>
        <v-btn icon="ph-x" variant="plain" @click="dialogValue = false" />
      </template>

      <v-divider />

      <v-card-text >
        <v-row>
          <v-col cols="12">
            <div class="font-weight-bold text-caption mb-1">{{ $t('t-service-provider') }}</div>
            <div>{{ serviceProviderName }}</div>
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
