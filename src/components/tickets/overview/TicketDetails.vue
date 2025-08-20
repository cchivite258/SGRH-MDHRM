<script lang="ts" setup>
import { avatars } from "@/components/tickets/list/utils";
import MenuSelect from "@/app/common/components/filters/MenuSelect.vue";
import { ref } from "vue";
import { Avatar1 } from "@/assets/images/users/utils";

const assignees = avatars.slice(0, 3);
const status = ref("New");
</script>
<template>
  <Card title="Ticket Details" class="h-100" title-class="py-4">
    <v-card-text>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Ticket No </v-col>
        <v-col cols="auto"> #TBS24301901 </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Client </v-col>
        <v-col cols="auto"> Themesbrand </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Project </v-col>
        <v-col cols="auto"> Steex - Admin & Dashboard </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Assigned To: </v-col>
        <v-col cols="auto">
          <div class="d-flex">
            <div
              class="position-relative d-flex"
              v-for="(avatar, index) in assignees"
              :key="avatar.assigneeName"
            >
              <v-tooltip :text="avatar.assigneeName" location="top">
                <template v-slot:activator="{ props }">
                  <v-avatar
                    v-bind="props"
                    size="30"
                    class="avatar-group-item curser-pointer"
                  >
                    <v-img :src="avatar.assigneeImg" />
                  </v-avatar>
                </template>
              </v-tooltip>
            </div>
            <v-tooltip :text="`Add Members`" location="top">
              <template v-slot:activator="{ props }">
                <v-avatar
                  v-bind="props"
                  size="30"
                  class="avatar-group-item curser-pointer"
                  color="light"
                >
                  +
                </v-avatar>
              </template>
            </v-tooltip>
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Status: </v-col>
        <v-col cols="8">
          <MenuSelect
            v-model="status"
            :items="['Close', 'InProgress', 'New', 'Open']"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Priority: </v-col>
        <v-col cols="8">
          <v-chip color="danger" variant="flat" label density="comfortable">
            High
          </v-chip>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Create Date: </v-col>
        <v-col cols="8"> 10 Dec, 2023 </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Due Date: </v-col>
        <v-col cols="8"> 29 Dec, 2023 </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Last Activity: </v-col>
        <v-col cols="8"> 14 min ago </v-col>
      </v-row>
      <v-row>
        <v-col cols="4" class="font-weight-bold"> Labels: </v-col>
        <v-col cols="8">
          <v-chip
            v-for="item in ['Admin', 'UI', 'Dashboard', 'Design']"
            :key="item"
            color="primary"
            label
            density="compact"
            class="ma-1 font-weight-medium"
          >
            {{ item }}
          </v-chip>
        </v-col>
      </v-row>
    </v-card-text>
    <v-divider class="my-4" />
    <Card title="Support Team" elevation="0">
      <template #title-action>
        <v-btn color="primary" variant="text">
          View More <i class="ph-arrow-right ms-1" />
        </v-btn>
      </template>

      <v-card-text>
        <div class="d-flex align-center mb-5">
          <v-avatar rounded size="50">
            <v-img :src="Avatar1" />
          </v-avatar>
          <div class="ms-3">
            <div class="text-subtitle-2 font-weight-bold mb-1">
              Morton Satterfield
            </div>
            <div class="text-muted">Admin & Founder</div>
          </div>
        </div>
        <v-btn block color="secondary">
          <i class="ph-chat-circle-text me-1" /> Get In Touch
        </v-btn>
      </v-card-text>
    </Card>
  </Card>
</template>
