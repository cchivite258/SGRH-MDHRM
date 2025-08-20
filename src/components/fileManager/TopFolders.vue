<script lang="ts" setup>
import { ref } from "vue";
import QuerySearch from "@/app/common/components/filters/QuerySearch.vue";
import { topFolders, stores } from "@/components/fileManager/utils";
import CreateEditProductDialog from "@/components/eCommerce/products/CreateEditProductDialog.vue";
import LeftSidePanel from "@/components/fileManager/LeftSidePanel.vue";

const dialog = ref(false);
const isLeftPanel = ref(false);
</script>
<template>
  <div>
    <v-row justify="space-between">
      <v-col cols="auto" v-if="$vuetify.display.smAndDown">
        <v-btn
          icon="ph-list"
          color="success"
          rounded
          density="comfortable"
          @click="isLeftPanel = !isLeftPanel"
        />
      </v-col>
      <v-col cols>
        <QuerySearch placeholder="Search for products, price, etc..." />
      </v-col>
      <v-col cols="auto">
        <v-btn class="ms-3" color="primary" @click="dialog = true">
          <i class="ph-plus me-1" /> Create Folders
        </v-btn>
      </v-col>
    </v-row>
    <v-row justify="space-between" class="mt-3">
      <v-col
        cols="auto"
        v-for="(folder, index) in topFolders"
        :key="'file-manager-top-folders-' + index"
      >
        <div class="d-flex align-center curser-pointer">
          <v-avatar
            :color="folder.color"
            variant="tonal"
            rounded
            density="compact"
            class="me-3"
          >
            <i :class="folder.icon" />
          </v-avatar>
          <div class="text-muted">
            <b> {{ folder.value }} </b>
            {{ folder.type }}
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-for="(store, index) in stores"
        :key="'store-' + index"
        cols="12"
        md="md"
      >
        <v-card border elevation="0">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar class="bg-primary-subtle me-3" rounded size="50">
                <v-img :src="store.img" height="30" />
              </v-avatar>
              <div>
                <div class="font-weight-bold">
                  {{ store.title }}
                </div>
                <div class="text-primary curser-pointer">Open Folders</div>
              </div>
            </div>
            <div class="mt-5">
              <v-progress-linear
                :model-value="store.size"
                :color="store.color"
                :height="5"
                rounded
              />
            </div>
            <div class="d-flex justify-space-between mt-2">
              <span> {{ store.currentSize }} Files</span>
              <span class="font-weight-bold">{{ store.totalSize }} GB</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
  <CreateEditProductDialog v-model="dialog" />
  <v-navigation-drawer v-model="isLeftPanel">
    <LeftSidePanel />
  </v-navigation-drawer>
</template>
