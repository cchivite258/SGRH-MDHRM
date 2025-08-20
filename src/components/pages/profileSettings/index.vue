<script lang="ts" setup>
import { ref } from "vue";
import LeftSidebar from "@/components/pages/profileSettings/LeftSidebar.vue";
import { tabs } from "@/components/pages/profileSettings/utils";
import PersonalDetails from "@/components/pages/profileSettings/PersonalDetails.vue";
import ChangePassword from "@/components/pages/profileSettings/ChangePassword.vue";
import Education from "@/components/pages/profileSettings/Education.vue";
import SecurityPrivacy from '@/components/pages/profileSettings/SecurityPrivacy.vue'
const activeTab = ref("personal");
</script>
<template>
  <v-row>
    <v-col lg="3">
      <LeftSidebar />
    </v-col>
    <v-col lg="9">
      <div class="d-flex justify-space-between">
        <v-tabs v-model="activeTab">
          <v-tab
            v-for="(item, i) in tabs"
            :key="'profile-tab-' + i"
            :value="item.value"
          >
            {{ $t('t-'+item.title )}}
          </v-tab>
        </v-tabs>
        <!--<v-btn color="secondary" to="/pages/profile-settings">
          <i class="ph-pencil me-1" /> Edit Profile
        </v-btn>-->
      </div>

      <v-window v-model="activeTab">
        <v-window-item value="personal"> <PersonalDetails /> </v-window-item>
        <v-window-item value="password"> <ChangePassword /> </v-window-item>
        <!--<v-window-item value="education"> <Education /> </v-window-item>-->
        <v-window-item value="security"> <SecurityPrivacy /> </v-window-item>
      </v-window>
    </v-col>
  </v-row>
</template>
