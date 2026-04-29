<script lang="ts" setup>
import { computed, onMounted } from "vue"
import { useLayoutStore } from "@/store/app"
import { useInstitutionStore } from "@/store/institution/institutionStore"

const layoutStore = useLayoutStore()
const institutionStore = useInstitutionStore()
const isDarkMode = computed(() => layoutStore.mode === "dark")

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
  <div
    class="institution-overview"
    :class="{ 'institution-overview--dark': isDarkMode }"
  >
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
  --institution-overview-card-bg: #ffffff;
  --institution-overview-card-border: #e6edf5;
  --institution-overview-card-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
  --institution-overview-title: #334155;
  --institution-overview-value: #0f172a;
  --institution-overview-icon-border: rgba(148, 163, 184, 0.16);
}

.institution-overview__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.institution-overview__card {
  background: var(--institution-overview-card-bg);
  border: 1px solid var(--institution-overview-card-border);
  border-radius: 16px !important;
  box-shadow: var(--institution-overview-card-shadow) !important;
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
  border: 1px solid var(--institution-overview-icon-border);
  flex: 0 0 auto;
  height: 42px !important;
  width: 42px !important;
}

.institution-overview__copy {
  min-width: 0;
}

.institution-overview__title {
  color: var(--institution-overview-title);
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.35;
  margin: 0;
}

.institution-overview__metric {
  margin-top: 14px;
}

.institution-overview__value {
  color: var(--institution-overview-value);
  display: inline-block;
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
}

.institution-overview--dark {
  --institution-overview-card-bg: #1a202c;
  --institution-overview-card-border: #2b3442;
  --institution-overview-card-shadow: 0 12px 24px rgba(2, 6, 23, 0.24);
  --institution-overview-title: #cbd5e1;
  --institution-overview-value: #f8fafc;
  --institution-overview-icon-border: rgba(148, 163, 184, 0.22);
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
