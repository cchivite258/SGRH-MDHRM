<script lang="ts" setup>
import { Avatar1 } from "@/assets/images/users/utils";
import {
  portfolio,
  menuOptions,
  information,
  socialMedias,
  documents
} from "@/components/pages/profileSettings/utils";
import { useAuthStore } from "@/store/authStore";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
// Para garantir reatividade, usamos storeToRefs
const { user } = storeToRefs(authStore);

// Função para formatar a data
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};


</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-end">

    </v-card-title>
    <v-card-text class="pb-0">
      <div class="text-center">
        <v-avatar size="90" class="border pa-1">
          <v-img :src="Avatar1" class="rounded-circle" />
        </v-avatar>

        <div class="text-subtitle-1 mt-3 mb-2 font-weight-bold">
          {{ user?.firstName + ' ' + user?.lastName || $t('t-name') }} <i class="bx  text-info bx-xs"></i>
        </div>
        <div class="text-muted"> {{ user?.function_name || $t('t-role') }} </div>
      </div>
      <div class="dashed-border mt-6"></div>
    </v-card-text>

    <Card :title="$t('t-information')" elevation="0">
      <v-card-text class="pb-0">
        <v-row justify="space-between" no-gutters class="mb-2">
          <v-col cols class="font-weight-bold"> {{ $t('t-full-name') }} </v-col>
          <v-col cols class="text-end text-muted">
            {{ user?.firstName + ' ' + user?.lastName || $t('t-name') }}
          </v-col>
        </v-row>
        <v-row justify="space-between" no-gutters>
          <v-col cols class="font-weight-bold"> {{ $t('t-role') }} </v-col>
          <v-col cols class="text-end text-muted">
            {{ user?.function_name || $t('t-role') }}
          </v-col>
        </v-row>
        <v-row justify="space-between" no-gutters class="mb-2">
          <!-- <v-col cols class="font-weight-bold"> {{ $t('t-repartition') }} </v-col>
          <v-col
            cols
            class="text-end text-muted"
          >
          {{ user?.repartition_name || $t('t-division') }}
          </v-col> -->
        </v-row>
        <v-row justify="space-between" no-gutters class="mb-2">
          <v-col cols class="font-weight-bold"> {{ $t('t-joining-date') }} </v-col>
          <v-col cols class="text-end text-muted">
            {{ formatDate(user?.createdAt) || $t('t-joining-date') }}
          </v-col>
        </v-row>
        <div class="mt-4"></div>
      </v-card-text>
    </Card>

  </v-card>
</template>
