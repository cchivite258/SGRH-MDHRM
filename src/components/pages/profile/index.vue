<script lang="ts" setup>
import LeftSideBar from "@/components/pages/profile/LeftSideBar.vue";
import { tabs } from "@/components/pages/profile/utils";
import { computed, ref } from "vue";
import Overview from "@/components/pages/profile/Overview.vue";
import Activity from "@/components/pages/profile/Activity.vue";
import Projects from "@/components/pages/profile/Projects.vue";
import Friends from "@/components/pages/profile/Friends.vue";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

const activeTab = ref("overview");
const { can } = usePermissions();
// A página de perfil pode ser lida com read.user.settings, mas o botão de edição exige update.user.settings.
const canUpdateProfile = computed(() => can(PERMISSIONS.USER_PROFILE.UPDATE));
</script>
<template>
  <v-row>
    <v-col lg="3">
      <LeftSideBar />
    </v-col>
    <v-col lg="9">
      <div class="d-flex justify-space-between">
        <v-tabs v-model="activeTab" >
          <v-tab
            v-for="(item, i) in tabs"
            :key="'profile-tab-' + i"
            :value="item.value"
          >
            {{ item.title }}
          </v-tab>
        </v-tabs>
        <v-btn v-if="canUpdateProfile" color="primary" to="/pages/profile-settings">
          <i class="ph-pencil me-1" /> Edit Profile
        </v-btn>
      </div>

      <v-window v-model="activeTab">
        <v-window-item value="overview"> <Overview /> </v-window-item>
        <v-window-item value="activities"> <Activity /> </v-window-item>
        <v-window-item value="projects"> <Projects /> </v-window-item>
        <v-window-item value="friends"> <Friends /> </v-window-item>
      </v-window>
    </v-col>
  </v-row>
</template>
