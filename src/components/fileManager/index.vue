<script lang="ts" setup>
import { ref } from "vue";
import LeftSidePanel from "@/components/fileManager/LeftSidePanel.vue";
import TopFolders from "@/components/fileManager/TopFolders.vue";
import Folders from "@/components/fileManager/Folders.vue";
import FileRecent from "@/components/fileManager/FileRecent.vue";
import StorageDetails from "@/components/fileManager/StorageDetails.vue";
const isVisible = ref(true);

const onToggleRightSideBar = () => {
  isVisible.value = !isVisible.value;
};

const onView = () => {
  if (!isVisible.value) {
    onToggleRightSideBar();
  }
};
</script>
<template>
  <v-row class="mt-1">
    <v-col cols="auto" class="h-100 pe-0 d-none d-md-block">
      <LeftSidePanel />
    </v-col>
    <v-col md="7" lg class="px-1">
      <v-card>
        <v-card-text>
          <TopFolders />
          <Folders class="mt-4" />
          <FileRecent class="mt-4" @onView="onView" />
        </v-card-text>
      </v-card>
    </v-col>
    <v-col
      v-if="isVisible && $vuetify.display.lgAndUp"
      cols="auto"
      class="ps-0"
    >
      <StorageDetails @onClose="onToggleRightSideBar" />
    </v-col>
  </v-row>
</template>
