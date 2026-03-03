<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/store/employee/employeeStore'
const employeeStore = useEmployeeStore()

// Carrega os dados da API
onMounted(async () => {
  await employeeStore.fetchEmployees()
})

// Cálculos baseados nos dados reais
const employeeStats = computed(() => {
  const employees = employeeStore.employees
  
  return [
    {
      title: "total-employees",
      endVal: employees.length,
      color: "primary",
      percent: "0%", // Você pode calcular isso também
      isProgress: true,
      icon: "ph-buildings",
    },
    {
      title: "total-female-employees",
      endVal: employees.filter(e => e.gender === 'FEMALE').length,
      color: "success",
      percent: "0%",
      isProgress: true,
      icon: "ph-gender-female",
    },
    {
      title: "total-male-employees",
      endVal: employees.filter(e => e.gender === 'MALE').length,
      color: "info",
      percent: "0%",
      isProgress: true,
      icon: "ph-gender-male",
    },
    {
      title: "total-inactive-employees",
      endVal: employees.filter(e => e.gender === 'INACTIVE').length,
      color: "danger",
      percent: "0%",
      isProgress: false,
      icon: "ph-x-circle",
    }
  ]
})
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
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>