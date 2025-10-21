<script lang="ts" setup>
import { Img5, Img6, Img4, Img11, Img10 } from "@/assets/images/small/utils";
</script>
<template>
  <div class="font-weight-bold text-subtitle-1 text-decoration-underline my-4">
    Card Groups
  </div>
  <v-row no-gutters>
    <v-col cols="12" lg="4">
      <v-card class="h-100 position-relative">
        <v-img :src="Img4" />
        <div class="d-flex flex-column">
          <v-card-text>
            <div class="text-subtitle-1 font-weight-bold">
              A day in the of a professional fashion designer
            </div>
            <p class="mt-2">
              This is a longer card with supporting text below as a natural
              lead-in to additional content. This content is a little bit
              longer.
            </p>
          </v-card-text>
          <div style="position: absolute; bottom: 0; width: 100%">
            <v-divider />
            <v-card-actions>
              <p class="text-muted">Last updated 3 mins ago</p>
            </v-card-actions>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card class="h-100">
        <v-img :src="Img5" />
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            Manage white space in responsive layouts ?
          </div>
          <p class="mt-2">
            This card has supporting text below as a natural lead-in to
            additional content.
          </p>
        </v-card-text>
        <div style="position: absolute; bottom: 0; width: 100%">
          <v-divider />
          <v-card-actions>
            <p class="text-muted">Last updated 3 mins ago</p>
          </v-card-actions>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card class="h-100">
        <v-img :src="Img6" />
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            Give your text a good structure?
          </div>
          <p class="mt-2">
            This is a wider card with supporting text below as a natural lead-in
            to additional content. This card has even longer content than the
            first to show that equal height action.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <p class="text-muted">Last updated 3 mins ago</p>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <div class="font-weight-bold text-subtitle-1 text-decoration-underline my-4">
    Grid Card Groups
  </div>
  <v-row no-gutters>
    <v-col cols="12" lg="4">
      <v-card class="h-100 position-relative">
        <div class="text-subtitle-1 font-weight-bold pt-3 ps-4">
          A day in the of a professional fashion designer
        </div>
        <v-img :src="Img11" />
        <div class="d-flex flex-column">
          <v-card-text>
            <p class="mt-2">
              This may be the most commonly encountered tip I received from the
              designers I spoke with. They highly encourage that you use
              different fonts in one design, but do not over-exaggerate and go
              overboard.
            </p>
          </v-card-text>
          <div style="position: absolute; bottom: 0; width: 100%">
            <v-divider />
            <v-card-actions>
              <p class="text-muted">Last updated 3 mins ago</p>
            </v-card-actions>
          </div>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card class="h-100">
        <v-img :src="Img10" />
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            Give your text a good structure?
          </div>
          <p class="mt-2">
            This is a wider card with supporting text below as a natural lead-in
            to additional content. This card has even longer content than the
            first to show that equal height action.
          </p>
        </v-card-text>
        <div style="position: absolute; bottom: 0; width: 100%">
          <v-divider />
          <v-card-actions>
            <p class="text-muted">Last updated 3 mins ago</p>
          </v-card-actions>
        </div>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card class="h-100">
        <v-img :src="Img5" />
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            Manage white space in responsive layouts ?
          </div>
          <p class="mt-2">
            Exercitation +1 labore velit, blog sartorial PBR leggings next level
            wes anderson artisan four loko farm-to-table craft beer twee. ommodo
            enim craft beer mlkshk aliquip jean shorts ullamco.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <p class="text-muted">Last updated 3 mins ago</p>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
