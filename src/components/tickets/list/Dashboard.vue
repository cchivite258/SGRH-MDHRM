<script lang="ts" setup>
import { tickets } from "@/components/tickets/list/utils";
import SuccessChip from "@/app/common/components/SuccessChip.vue";
import pattern from "@/assets/images/effect-pattern/pattern.png";
</script>
<template>
  <v-row>
    <v-col
      cols="12"
      sm="6"
      lg="3"
      v-for="(item, index) in tickets"
      :key="'ticket-' + index"
    >
      <v-card>
        <v-card-text>
          <div class="d-flex justify-space-between">
            <v-avatar :color="item.color" variant="tonal" rounded size="50">
              <i :class="item.icon" />
            </v-avatar>
            <div>
              <SuccessChip
                :isSuccess="item.isSuccess"
                :percent="item.percent"
                class="me-1"
              />
              than last week
            </div>
          </div>
          <div class="mt-4">
            <CountTo
              :endVal="item.endVal"
              :suffix="item.suffix"
              class="text-h6 font-weight-bold"
            />
          </div>
          <div class="mt-3 text-muted font-weight-bold">{{ item.type }}</div>
        </v-card-text>
        <v-img :src="pattern" height="100" width="85" class="ticket-card-img" />
      </v-card>
    </v-col>
  </v-row>
</template>
