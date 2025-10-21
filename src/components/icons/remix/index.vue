<script type="ts" setup>
import {remixIcons} from '@/components/icons/remix/utils'
</script>

<template>
  <v-row>
    <v-col cols="12" v-for="(value, key) in remixIcons" :key="'icon-' + key">
      <Card :title="key">
        <v-card-text>
          <p class="mb-4">
            Use <code>{{`<i class="ri- bold"></i>`}}</code>
            <span class="badge badge-success">v 2.4.1</span>.
          </p>
          <v-row class="text-muted">
            <v-col
              cols="12"
              sm="6"
              lg="3"
              v-for="(item, key2) in remixIcons[key]"
              class="ri-icon-wrapper py-4"
            >
              <div class="d-flex align-center">
                <i
                  :class="`ri-${key2}${key === 'Editor' ? '-fill' : '-line'}`"
                  class="ri-icons me-3"
                />
                <span>{{
                  `ri-${key2}${key === "Editor" ? "-fill" : "-line"}`
                }}</span>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
