<script lang="ts" setup>
import { learningBreadcrumb } from "@/components/dashboard/learning/utils";
import Widget from "@/components/dashboard/learning/Widget.vue";
import DailyProgress from "@/components/dashboard/learning/DailyProgress.vue";
import Overview from "@/components/dashboard/learning/Overview.vue";
import Instructor from "@/components/dashboard/learning/Instructor.vue";
import RecentCourse from "@/components/dashboard/learning/RecentCourse.vue";
import Profile from "@/components/dashboard/learning/Profile.vue";
import Calender from "@/components/dashboard/learning/Calender.vue";
import UpcomingSchedule from "@/components/dashboard/learning/UpcomingSchedule.vue";

const shareItems = [
  {
    title: "Facebook",
    logo: "bxl-facebook-circle "
  },
  {
    title: "Whatsapp",
    logo: "bxl-whatsapp"
  },
  {
    title: "Instagram",
    logo: "bxl-instagram "
  }
];
</script>
<template>
  <!-- <Breadcrumb title="Learning" :items="learningBreadcrumb" /> -->
  <v-container class="my-3 px-2">
    <v-row>
      <v-col cols="12" xl="9">
        <v-row>
          <v-col cols="12" lg="8" xl="9">
            <Widget />
          </v-col>
          <v-col cols="12" lg="4" xl="3">
            <DailyProgress />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" lg="8">
            <Overview />
          </v-col>
          <v-col cols="12" lg="4">
            <Instructor />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <RecentCourse />
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" xl="3">
        <Card title="Overview">
          <template #title-action>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  variant="plain"
                  v-bind="props"
                  class="bg-secondary-subtle"
                  size="small"
                  min-width="15"
                >
                  <i class="ph-fill ph-share-network" />
                </v-btn>
              </template>
              <v-list density="compact" width="130" :lines="false">
                <v-list-item
                  v-for="(shareItem, index) in shareItems"
                  :key="'shareItems-' + index"
                  height="28"
                  min-height="28"
                  @click=""
                >
                  <div class="d-flex align-center">
                    <i class="bx bx-xs me-2" :class="shareItem.logo" />
                    {{ shareItem.title }}
                  </div>
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
          <Profile />
          <Calender />
          <UpcomingSchedule />
        </Card>
      </v-col>
    </v-row>
  </v-container>
</template>
