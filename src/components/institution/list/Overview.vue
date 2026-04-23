<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useInstitutionStore } from "@/store/institution/institutionStore"

const institutionStore = useInstitutionStore()

onMounted(async () => {
  await institutionStore.fetchInstitutions()
})

const contractStats = computed(() => {
  const institutions = institutionStore.institutions

  return [
    {
      title: "total-institutions",
      eyebrow: "Total geral",
      endVal: institutions.length,
      tone: "primary",
      icon: "ph-buildings"
    },
    {
      title: "total-disabled-institutions",
      eyebrow: "Estado",
      endVal: institutions.filter(item => item.enabled === false).length,
      tone: "danger",
      icon: "ph-x-circle"
    },
    {
      title: "total-public-institutions",
      eyebrow: "Tipologia",
      endVal: institutions.filter(item => item.institutionType?.name === "ESTADO").length,
      tone: "warning",
      icon: "ph-buildings"
    }
  ]
})
</script>

<template>
  <div class="institution-overview">
    <div class="institution-overview__grid">
      <v-card
        v-for="(item, index) in contractStats"
        :key="'institution-stats-' + index"
        class="institution-overview__card"
      >
        <v-card-text class="institution-overview__card-body">
          <div class="institution-overview__card-top">
            <v-avatar
              :color="item.tone"
              density="compact"
              variant="tonal"
              class="institution-overview__icon"
            >
              <i :class="item.icon" />
            </v-avatar>

            <div class="institution-overview__copy">
              <h3 class="institution-overview__title">{{ $t("t-" + item.title) }}</h3>
            </div>
          </div>

          <div class="institution-overview__metric">
            <CountTo :endVal="item.endVal" class="institution-overview__value" />
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<style scoped>
.institution-overview {
  margin-bottom: 2px;
}

.institution-overview__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.institution-overview__card {
  background: #ffffff;
  border: 1px solid #e6edf5;
  border-radius: 16px !important;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04) !important;
  overflow: hidden;
}

.institution-overview__card-body {
  padding: 18px 18px 16px;
}

.institution-overview__card-top {
  align-items: center;
  display: flex;
  gap: 14px;
}

.institution-overview__icon {
  border: 1px solid rgba(148, 163, 184, 0.16);
  flex: 0 0 auto;
  height: 42px !important;
  width: 42px !important;
}

.institution-overview__copy {
  min-width: 0;
}

.institution-overview__title {
  color: #334155;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
}

.institution-overview__metric {
  margin-top: 14px;
}

.institution-overview__value {
  color: #0f172a;
  display: inline-block;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

@media (max-width: 959px) {
  .institution-overview__grid {
    grid-template-columns: 1fr;
  }

  .institution-overview__card-body {
    padding: 16px 16px 14px;
  }

  .institution-overview__value {
    font-size: 1.3rem;
  }
}
</style>
