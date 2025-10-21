<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useInstitutionStore } from '@/store/institution/institutionStore'
const institutionStore = useInstitutionStore()

// Carrega os dados da API
onMounted(async () => {
  await institutionStore.fetchInstitutions()
})

// Cálculos baseados nos dados reais
const employeeStats = computed(() => {
  const institutions = institutionStore.institutions
  
  return [
    {
      title: "total-institutions",
      endVal: institutions.length,
      color: "primary",
      percent: "0%", // Você pode calcular isso também
      isProgress: true,
      icon: "ph-buildings",
    },
    {
      title: "total-disabled-institutions",
      endVal: institutions.filter(e => e.enabled === false).length,
      color: "danger",
      percent: "0%",
      isProgress: false,
      icon: "ph-x-circle",
    },
    {
      title: "total-public-institutions",
      endVal: institutions.filter(e => e.institutionType?.name === 'ESTADO').length,
      color: "warning",
      percent: "0%",
      isProgress: false,
      icon: "ph-buildings",
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
              lg="4"
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