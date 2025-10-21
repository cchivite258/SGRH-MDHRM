<script lang="ts" setup>
import {
  security,
  notifications,
} from "@/components/pages/profileSettings/utils";
import { ref } from "vue";

const deleteText = ref("deleteTextHere");

</script>
<template>
  <Card :title="$t('t-security-privacy')">
    <v-card-text>
      <v-row v-for="(item, i) in security" :key="'security-' + i">
        <v-col cols>
          <div class="font-weight-bold text-subtitle-2">{{ $t('t-' + item.title) }}</div>
          <div class="text-muted mt-1">{{ $t('t-'+item.description) }}</div>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" density="compact" class="px-2">
            {{ $t('t-'+item.btnText) }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
    <!--<Card
      title="Application Notifications:"
      title-class="text-decoration-underline">
      <v-card-text>
        <v-row v-for="(item, i) in notifications" :key="'notification-' + i">
          <v-col cols>
            <div class="text-subtitle-2 font-weight-regular">
              {{ item.title }}
            </div>
            <div class="text-muted">{{ item.value }}</div>
          </v-col>
          <v-col cols="auto">
            <v-switch
              v-model="item.isActive"
              hide-details
              color="primary"
              density="compact"
              size="small"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </Card>-->
    <Card
      :title="$t('t-delete-this-account')"
      title-class="text-decoration-underline"
      elevation="0"
    >
      <v-card-text class="pb-0">
        <div class="text-muted">
          {{$t('t-delete-account-description')}}
        </div><br>
        <TextField v-model="deleteText" isPassword />
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-btn color="danger" variant="tonal">
          {{$t('t-close-delete-account')}}
        </v-btn>
        <v-btn color="secondary" variant="tonal"> {{$t('t-cancel')}} </v-btn>
      </v-card-actions>
    </Card>
  </Card>
</template>
