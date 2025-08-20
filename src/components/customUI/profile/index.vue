<script lang="ts" setup>
import { Img4 } from "@/assets/images/small/utils";
import ProfileInfo from "@/components/customUI/profile/ProfileInfo.vue";
import ProfileDetails from "@/components/customUI/profile/ProfileDetails.vue";
import { Avatar1 } from "@/assets/images/users/utils";
</script>
<template>
  <Card title="Basic Example">
    <v-card-text>
      <v-img :src="Img4" height="200" cover class="rounded" />
      <v-row justify="space-between" class="position-relative">
        <v-col cols="12" lg="3">
          <div class="ms-5">
            <v-avatar
              :image="Avatar1"
              size="90"
              class="custom-ui-profile-info"
            />
          </div>
          <ProfileInfo />
        </v-col>
        <v-col cols="12" lg="3" class="mt-10"> <ProfileDetails /></v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="Center Profile" class="mt-4 h-100">
    <v-card-text>
      <v-img :src="Img4" height="200" cover class="rounded" />
      <v-row class="position-relative" justify="center">
        <v-col cols="12" lg="4" class="text-center">
          <div class="d-flex justify-center">
            <v-avatar
              :image="Avatar1"
              size="90"
              class="custom-ui-profile-info"
            />
          </div>

          <ProfileInfo />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
  <Card title="End Profile" class="mt-4 h-100">
    <v-card-text class="position-relative">
      <v-img :src="Img4" height="200" cover class="rounded" />
      <v-row justify="space-between" class="position-relative">
        <v-col cols="12" lg="3" class="mt-10"> <ProfileDetails /></v-col>
        <v-col cols="12" lg="3">
          <div class="d-flex justify-end">
            <v-avatar
              :image="Avatar1"
              size="90"
              class="custom-ui-profile-info"
            />
          </div>
          <ProfileInfo class="text-right" />
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
