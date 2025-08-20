<script lang="ts" setup>
import { colors } from "@/components/ui/utils";
</script>
<template>
  <Card title="Background Color Options">
    <v-card-text>
      <div class="text-muted">
        Use different <code>color style</code> to color your element with a
        given table.
      </div>
      <v-row>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold my-4">Background Color</div>
          <v-container>
            <v-row v-for="(item, index) in colors" :key="'color-' + index">
              <v-col cols class="border">
                <code>{{ ".bg-" + item.value }}</code>
              </v-col>
              <v-col cols class="border">
                <div :class="'bg-' + item.value" class="h-100" />
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold my-4">Background Gradient</div>
          <v-container>
            <v-row v-for="(item, index) in colors" :key="'color-' + index">
              <v-col cols class="border">
                <code> .bg-gradient</code>
              </v-col>
              <v-col cols class="border">
                <div
                  :class="'bg-' + item.value + ' bg-gradient'"
                  class="h-100"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-col>
        <v-col cols="12" lg="4">
          <div class="font-weight-bold my-4">Background Subtle</div>
          <v-container>
            <v-row v-for="(item, index) in colors" :key="'color-' + index">
              <v-col cols class="border">
                <code>{{ ".bg-" + item.value + "-subtle" }}</code>
              </v-col>
              <v-col cols class="border">
                <div :class="'bg-' + item.value + '-subtle'" class="h-100" />
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>

  <Card title="Text Color Options" class="mt-4">
    <v-card-text>
      <div class="text-muted">
        Use different <code>color style</code> to color your element with a
        given table.
      </div>

      <v-container class="pt-0">
        <div class="font-weight-bold my-4">Text Color</div>
        <v-row>
          <v-col
            cols="12"
            lg="4"
            v-for="(item, index) in colors"
            :key="'color-' + index"
          >
            <v-row>
              <v-col cols="12" lg="5" class="border">
                <code>{{ ".text-" + item.value }}</code>
              </v-col>
              <v-col cols="12" lg="5" class="border">
                <div :class="'text-' + item.value">text-{{ item.value }}</div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" lg="4">
            <v-row>
              <v-col cols="12" lg="5" class="border">
                <code>.text-muted</code>
              </v-col>
              <v-col cols="12" lg="5" class="border">
                <div class="text-muted">text-muted</div>
              </v-col>
            </v-row>
          </v-col>
          <v-col cols="12" lg="4">
            <v-row>
              <v-col cols="12" lg="5" class="border">
                <code>.text-white</code>
              </v-col>
              <v-col cols="12" lg="5" class="border">
                <div class="text-white bg-secondary ps-2">text-white</div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </Card>
</template>
