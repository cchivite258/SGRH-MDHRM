<script lang="ts" setup>
import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar6,
} from "@/assets/images/users/utils";
const agents = [
  {
    src: Avatar1,
    name: "Dianna Bogan",
    country: "United Kingdom",
    number: "+(86) 9985-9220",
  },
  {
    src: Avatar2,
    name: "Jansh Brown",
    country: "Germany",
    number: "+(27) 3041-1766",
  },
  {
    src: Avatar3,
    name: "Ayaan Bowen",
    country: "Brazil	",
    number: "+(51) 3233-7909",
  },
  {
    src: Avatar4,
    name: "Prezy Mark",
    country: "Spain	",
    number: "+(48) 3877-9000",
  },
  {
    src: Avatar5,
    name: "Vihan Hudda",
    country: "Brazil	",
    number: "+(11) 3885-1022",
  },
  {
    src: Avatar6,
    name: "Uriel King",
    country: "USA	",
    number: "+(21) 2345-6789",
  },
];
</script>
<template>
  <Card title="Agent List">
    <template #title-action>
      <v-btn variant="text" class="text-muted font-weight-regular">
        View All <i class="ph-caret-right mx-1"></i>
      </v-btn>
    </template>
    <v-card-text>
      <v-row
        v-for="(agent, index) in agents"
        :key="'real-estate-agent-' + index"
        class="align-center"
      >
        <v-col cols="4">
          <div class="d-flex align-center">
            <v-avatar size="25" class="mx-1">
              <v-img :src="agent.src" />
            </v-avatar>
            <div>{{ agent.name }}</div>
          </div>
        </v-col>
        <v-col>
          <div>{{ agent.country }}</div>
        </v-col>
        <v-col>
          <div>{{ agent.number }}</div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
