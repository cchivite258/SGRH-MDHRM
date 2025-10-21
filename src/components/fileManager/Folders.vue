<script lang="ts" setup>
import {
  foldersHeadingOptions,
  folders,
  foldersOptions,
} from "@/components/fileManager/utils";
</script>
<template>
  <Card title="Folders" elevation="0">
    <template #title-action>
      <ListMenuWithIcon :menuItems="foldersHeadingOptions" />
    </template>
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          lg="4"
          v-for="(folder, index) in folders"
          :key="'folder-card-' + index"
        >
          <v-card rounded border elevation="0">
            <v-card-text>
              <div class="d-flex justify-space-between align-center">
                <i class="ph-folder-notch-open text-primary ph-2x" />
                <ListMenuWithIcon :menuItems="foldersOptions" />
              </div>
              <div class="text-subtitle-2 font-weight-bold mt-5 text-truncate">
                {{ folder.title }}
              </div>
              <div class="text-muted d-flex mt-1">
                <span class="me-2">
                  <b> {{ folder.date }} </b> {{ folder.month }}
                </span>
                <span class="me-2">
                  <b> {{ folder.files }} </b> Files
                </span>
                <span>
                  <b> {{ folder.size }} </b> {{ folder.sizeType }}
                </span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
