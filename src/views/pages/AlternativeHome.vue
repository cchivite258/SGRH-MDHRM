<script lang="ts" setup>
import { computed } from "vue";
import { PERMISSIONS, type PermissionRequirement } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

type HomeModule = {
  titleKey: string;
  descriptionKey: string;
  icon: string;
  color: string;
  to: string;
  permissions: PermissionRequirement;
};

const { canAny } = usePermissions();

const modules: HomeModule[] = [
  {
    titleKey: "t-employees",
    descriptionKey: "t-alternative-home-employees-description",
    icon: "ph-users-three",
    color: "primary",
    to: "/employee/list",
    permissions: PERMISSIONS.EMPLOYEE.ACCESS,
  },
  {
    titleKey: "t-institutions",
    descriptionKey: "t-alternative-home-contracts-description",
    icon: "ph-buildings",
    color: "success",
    to: "/institution/list",
    permissions: PERMISSIONS.CONTRACTS.ACCESS,
  },
  {
    titleKey: "t-invoices",
    descriptionKey: "t-alternative-home-invoices-description",
    icon: "ph-receipt",
    color: "secondary",
    to: "/invoices/list",
    permissions: PERMISSIONS.INVOICES.ACCESS,
  },
  {
    titleKey: "t-service-providers",
    descriptionKey: "t-alternative-home-service-providers-description",
    icon: "ph-first-aid-kit",
    color: "info",
    to: "/service-provider/list",
    permissions: PERMISSIONS.SERVICE_PROVIDERS.ACCESS,
  },
  {
    titleKey: "t-entities",
    descriptionKey: "t-alternative-home-entities-description",
    icon: "ph-bank",
    color: "warning",
    to: "/entities/list",
    permissions: PERMISSIONS.ENTITIES.ACCESS,
  },
  {
    titleKey: "t-reports",
    descriptionKey: "t-alternative-home-reports-description",
    icon: "ph-chart-bar",
    color: "primary",
    to: "/reports/list",
    permissions: PERMISSIONS.REPORTS.ACCESS,
  },
];

// A página inicial alternativa só apresenta módulos autorizados para o perfil autenticado.
const visibleModules = computed(() =>
  modules.filter((item) => canAny(item.permissions))
);
</script>

<template>
  <div class="alternative-home">
    <div class="alternative-home__header">
      <div>
        <h4 class="alternative-home__title">{{ $t("t-home") }}</h4>
        <p class="alternative-home__subtitle mb-0">
          {{ $t("t-alternative-home-subtitle") }}
        </p>
      </div>
    </div>

    <v-alert
      v-if="visibleModules.length === 0"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4"
    >
      {{ $t("t-alternative-home-empty") }}
    </v-alert>

    <v-row v-else class="alternative-home__grid">
      <v-col
        v-for="item in visibleModules"
        :key="item.to"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card class="alternative-home-card" elevation="0" :to="item.to">
          <v-card-text>
            <div class="alternative-home-card__icon" :class="`alternative-home-card__icon--${item.color}`">
              <i :class="item.icon" />
            </div>

            <div class="alternative-home-card__content">
              <h5>{{ $t(item.titleKey) }}</h5>
              <p>{{ $t(item.descriptionKey) }}</p>
            </div>

            <i class="ph-arrow-right alternative-home-card__arrow" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.alternative-home {
  padding-top: 18px;
}

.alternative-home__header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 18px;
}

.alternative-home__title {
  font-size: 1.28rem;
  font-weight: 700;
  margin: 0 0 4px;
}

.alternative-home__subtitle {
  color: #6c757d;
  font-size: 0.88rem;
}

.alternative-home__grid {
  align-items: stretch;
}

.alternative-home-card {
  border: 1px solid #e9edf3;
  border-radius: 8px !important;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.045) !important;
  height: 100%;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.alternative-home-card:hover {
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08) !important;
  transform: translateY(-2px);
}

.alternative-home-card :deep(.v-card-text) {
  align-items: center;
  display: flex;
  gap: 16px;
  min-height: 136px;
  padding: 20px 22px;
}

.alternative-home-card__icon {
  align-items: center;
  border-radius: 50%;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 1.55rem;
  height: 58px;
  justify-content: center;
  width: 58px;
}

.alternative-home-card__icon--primary {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.alternative-home-card__icon--success {
  background: rgba(46, 125, 50, 0.12);
  color: #2e7d32;
}

.alternative-home-card__icon--secondary {
  background: rgba(112, 64, 183, 0.12);
  color: #7040b7;
}

.alternative-home-card__icon--info {
  background: rgba(3, 169, 244, 0.12);
  color: #0288d1;
}

.alternative-home-card__icon--warning {
  background: rgba(245, 158, 11, 0.14);
  color: #b45309;
}

.alternative-home-card__content {
  flex: 1;
  min-width: 0;
}

.alternative-home-card__content h5 {
  color: #111827;
  font-size: 0.98rem;
  font-weight: 700;
  margin: 0 0 5px;
}

.alternative-home-card__content p {
  color: #4b5563;
  font-size: 0.8rem;
  line-height: 1.38;
  margin: 0;
}

.alternative-home-card__arrow {
  color: #94a3b8;
  flex: 0 0 auto;
  font-size: 1.2rem;
}
</style>
