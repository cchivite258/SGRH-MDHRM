<script lang="ts">
import { brandsList } from "@/components/layouts/utils";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/app/http/httpServiceProvider";
import { useRouter } from "vue-router"; 
import { computed } from "vue";
import { PERMISSIONS } from "@/app/permissions/constants";
import { usePermissions } from "@/composables/usePermissions";

export default {
  data() {
    return {
      brandsList
    };
  },
  setup() {
    const authStore = useAuthStore(); 
    const router = useRouter(); 
    const { can, canAny } = usePermissions();

    const userName = computed(() => authStore.user?.firstName || "Utilizador");
    // O item do perfil só aparece quando a autenticação já carregou uma claim de perfil.
    const canAccessProfile = computed(() => canAny(PERMISSIONS.USER_PROFILE.ACCESS));
    // Quem pode editar vai direto para definições; quem só lê entra na página de consulta.
    const profileLink = computed(() =>
      can(PERMISSIONS.USER_PROFILE.UPDATE) ? "/pages/profile-settings" : "/pages/profile"
    );
    const userRole = computed(() => authStore.user?.function_name || "Sem função");

    function logout() {
      authService.logout();
      //authStore.clearUserData(); 
      router.push("/login"); 
    }

    return { brandsList, logout, userName, userRole, canAccessProfile, profileLink };
  },
};
</script>
<template>
  <v-menu width="175">
    <template v-slot:activator="{ props }">
      <a dark v-bind="props" class="d-flex align-center mx-3">
        <v-avatar size="small" class="user-profile">
          <v-img
            class="header-profile-user"
            src="@/assets/images/users/avatar-1.jpg"
            alt="Header Avatar"
          />
        </v-avatar>
        <span class="text-start ms-xl-3">
          <h4 class="d-none d-xl-inline-block user-name-text font-weight-medium">
            {{ userName }}
          </h4>
          <span class="d-none d-xl-block user-name-sub-text"> {{ userRole }} </span>
        </span>
      </a>
    </template>
    <v-list density="compact" :lines="false" class="profile-list" nav>
      <h6 class="dropdown-header">{{ userName }}</h6>
      <v-list-item v-if="canAccessProfile" class="dropdown-item" :to="profileLink">
        <i class="mdi mdi-account-circle text-muted" />
        {{$t('t-profile')}}
      </v-list-item>
      <v-list-item class="dropdown-item" @click="" to="/auth/lockscreen">
        <i class="mdi mdi-lock text-muted" />
        <span class="align-middle">{{$t('t-lock-screen')}}</span>
      </v-list-item>
      <v-list-item class="dropdown-item" @click="logout" to="/logout">
        <i class="mdi mdi-logout text-muted" />
        <span class="align-middle" data-key="t-logout">{{$t('t-logout')}} </span>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
