<script lang="ts" setup>
import { Img9, Img2, Img4, Img12 } from "@/assets/images/small/utils";
</script>
<template>
  <div class="font-weight-bold text-subtitle-1 text-decoration-underline my-4">
    Horizontal Card
  </div>
  <v-row>
    <v-col cols="12" lg="6">
      <v-card>
        <v-row no-gutters>
          <v-col cols="12" md="4">
            <v-img :src="Img12" />
          </v-col>
          <v-col cols="12" md="8">
            <v-card-text>
              <div class="text-subtitle-2 font-weight-bold">
                Give your text a good structure
              </div>
              <p class="my-3">
                For that very reason, I went on a quest and spoke to many
                different professional graphic designers and asked them what
                graphic design tips they live.
              </p>
              <p class="text-muted">Last updated 3 mins ago</p>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="12" lg="6">
      <v-card>
        <v-row no-gutters>
          <v-col cols="12" md="8">
            <v-card-text>
              <div class="text-subtitle-2 font-weight-bold">
                Manage white space in responsive layouts ?
              </div>
              <p class="my-3">
                For that very reason, I went on a quest and spoke to many
                different professional graphic designers and asked them what
                graphic design tips they live.
              </p>
              <p class="text-muted">Last updated 3 mins ago</p>
            </v-card-text>
          </v-col>
          <v-col cols="12" md="4">
            <v-img :src="Img4" />
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="12" lg="6">
      <v-card>
        <v-row no-gutters>
          <v-col cols="12" md="4">
            <v-img :src="Img9" />
          </v-col>
          <v-col cols="12" md="8">
            <v-card-text>
              <div class="text-subtitle-2 font-weight-bold">
                Give your text a good structure
              </div>
              <p class="my-3 text-muted">
                For that very reason, I went on a quest and spoke to many
                different professional graphic designers and asked them what
                graphic design tips they live.
              </p>
            </v-card-text>
            <v-divider />
            <v-card-actions>
              <p class="text-muted">Last updated 3 mins ago</p>
            </v-card-actions>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="12" lg="6">
      <v-card>
        <v-row no-gutters>
          <v-col cols="12" md="8">
            <v-card-text>
              <div class="text-subtitle-2 font-weight-bold">
                Manage white space in responsive layouts ?
              </div>
              <p class="my-3">
                For that very reason, I went on a quest and spoke to many
                different professional graphic designers and asked them what
                graphic design tips they live.
              </p>
            </v-card-text>
            <v-divider />
            <v-card-actions>
              <p class="text-muted">Last updated 3 mins ago</p>
            </v-card-actions>
          </v-col>
          <v-col cols="12" md="4">
            <v-img :src="Img2" />
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>
