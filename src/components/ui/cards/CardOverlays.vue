<script lang="ts" setup>
import {
  Img1,
  Img5,
  Img6,
  Img7,
  Img8,
  Img10,
  Img11,
  Img12,
} from "@/assets/images/small/utils";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="4">
      <v-card>
        <v-img
          :src="Img12"
          gradient="to bottom, rgba(55,98,234,.3), rgba(55,98,234,.5)"
        >
          <div class="d-flex flex-column h-100">
            <v-card-text class="text-white">
              <div class="text-subtitle-1 font-weight-bold">
                Design your apps in your own way
              </div>
              <p class="pt-3">
                Each design is a new, unique piece of art birthed into this
                world, and while you have the opportunity to be creative and
                make your unpleasant for the reader.
              </p>
              <p class="pt-3">Last updated 3 mins ago</p>
            </v-card-text>
            <v-divider class="text-white" />

            <v-card-actions class="mt-auto d-flex justify-center text-white">
              Read More <i class="ph-caret-right ms-1" />
            </v-card-actions>
          </div>
        </v-img>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-img
          :src="Img1"
          gradient="to bottom, rgba(55,98,234,.3), rgba(55,98,234,.5)"
        >
          <v-card-text class="text-white">
            <div class="text-subtitle-1 font-weight-bold">
              Design your apps in your own way
            </div>
            <p class="pt-3">
              Each design is a new, unique piece of art birthed into this world,
              and while you have the opportunity to be creative and make your
              unpleasant for the reader.
            </p>
            <p class="pt-3">Last updated 3 mins ago</p>
          </v-card-text>
        </v-img>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card class="text-white">
        <v-img
          :src="Img5"
          gradient="to bottom, rgba(55,98,234,.3), rgba(55,98,234,.5)"
        >
          <div class="h-100 d-flex flex-column">
            <v-card-text class="justify-end d-flex">
              <div class="mt-auto">
                <p class="pt-3">
                  Each design is a new, unique piece of art birthed into this
                  world, and while you have the opportunity to be creative and
                  make your unpleasant for the reader.
                </p>
                <p class="pt-3">Last updated 3 mins ago</p>
              </div>
            </v-card-text>
            <v-divider />
            <v-card-actions>
              <div class="text-subtitle-1 font-weight-bold">
                Design your apps in your own way
              </div>
            </v-card-actions>
          </div>
        </v-img>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-img :src="Img6" />
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            A day in the of a professional fashion designer
          </div>

          <p class="mt-1 text-muted">
            Exercitation +1 labore velit, blog sartorial PBR leggings next level
            wes anderson artisan four loko farm-to-table craft beer twee.
            commodo enim craft beer mlkshk aliquip jean shorts ullamco.
          </p>
          <p class="mt-3">Last updated 3 mins ago</p>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            A day in the of a professional fashion designer
          </div>

          <p class="mt-1 text-muted">
            Exercitation +1 labore velit, blog sartorial PBR leggings next level
            wes anderson artisan four loko farm-to-table craft beer twee.
            commodo enim craft beer mlkshk aliquip jean shorts ullamco.
          </p>
          <p class="mt-3">Last updated 3 mins ago</p>
        </v-card-text>
        <v-img :src="Img7" />
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            A day in the of a professional fashion designer
          </div>

          <p class="mt-1 text-muted">
            Exercitation +1 labore velit, blog sartorial PBR leggings next level
            wes anderson artisan four loko farm-to-table craft beer twee.
          </p>
        </v-card-text>
        <v-img :src="Img8" />
        <p class="my-4 ms-3">Last updated 3 mins ago</p>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            A day in the of a professional fashion designer
          </div>

          <p class="mt-1 text-muted">
            Exercitation +1 labore velit, blog sartorial PBR leggings next level
            wes anderson artisan four loko farm-to-table craft beer twee.
          </p>
        </v-card-text>
        <v-img :src="Img10" />
        <p class="my-4 ms-3">Last updated 3 mins ago</p>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-img :src="Img11" />

        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            A day in the of a professional fashion designer
          </div>

          <p class="mt-1 text-muted">
            Exercitation +1 labore velit, blog sartorial PBR leggings next level
            wes anderson artisan four loko farm-to-table craft beer twee.
          </p>
        </v-card-text>
        <v-divider />
        <p class="my-4 ms-3">Last updated 3 mins ago</p>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            A day in the of a professional fashion designer
          </div>

          <p class="mt-1 text-muted">
            Exercitation +1 labore velit, blog sartorial PBR leggings next level
            wes anderson artisan four loko farm-to-table craft beer twee.
          </p>
        </v-card-text>
        <p class="my-4 ms-3">Last updated 3 mins ago</p>

        <v-img :src="Img11" />
      </v-card>
    </v-col>
  </v-row>
</template>
