<script lang="ts" setup>
import { ref } from "vue";
import Img1 from "@/assets/images/sidebar/img-1.jpg";
import { innerText } from "@/components/ui/navigation-drawer/utils";
const drawer = ref(false);
</script>
<template>
  <v-alert type="warning" color="warning" variant="tonal" class="mb-4"
    >For the purpose of display, some examples are wrapped in a
    <b>v-card</b> element. Within your application you will generally place the
    <code>v-navigation-drawer</code> as a direct child of <b>v-app</b>.
  </v-alert>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Default" class="h-100">
        <v-card-text class="text-muted">
          Use <code>v-navigation-drawer</code> to list all items. Set width by
          <code>width</code> property.
        </v-card-text>
        <v-divider />
        <v-layout>
          <v-navigation-drawer width="200" permanent>
            <v-list density="compact">
              <v-list-item link title="List Item 1" />
              <v-list-item link title="List Item 2" />
              <v-list-item link title="List Item 3" />
            </v-list>
          </v-navigation-drawer>
          <v-main>
            <v-card-text v-html="innerText"> </v-card-text>
          </v-main>
        </v-layout>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Drawer Position" class="h-100">
        <template #title-action>
          <v-btn color="primary" @click="drawer = !drawer">
            Toggle Right
          </v-btn>
        </template>
        <v-card-text class="text-muted">
          Using the <b>location: bottom, right,top, left</b> prop, we are able
          to relocate our drawer to come from the bottom of the screen. By
          default it is <b>left</b>.
        </v-card-text>
        <v-divider />
        <v-layout class="h-100">
          <v-navigation-drawer v-model="drawer" location="right" temporary>
            <v-list density="compact">
              <v-list-item link title="List Item 1" />
              <v-list-item link title="List Item 2" />
              <v-list-item link title="List Item 3" />
            </v-list>
          </v-navigation-drawer>
          <v-main>
            <v-card-text v-html="innerText"> </v-card-text>
          </v-main>
        </v-layout>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Expand on hover" class="h-100">
        <v-card-text class="text-muted">
          Places the component in <code>rail</code> mode and expands once
          hovered. This does not alter the content area of v-main. The width can
          be controlled with the rail-width property.
        </v-card-text>
        <v-divider />
        <v-layout class="h-100">
          <v-navigation-drawer expand-on-hover rail permanent>
            <v-list density="compact" nav>
              <v-list-item
                prepend-icon="mdi-folder"
                title="My Files"
                value="myfiles"
              />
              <v-list-item
                prepend-icon="mdi-account-multiple"
                title="Shared with me"
                value="shared"
              />
              <v-list-item
                prepend-icon="mdi-star"
                title="Starred"
                value="starred"
              />
            </v-list>
          </v-navigation-drawer>
          <v-main>
            <v-card-text v-html="innerText"></v-card-text>
          </v-main>
        </v-layout>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Background Images" class="h-100">
        <v-card-text class="text-muted">
          Apply a custom background to your drawer via the
          <code>image</code> prop. If you need to customize it further, you can
          use the image slot and render your own <code>v-img</code>.
        </v-card-text>
        <v-divider />
        <v-layout>
          <v-navigation-drawer :image="Img1" permanent theme="dark">
            <v-list nav>
              <v-list-item prepend-icon="mdi-email" title="Inbox" />
              <v-list-item
                prepend-icon="mdi-account-supervisor-circle"
                title="Supervisors"
              />
              <v-list-item prepend-icon="mdi-clock-start" title="Clock-in" />
            </v-list>
          </v-navigation-drawer>
          <v-main>
            <v-card-text v-html="innerText"></v-card-text>
          </v-main>
        </v-layout>
      </Card>
    </v-col>
  </v-row>
</template>
