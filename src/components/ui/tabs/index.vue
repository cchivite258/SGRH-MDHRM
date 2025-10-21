<script lang="ts" setup>
import { tabs, tabsContent } from "@/components/ui/tabs/utils";
import { ref } from "vue";
const tab = ref("Home");
const tab2 = ref("Home");
const tab3 = ref("Home");
const tab4 = ref("Home");
</script>
<template>
  <v-row>
    <v-col cols="12">
      <div class="font-weight-bold text-subtitle-1 mb-3">Default Tabs</div>
      <v-card>
        <v-card-text class="text-muted">
          The <code>v-tabs </code> component is used for hiding content behind a
          selectable item. This can also be used as a pseudo-navigation for a
          page, where the tabs are links and the tab-items are the content.
        </v-card-text>
        <v-tabs v-model="tab" class="bg-primary-subtle">
          <v-tab :value="item" v-for="item in tabs" :key="'tab-' + item">
            {{ item }}
          </v-tab>
        </v-tabs>
        <v-divider />

        <v-card-text>
          <v-window v-model="tab">
            <v-window-item
              v-for="item in tabsContent"
              :key="'tab-content-' + item.name"
              :value="item.name"
            >
              <div class="font-weight-bold">{{ item.title }}</div>
              <div class="text-muted mt-1">{{ item.details }}</div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12">
      <div class="font-weight-bold text-subtitle-1 mb-3">Align Tabs</div>
      <v-card>
        <v-card-text class="text-muted">
          The <code>align-tabs</code> prop will align tabs to the <b>start</b>,
          <b>center</b>, or <b>end</b> of its container. By default it is
          <b>start</b>
        </v-card-text>
        <v-row>
          <v-col cols="12" lg="6">
            <div class="text-muted mt-4 mx-4">
              For <code> align-tabs="center" </code>
            </div>
            <v-tabs
              v-model="tab2"
              align-tabs="center"
              class="bg-primary-subtle"
            >
              <v-tab
                :value="item"
                v-for="item in tabs"
                :key="'tab-' + item"
              >
                {{ item }}
              </v-tab>
            </v-tabs>
            <v-divider />

            <v-card-text>
              <v-window v-model="tab2">
                <v-window-item
                  v-for="item in tabsContent"
                  :key="'tab-content-' + item.name"
                  :value="item.name"
                >
                  <div class="font-weight-bold">{{ item.title }}</div>
                  <div class="text-muted mt-1">{{ item.details }}</div>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-col>
          <v-col cols="12" lg="6">
            <div class="text-muted mt-4 mx-4">
              For <code> align-tabs="end" </code>
            </div>
            <v-tabs v-model="tab3" align-tabs="end" class="bg-primary-subtle">
              <v-tab
                :value="item"
                v-for="item in tabs"
                :key="'tab-' + item"
              >
                {{ item }}
              </v-tab>
            </v-tabs>
            <v-divider />

            <v-card-text>
              <v-window v-model="tab3">
                <v-window-item
                  v-for="item in tabsContent"
                  :key="'tab-content-' + item.name"
                  :value="item.name"
                >
                  <div class="font-weight-bold">{{ item.title }}</div>
                  <div class="text-muted mt-1">{{ item.details }}</div>
                </v-window-item>
              </v-window>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="12">
      <div class="font-weight-bold text-subtitle-1 mb-3">Vertical Tabs</div>
      <v-card>
        <v-card-text class="text-muted">
          The <code>direction</code> prop allows for
          <code>v-tab</code> components to stack vertically.
        </v-card-text>
        <div class="d-flex flex-row">
          <v-tabs
            v-model="tab4"
            color="primary"
            direction="vertical"
          >
            <v-tab
              :value="item"
              v-for="item in tabs"
              :key="'tab-' + item"
              style="width: 120px"
            >
              {{ item }}
            </v-tab>
          </v-tabs>

          <v-window v-model="tab4">
            <v-window-item
              v-for="item in tabsContent"
              :key="'tab-content-' + item.name"
              :value="item.name"
              class="ps-4"
            >
              <div class="font-weight-bold">{{ item.title }}</div>
              <div class="text-muted mt-1">{{ item.details }}</div>
            </v-window-item>
          </v-window>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>
