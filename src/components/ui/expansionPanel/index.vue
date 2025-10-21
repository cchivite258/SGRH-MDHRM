<script lang="ts" setup>
import { ref } from "vue";
import { panels } from "@/components/ui/expansionPanel/utils";
const openTab = ref([0]);
const openTab2 = ref([0]);
const openTab3 = ref([0]);
const openTab4 = ref([0]);
const openTab5 = ref([0]);
const openTab6 = ref([0]);
</script>
<template>
  <div class="text-muted pb-4">
    The <code>v-expansion-panel</code> component is useful for reducing vertical
    space with large amounts of information. The default functionality of the
    component is to only display one <code>expansion-panel</code> body at a
    time; however, with the multiple property, the expansion-panel can remain
    open until explicitly closed.
  </div>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Default Expansion Panel">
        <v-card-text>
          <v-expansion-panels
            class="mt-4 expansion-panels expansion-panel"
            v-model="openTab"
          >
            <v-expansion-panel
              v-for="(item, index) in panels"
              :key="'expansion-panel-' + index"
            >
              <v-expansion-panel-title class="text-caption font-weight-medium">
                {{ item.title }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-muted">
                <div class="mx-3">{{ item.detail }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Inset Variant Expansion Panel">
        <v-card-text>
          <v-expansion-panels
            class="mt-4 expansion-panels expansion-panel"
            v-model="openTab2"
            variant="inset"
          >
            <v-expansion-panel
              v-for="(item, index) in panels"
              :key="'expansion-panel-' + index"
            >
              <v-expansion-panel-title class="text-caption font-weight-medium">
                {{ item.title }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-muted">
                <div class="mx-3">{{ item.detail }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Popout Variant Expansion Panel">
        <v-card-text>
          <v-expansion-panels
            class="mt-4 expansion-panels expansion-panel"
            v-model="openTab3"
            variant="popout"
          >
            <v-expansion-panel
              v-for="(item, index) in panels"
              :key="'expansion-panel-' + index"
            >
              <v-expansion-panel-title class="text-caption font-weight-medium">
                {{ item.title }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-muted">
                <div class="mx-3">{{ item.detail }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Multiple panel">
        <v-card-text>
          <v-expansion-panels
            class="mt-4 expansion-panels expansion-panel"
            v-model="openTab4"
            multiple
          >
            <v-expansion-panel
              v-for="(item, index) in panels"
              :key="'expansion-panel-' + index"
            >
              <v-expansion-panel-title class="text-caption font-weight-medium">
                {{ item.title }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="text-muted">
                <div class="mx-3">{{ item.detail }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Expansion Panel without Icons">
        <v-card-text>
          <v-expansion-panels
            class="mt-4 expansion-panels expansion-panel w-100"
            v-model="openTab5"
          >
            <v-expansion-panel
              v-for="(item, index) in panels"
              :key="'expansion-panel-' + index"
              class="w-100"
            >
              <v-expansion-panel-title
                collapse-icon=""
                expand-icon=""
                class="text-caption font-weight-medium"
              >
                {{ item.title }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="w-100 text-muted">
                <div class="mx-3">{{ item.detail }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Expansion Panel with Icons">
        <v-card-text>
          <v-expansion-panels
            class="mt-4 expansion-panels expansion-panel w-100"
            v-model="openTab6"
          >
            <v-expansion-panel
              v-for="(item, index) in panels"
              :key="'expansion-panel-' + index"
              class="w-100"
            >
              <v-expansion-panel-title
                collapse-icon="ph-minus"
                expand-icon="ph-plus"
                class="text-caption font-weight-medium"
              >
                {{ item.title }}
              </v-expansion-panel-title>
              <v-expansion-panel-text class="w-100 text-muted">
                <div class="mx-3">{{ item.detail }}</div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
