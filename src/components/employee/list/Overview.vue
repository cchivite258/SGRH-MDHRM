<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useEmployeeStore } from "@/store/employee/employeeStore"

const employeeStore = useEmployeeStore()

onMounted(async () => {
  await employeeStore.fetchEmployeeStats()
})

const employeeStats = computed(() => employeeStore.employeeStatsForOverview)
</script>

<template>
  <div class="employee-overview">
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
}

.employee-overview__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.employee-overview__card {
  background: #ffffff;
  border: 1px solid #e6edf5;
  border-radius: 16px !important;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04) !important;
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
  border: 1px solid rgba(148, 163, 184, 0.16);
  flex: 0 0 auto;
  height: 42px !important;
  width: 42px !important;
}

.employee-overview__copy {
  min-width: 0;
}

.employee-overview__title {
  color: #334155;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
}

.employee-overview__metric {
  margin-top: 14px;
}

.employee-overview__value {
  color: #0f172a;
  display: inline-block;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
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
