<script lang="ts" setup>
import {
  menuOptions,
  information,
  socialMedias,
  documents,
  recentFollowers,
} from "@/components/pages/profile/utils";
import { Avatar1 } from "@/assets/images/users/utils";
import { ref } from "vue";

const isFollowed = ref(false);
</script>
<template>
  <v-card>
    <v-card-title class="d-flex justify-end">
      <ListMenuWithIcon
        variant="tonal"
        :menuItems="menuOptions"
        :icon="'ph-share-network'"
      />
    </v-card-title>
    <v-card-text class="pb-0">
      <div class="text-center">
        <v-avatar size="90" class="border pa-1">
          <v-img :src="Avatar1" class="rounded-circle" />
        </v-avatar>

        <div class="text-subtitle-1 mt-3 mb-2 font-weight-bold">
          Richard Marshall <i class="bx bxs-badge-check text-info bx-xs"></i>
        </div>
        <div class="text-muted">Web Developer</div>
      </div>

      <v-row class="mt-4">
        <v-col cols="6">
          <v-hover>
            <template v-slot:default="{ isHovering, props }">
              <v-btn
                v-bind="props"
                color="secondary"
                block
                :variant="isFollowed || isHovering ? 'elevated' : 'tonal'"
                @click="isFollowed = !isFollowed"
              >
                <i v-if="isFollowed" class="ph-user-circle-plus me-1" />
                <i v-else class="ph-plus me-1" />
                {{ isFollowed ? "UnFollow" : "Follow" }}
              </v-btn>
            </template>
          </v-hover>
        </v-col>
        <v-col cols="6">
          <v-btn color="primary" variant="elevated" block>
            <i class="ph-chat-text me-1" /> Contact Us</v-btn
          >
        </v-col>
      </v-row>
      <div class="dashed-border mt-6"></div>
    </v-card-text>
    <Card title="Information" elevation="0">
      <v-card-text class="pb-0">
        <v-row
          v-for="(item, index) in information"
          :key="'profile-information-' + index"
          justify="space-between"
          no-gutters
          class="mb-2"
        >
          <v-col cols class="font-weight-bold"> {{ item.title }} </v-col>
          <v-col
            cols
            class="text-end"
            :class="item.isLink ? 'text-primary' : 'text-muted'"
          >
            {{ item.value }}
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col class="font-weight-bold" cols>Social Media</v-col>
          <v-col cols class="text-right">
            <v-avatar
              v-for="(item, i) in socialMedias"
              :key="'social-media-' + i"
              :color="item.color"
              variant="tonal"
              density="compact"
              class="me-1"
            >
              <i :class="item.icon" />
            </v-avatar>
          </v-col>
        </v-row>
        <div class="dashed-border mt-6"></div>
      </v-card-text>
    </Card>
    <Card title="Documents">
      <v-card-text class="pb-0">
        <v-row v-for="(item, i) in documents" :key="'document-' + i">
          <v-col cols class="d-flex">
            <v-avatar class="dashed-border me-3">
              <i :class="item.icon" />
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ item.title }}</div>
              <div class="text-muted">{{ item.size }}</div>
            </div>
          </v-col>
          <v-col cols="auto">
            <v-btn icon="ph-download-simple" />
          </v-col>
        </v-row>
        <div class="dashed-border mt-6"></div>
      </v-card-text>
    </Card>
    <Card title="Recent Followers">
      <v-card-text>
        <v-row
          justify="space-between"
          v-for="(item, i) in recentFollowers"
          :key="'recent-follower-' + i"
          align="center"
        >
          <v-col cols class="d-flex">
            <v-avatar
              :image="item.src"
              rounded
              class="simple-border pa-1 me-3"
              size="50"
            />
            <div>
              <div class="font-weight-bold">{{ item.title }}</div>
              <div class="text-muted">{{ item.designation }}</div>
            </div>
          </v-col>
          <v-col cols="auto">
            <v-hover>
              <template v-slot:default="{ isHovering, props }">
                <v-btn
                  v-bind="props"
                  v-model="item.isFollowed"
                  color="info"
                  icon
                  rounded
                  density="compact"
                  :variant="
                    item.isFollowed || isHovering ? 'elevated' : 'tonal'
                  "
                  @click="item.isFollowed = !item.isFollowed"
                >
                  <i v-if="item.isFollowed" class="ph-user-circle-plus" />
                  <i v-else class="ph-plus" />
                </v-btn>
              </template>
            </v-hover>
          </v-col>
        </v-row>
      </v-card-text>
    </Card>
  </v-card>
</template>
