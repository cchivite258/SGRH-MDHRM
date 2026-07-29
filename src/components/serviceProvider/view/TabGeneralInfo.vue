<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

import Status from "@/app/common/components/Status.vue";
import { useCountryStore, useProvinceStore } from "@/store/baseTables/countryStore";
import type { ServiceProviderInsertType } from "@/components/serviceProvider/types";

const { t } = useI18n();
const router = useRouter();
const countryStore = useCountryStore();
const provinceStore = useProvinceStore();

const emit = defineEmits<{
  (e: "onStepChange", step: number): void;
  (e: "save"): void;
  (e: "update:modelValue", value: ServiceProviderInsertType): void;
}>();

const props = withDefaults(defineProps<{
  modelValue: ServiceProviderInsertType;
  loading?: boolean;
  showActions?: boolean;
}>(), {
  loading: false,
  showActions: true
});

const serviceProviderData = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit("update:modelValue", value);
  }
});

const errorMsg = ref("");
let alertTimeout: ReturnType<typeof setTimeout> | null = null;

const loadProvinces = async (countryId?: string) => {
  if (!countryId) {
    provinceStore.clearProvinces();
    return;
  }

  await provinceStore.fetchProvincesbyCountry(countryId);
};

onMounted(async () => {
  try {
    await countryStore.fetchCountries();
    await loadProvinces(serviceProviderData.value.countryId);
  } catch (error) {
    console.error("Failed to load countries:", error);
    errorMsg.value = "Falha ao carregar paises";
    alertTimeout = setTimeout(() => {
      errorMsg.value = "";
      alertTimeout = null;
    }, 5000);
  }
});

watch(
  () => serviceProviderData.value.countryId,
  async (newCountryId, oldCountryId) => {
    if (newCountryId !== oldCountryId) {
      await loadProvinces(newCountryId);
    }
  }
);

const countryName = computed(() => {
  if (!serviceProviderData.value.countryId) return "-";
  const country = countryStore.countries.find((item) => item.id === serviceProviderData.value.countryId);
  return country?.name || "-";
});

const provinceName = computed(() => {
  if (!serviceProviderData.value.provinceId) return "-";
  const province = provinceStore.provincesbyCountry.find((item) => item.id === serviceProviderData.value.provinceId);
  return province?.name || "-";
});

const providerTypeName = computed(() => {
  return serviceProviderData.value.providerTypes?.name || serviceProviderData.value.providerTypeId || "-";
});

const onBack = () => {
  router.push({ path: "/service-provider/list" });
};
</script>

<template>
  <v-form>
    <Card :title="$t('t-general-information')" elevation="0" title-class="pb-0">
      <transition name="fade">
        <v-alert
          v-if="errorMsg"
          :text="errorMsg"
          type="error"
          class="mb-4 mx-5 mt-3"
          variant="tonal"
          color="danger"
          density="compact"
          @click="errorMsg = ''"
          style="cursor: pointer;"
        />
      </transition>

      <v-card-text class="pt-0">
        <v-row>
          <v-col cols="12" lg="12" class="text-right">
            <Status :status="serviceProviderData.enabled ? 'enabled' : 'disabled'" />
          </v-col>
        </v-row>

        <v-row class="mt-n9">
          <v-col cols="12" lg="8">
            <div class="font-weight-bold mb-2 mt-5">
              {{ $t("t-service-provider-name") }}
            </div>
            <div>{{ serviceProviderData.name || "-" }}</div>
          </v-col>
          <v-col cols="12" lg="4">
            <div class="font-weight-bold mb-2 mt-5">
              {{ $t("t-provider-type") }}
            </div>
            <div>{{ providerTypeName }}</div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t("t-country") }}
            </div>
            <div>{{ countryName }}</div>
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t("t-province") }}
            </div>
            <div>{{ provinceName }}</div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t("t-service-provider-address") }}
            </div>
            <div>{{ serviceProviderData.address || "-" }}</div>
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t("t-service-provider-phone") }}
            </div>
            <div>{{ serviceProviderData.phone || "-" }}</div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t("t-service-provider-email") }}
            </div>
            <div>{{ serviceProviderData.email || "-" }}</div>
          </v-col>

          <v-col cols="12" lg="6">
            <div class="font-weight-bold mb-2">
              {{ $t("t-service-provider-website") }}
            </div>
            <div>{{ serviceProviderData.website || "-" }}</div>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <div class="font-weight-bold mb-2">
              {{ $t("t-service-provider-description") }}
            </div>
            <div>{{ serviceProviderData.description || "-" }}</div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions v-if="showActions" class="d-flex justify-space-between mt-3">
        <v-btn color="secondary" variant="outlined" class="me-2" @click="onBack" :disabled="loading">
          <i class="ph-arrow-left me-2" /> {{ $t("t-back") }}
        </v-btn>

        <v-btn color="secondary" variant="outlined" class="me-2" @click="emit('onStepChange', 2)" :disabled="loading">
          {{ $t("t-proceed") }} <i class="ph-arrow-right ms-2" />
        </v-btn>
      </v-card-actions>
    </Card>
  </v-form>
</template>

<style scoped>
:deep(.dp__input) {
  height: 2.63rem;
}

.custom-phone-input {
  background-color: #fff;
  border: 1px solid #DDE1EF;
  border-radius: 3px;
  padding: 0;
  color: #ABABAB !important;
}

:deep(.m-input.--has-label .m-input-input) {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 0.8rem !important;
}

:deep(.m-input.--sm .m-input-input),
:deep(.m-input.--sm .m-input-label) {
  font-size: 0.8rem !important;
  color: #ABABAB !important;
}

:deep(.m-input-input::placeholder) {
  font-size: 0.75rem !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.v-alert {
  position: relative;
  overflow: hidden;
}

.v-alert::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  transform: scaleX(0);
  transform-origin: left;
  animation: progressBar 5s linear forwards;
}

@keyframes progressBar {
  to {
    transform: scaleX(1);
  }
}
</style>
