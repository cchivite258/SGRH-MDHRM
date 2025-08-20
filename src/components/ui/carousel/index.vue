<script lang="ts" setup>
import {
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
  Img7,
  Img8,
  Img9,
  Img10,
  Img11,
  Img12,
} from "@/assets/images/small/utils";

const images = [
  Img1,
  Img2,
  Img3,
  Img4,
  Img5,
  Img6,
  Img7,
  Img8,
  Img9,
  Img10,
  Img11,
  Img12,
];
</script>
<template>
  <v-row>
    <v-col cols="12" md="6">
      <Card title="Slides Only">
        <v-card-text>
          <div class="text-muted mb-5">
            The <code>v-carousel</code> component is used to display large
            numbers of visual content on a rotating timer.
          </div>
          <v-carousel>
            <v-carousel-item
              v-for="image in images"
              :key="'image-' + images"
              :src="image"
              cover
            ></v-carousel-item>
          </v-carousel>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Hide delimiters">
        <v-card-text>
          <div class="text-muted mb-5">
            Add <code>hide-delimiters</code> prop to hide the delimiters.
          </div>
          <v-carousel hide-delimiters>
            <v-carousel-item
              v-for="image in images"
              :key="'image-' + images"
              :src="image"
              cover
            ></v-carousel-item>
          </v-carousel>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Cycle">
        <v-card-text>
          <div class="text-muted mb-5">
            Add <code>cycle</code> prop to auto rotate images.
          </div>
          <v-carousel cycle>
            <v-carousel-item
              v-for="image in images"
              :key="'image-' + images"
              :src="image"
              cover
            ></v-carousel-item>
          </v-carousel>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" md="6">
      <Card title="Hide Controls">
        <v-card-text>
          <div class="text-muted mb-5">
            Add <code>show-arrows=false</code> prop to hide all Controls.
          </div>
          <v-carousel cycle :show-arrows="false" hide-delimiters>
            <v-carousel-item
              v-for="image in images"
              :key="'image-' + images"
              :src="image"
              cover
            ></v-carousel-item>
          </v-carousel>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
