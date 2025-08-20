<script lang="ts" setup>
import { courseList } from "@/components/learning/students/courses/utils";
import Status from "@/app/common/components/Status.vue";
</script>
<template>
  <Card title="My Courses" title-class="py-5">
    <template #title-badge>
      <v-badge content="23" inline color="light" rounded />
    </template>
    <template #title-action>
      <v-btn color="primary" to="/student/subscriptions">
        <i class="ph-bag me-1" /> Upgrade Courses
      </v-btn>
    </template>
  </Card>

  <v-card
    v-for="(item, index) in courseList"
    :key="'course-listing-' + index"
    class="mt-5"
  >
    <v-row no-gutters>
      <v-col cols="4" lg="3">
        <div
          :class="item.color"
          class="text-center learning-widgets d-flex align-center justify-center h-100"
        >
          <v-avatar size="80" rounded>
            <v-img :src="item.src" alt="" class="avatar-lg" />
          </v-avatar>
          <img :src="item.src" alt="" class="effect" />
        </div>
      </v-col>
      <v-col cols="8" lg="9">
        <v-card-text>
          <div class="d-flex justify-space-between">
            <div>
              <Status :status="item.badge" />
            </div>
            <div class="text-subtitle-1 font-weight-medium">
              {{ item.price }}
            </div>
          </div>
          <div class="text-subtitle-1 font-weight-bold mt-2 text-truncate">
            {{ item.title }}
          </div>
          <div class="text-muted">{{ item.course }}</div>
          <div class="mt-4 d-flex flex-wrap">
            <span class="me-2 d-flex align-center">
              <i class="ph-clock text-primary me-1" />
              <span class="text-muted"> {{ item.time }} </span>
            </span>
            <span class="me-2 d-flex align-center">
              <i class="ph-student text-primary me-1" />
              <span class="text-muted"> {{ item.students }} </span>
            </span>
            <span class="me-2 d-flex align-center">
              <i class="ph-graduation-cap text-primary me-1" />
              <span class="text-muted"> {{ item.lessons }} </span>
            </span>
            <span class="me-2 d-flex align-center">
              <i class="ph-translate text-primary me-1" />
              <span class="text-muted"> {{ item.languages }} </span>
            </span>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions
          class="d-flex justify-space-between align-center px-4 py-4"
        >
          <div>
            <v-avatar density="compact" class="me-2">
              <v-img :src="item.userLogo" />
            </v-avatar>
            <span class="font-weight-bold"> {{ item.user }} </span>
          </div>
          <div>
            <v-chip color="warning" label density="compact">
              <i class="bx bxs-star me-1" /> {{ item.rating }}
            </v-chip>
          </div>
        </v-card-actions>
        <v-progress-linear
          :model-value="item.progress"
          :color="item.progressColor"
          height="5"
        />
      </v-col>
    </v-row>
  </v-card>
</template>
