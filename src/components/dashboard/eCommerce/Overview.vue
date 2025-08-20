<script lang="ts" setup>
import { OverviewList } from "@/components/dashboard/eCommerce/utils";
</script>
<template>
  <v-row no-gutters>
    <v-col
      cols="12"
      sm="6"
      v-for="(overview, index) in OverviewList"
      :key="'overview-' + index"
      class="simple-border"
    >
      <v-card class="pb-2 h-100">
        <v-card-text>
          <div class="d-flex justify-space-between">
            <v-avatar :color="overview.avatarColor" variant="tonal" size="50">
              <i :class="overview.icon" class="ph-lg"></i>
            </v-avatar>
            <ListMenu
              is-icon
              class="dashboard-menu"
              :listItems="['Today', 'Last Week', 'Last Month ', 'Current Year']"
            />
          </div>
          <div class="text-uppercase text-muted pt-5">
            {{ overview.title }}
          </div>
          <div>
            <h3 class="py-3">
              <CountTo
                class="text-h6 font-weight-bold"
                :prefix="overview.prefix"
                :endVal="overview.countTo"
                :suffix="overview.suffix"
                :decimals="overview.decimals"
              />
            </h3>
          </div>
          <div class="d-flex">
            <span
              class="d-flex align-center px-1 font-weight-bold"
              :class="overview.isSuccess ? 'text-success' : 'text-danger'"
              ><i
                v-if="overview.isSuccess"
                class="ph ph-arrow-up-right pe-1"
              ></i>
              <i v-else class="ph ph-trend-down px-1"></i>
              {{ overview.progress }}
            </span>
            <span class="text-muted"> than last week </span>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<style lang="scss">
.dashboard-menu {
  position: absolute;
  right: 15px;
}
</style>
