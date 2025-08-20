<script lang="ts">
import { brandsList } from "@/components/layouts/utils";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/app/http/httpServiceProvider";
import { useRouter } from "vue-router"; 
import { computed } from "vue";

export default {
  data() {
    return {
      brandsList
    };
  },
  setup() {
    const authStore = useAuthStore(); 
    const router = useRouter(); 

    const userName = computed(() => authStore.user?.firstName || "Utilizador");
    const userRole = computed(() => authStore.user?.function_name || "Sem função");

    function logout() {
      authService.logout();
      //authStore.clearUserData(); 
      router.push("/login"); 
    }

    return { brandsList, logout, userName, userRole };
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
      <v-list-item class="dropdown-item" to="/pages/profile-settings">
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
