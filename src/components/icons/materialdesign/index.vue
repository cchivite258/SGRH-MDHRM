<script lang="ts" setup>
import { onMounted, ref, nextTick } from "vue";
import { materialIcons } from "@/components/icons/materialdesign/utils";

const icons = ref(materialIcons);
const newIcons = icons.value.filter((icon) => icon.version === "5.0.45");
</script>

<template>
  <Card title="New Icons">
    <v-card-text class="mdi-icon-wrapper">
      <p class="mb-4">
        Use <code>&lt;i class="mdi mdi-*-*"&gt;&lt;/i&gt;</code> class.
        <span class="pa-aut1 bg-success">v 6.5.95</span>.
      </p>

      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="4"
          xl="3"
          v-for="(icon, index) in newIcons"
          :key="'mdi-icon-' + index"
          class="text-muted mdi-icon"
        >
          <i :class="'mdi mdi-' + icon.name + ' me-2'" />
          {{ icon.name }}
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="All Icons" class="mt-4">
    <v-card-text class="mdi-icon-wrapper">
      <v-row>
        <v-col
          cols="12"
          sm="6"
          lg="4"
          xl="3"
          v-for="(icon, index) in icons"
          :key="'mdi-icon-' + index"
          class="text-muted mdi-icon"
        >
          <i :class="'mdi mdi-' + icon.name + ' me-2'" />
          {{ icon.name }}
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Size" class="mt-4">
    <v-card-text class="mdi-icon-wrapper">
      <v-row>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-18px mdi-account me-2"></i> mdi-18px
        </v-col>

        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-24px mdi-account me-2"></i> mdi-24px
        </v-col>

        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-36px mdi-account me-2"></i> mdi-36px
        </v-col>

        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-48px mdi-account me-2"></i> mdi-48px
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Rotate" class="mt-4">
    <v-card-text class="mdi-icon-wrapper">
      <v-row>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-rotate-45 mdi-account me-2"></i> mdi-rotate-45
        </v-col>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-rotate-90 mdi-account me-2"></i> mdi-rotate-90
        </v-col>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-rotate-135 mdi-account me-2"></i> mdi-rotate-135
        </v-col>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-rotate-180 mdi-account me-2"></i> mdi-rotate-180
        </v-col>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-rotate-225 mdi-account me-2"></i> mdi-rotate-225
        </v-col>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-rotate-270 mdi-account me-2"></i> mdi-rotate-270
        </v-col>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-rotate-315 mdi-account me-2"></i> mdi-rotate-315
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="Spin" class="mt-4">
    <v-card-text class="mdi-icon-wrapper">
      <v-row>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-spin mdi-loading me-2"></i> mdi-spin
        </v-col>
        <v-col xl="3" lg="4" sm="6" class="text-muted mdi-custom-icon">
          <i class="mdi mdi-spin mdi-star me-2"></i> mdi-spin
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
