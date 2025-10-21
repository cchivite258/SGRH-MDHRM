<script lang="ts" setup>
import Overview from "@/components/tickets/overview/Overview.vue";
import TicketDetails from "@/components/tickets/overview/TicketDetails.vue";
</script>
<template>
  <v-row no-gutters>
    <v-col cols="12" lg="9">
      <v-card>
        <v-card-text>
          <Overview />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" lg="3" class="ps-1">
      <TicketDetails />
    </v-col>
  </v-row>
</template>
