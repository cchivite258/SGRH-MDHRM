<script lang="ts" setup>
import { ref } from "vue";
import ImageUploader from "@/app/common/components/ImageUploader.vue";
import { fileManageOptions } from "@/components/fileManager/utils";

const files = ref([]);
</script>
<template>
  <v-card class="file-manager-wrapper position-relative h-100">
    <v-card-text style="height: 100vh">
      <div class="d-flex flex-column h-100">
        <div class="d-flex align-center mb-5">
          <v-badge dot color="success" class="me-3">
            <v-avatar rounded size="45">
              <v-img src="@/assets/images/users/avatar-1.jpg" />
            </v-avatar>
          </v-badge>
          <div>
            <p class="text-muted mb-1">Welcome to file manager</p>
            <b-link href="#!" class="stretched-link">
              <h6 class="text-subtitle-2 font-weight-bold mb-1 mb-0">Silene Oliveira</h6>
            </b-link>
          </div>
        </div>
        <ImageUploader v-model="files" />
        <div>
          <div class="font-weight-bold">File Manager</div>
          <v-list density="compact">
            <v-hover
              v-for="(option, index) in fileManageOptions"
              :key="'file-manager-list-' + index"
            >
              <template v-slot:default="{ isHovering, props }">
                <v-list-item
                  min-height="32"
                  v-bind="props"
                  class="ps-1"
                  :class="isHovering ? 'text-primary' : ''"
                  @click=""
                >
                  <i :class="option.icon" class="me-1" />
                  {{ option.title }}
                </v-list-item>
              </template>
            </v-hover>
          </v-list>
        </div>
        <div class="text-center mt-auto mb-0">
          <v-avatar size="80" rounded>
            <v-img src="@/assets/images/techny-rocket.png" />
          </v-avatar>
          <div class="mt-3">Upgrade to Pro for unlimited storage</div>
          <v-btn class="" variant="text" color="primary">
            Upgrade Now <i class="ph-arrow-right ms-1" />
          </v-btn>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
