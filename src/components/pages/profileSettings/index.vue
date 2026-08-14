<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import LeftSidebar from "@/components/pages/profileSettings/LeftSidebar.vue";
import { tabs } from "@/components/pages/profileSettings/utils";
import PersonalDetails from "@/components/pages/profileSettings/PersonalDetails.vue";
import ChangePassword from "@/components/pages/profileSettings/ChangePassword.vue";
import Education from "@/components/pages/profileSettings/Education.vue";
import SecurityPrivacy from '@/components/pages/profileSettings/SecurityPrivacy.vue'
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";
const activeTab = ref("personal");
const { can } = usePermissions();
// Consulta vê apenas dados pessoais; atualização desbloqueia password e segurança.
const canUpdateProfile = computed(() => can(PERMISSIONS.USER_PROFILE.UPDATE));
const visibleTabs = computed(() =>
  tabs.filter((item) => item.value === "personal" || canUpdateProfile.value)
);

watch(
  visibleTabs,
  (items) => {
    if (!items.some((item) => item.value === activeTab.value)) {
      activeTab.value = items[0]?.value || "personal";
    }
  },
  { immediate: true }
);
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
            v-for="(item, i) in visibleTabs"
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
        <v-window-item v-if="canUpdateProfile" value="password"> <ChangePassword /> </v-window-item>
        <!--<v-window-item value="education"> <Education /> </v-window-item>-->
        <v-window-item v-if="canUpdateProfile" value="security"> <SecurityPrivacy /> </v-window-item>
      </v-window>
    </v-col>
  </v-row>
</template>
