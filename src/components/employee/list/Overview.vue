<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useLayoutStore } from "@/store/app"
import { useEmployeeStore } from "@/store/employee/employeeStore"

const layoutStore = useLayoutStore()
const employeeStore = useEmployeeStore()
const isDarkMode = computed(() => layoutStore.mode === "dark")

onMounted(async () => {
  await employeeStore.fetchEmployeeStats()
})

const employeeStats = computed(() => employeeStore.employeeStatsForOverview)
</script>

<template>
  <div
    class="employee-overview"
    :class="{ 'employee-overview--dark': isDarkMode }"
  >
    <div class="employee-overview__grid">
      <v-card
        v-for="(item, index) in employeeStats"
        :key="'employee-stats-' + index"
        class="employee-overview__card"
      >
        <v-card-text class="employee-overview__card-body">
          <div class="employee-overview__card-top">
            <v-avatar
              :color="item.color"
              density="compact"
              variant="tonal"
              class="employee-overview__icon"
            >
              <i :class="item.icon" />
            </v-avatar>

            <div class="employee-overview__copy">
              <h3 class="employee-overview__title">{{ $t("t-" + item.title) }}</h3>
            </div>
          </div>

          <div class="employee-overview__metric">
            <CountTo :endVal="item.endVal" class="employee-overview__value" />
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.employee-overview {
  margin-bottom: 2px;
  --employee-overview-card-bg: #ffffff;
  --employee-overview-card-border: #e6edf5;
  --employee-overview-card-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
  --employee-overview-title: #334155;
  --employee-overview-value: #0f172a;
  --employee-overview-icon-border: rgba(148, 163, 184, 0.16);
}

.employee-overview__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.employee-overview__card {
  background: var(--employee-overview-card-bg);
  border: 1px solid var(--employee-overview-card-border);
  border-radius: 16px !important;
  box-shadow: var(--employee-overview-card-shadow) !important;
  overflow: hidden;
}

.employee-overview__card-body {
  padding: 18px 18px 16px;
}

.employee-overview__card-top {
  align-items: center;
  display: flex;
  gap: 14px;
}

.employee-overview__icon {
  border: 1px solid var(--employee-overview-icon-border);
  flex: 0 0 auto;
  height: 42px !important;
  width: 42px !important;
}

.employee-overview__copy {
  min-width: 0;
}

.employee-overview__title {
  color: var(--employee-overview-title);
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
}

.employee-overview__metric {
  margin-top: 14px;
}

.employee-overview__value {
  color: var(--employee-overview-value);
  display: inline-block;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.employee-overview--dark {
  --employee-overview-card-bg: #1a202c;
  --employee-overview-card-border: #2b3442;
  --employee-overview-card-shadow: 0 12px 24px rgba(2, 6, 23, 0.24);
  --employee-overview-title: #cbd5e1;
  --employee-overview-value: #f8fafc;
  --employee-overview-icon-border: rgba(148, 163, 184, 0.22);
}

@media (max-width: 1260px) {
  .employee-overview__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 959px) {
  .employee-overview__grid {
    grid-template-columns: 1fr;
  }

  .employee-overview__card-body {
    padding: 16px 16px 14px;
  }

  .employee-overview__value {
    font-size: 1.3rem;
  }
}
</style>
