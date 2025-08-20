<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/store/employee/employeeStore'

const employeeStore = useEmployeeStore()

// Carrega os dados da API
onMounted(async () => {
  await employeeStore.fetchEmployeeStats()
})

// Usa o getter da store diretamente
const employeeStats = computed(() => employeeStore.employeeStatsForOverview)
</script>

<template>
  <v-row>
    <v-col cols="12" lg="12">
      <v-card>
        <v-card-text class="d-flex pa-6">
          <v-row>
            <v-col
              cols="12"
              sm="6"
              lg="3"
              v-for="(item, index) in employeeStats"
              :key="'employee-stats-' + index"
              class="ps-10"
              :class="index < employeeStats.length - 1 ? 'right-border' : ''"
            >
              <v-avatar
                :color="item.color"
                density="compact"
                variant="outlined"
                class="me-2"
              >
                <i :class="item.icon" />
              </v-avatar>
              <span class="text-muted"> {{ $t('t-'+item.title )}} </span>
              <div class="mt-3">
                <CountTo
                  :endVal="item.endVal"
                  class="text-h6 font-weight-bold me-4"
                />
                <span v-if="item.percent" class="text-caption" :class="`text-${item.color}`">
                  {{ item.percent }}
                </span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>