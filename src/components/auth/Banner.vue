
<script lang="ts" setup>
import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
} from "@/assets/images/users/utils";
import {
  login,
  Logo
} from "@/assets/images/auth/utils";
</script>
<template>
  <v-card color="secondary" class="text-center auth-card h-100">
    <!-- Container principal da imagem -->
    <v-img :src="login" cover class="h-100 position-relative" gradient="to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.4)">

      <!-- Conteúdo sobreposto -->
      <div class="d-flex flex-column justify-space-between h-100">
      
        <!-- Texto no centro -->
        <v-card-title class="text-center mt-5 position-relative">
          <div class="mx-auto">
            <!-- Logotipo -->
            <v-avatar size="50%" >
              <v-img :src="Logo" alt="Logo" />
            </v-avatar>
            <div class="font-weight-bold text-h6 text-white text-wrap">
              {{ $t('t-system-name') }}
            </div>
            <div class="text-caption mt-1 font-weight-regular text-white opacity-75">
              {{ $t('t-system-slogan') }}
            </div>
          </div>
        </v-card-title>

        <!-- Rodapé -->
        <v-card-actions class="pb-10 justify-center auth-banner-action">
          <p class="text-white opacity-75 text-caption font-weight-regular">
            &copy; {{ new Date().getFullYear() }} SIGRH. Desenvolvido por
            <i class="mdi mdi-heart text-danger"></i>
            MD Consultores
          </p>
        </v-card-actions>
      </div>
    </v-img>
  </v-card>
</template>
