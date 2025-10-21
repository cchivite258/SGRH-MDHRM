<script lang="ts" setup>
import { Img1, Img2, Img3, Img4 } from "@/assets/images/small/utils";
</script>
<template>
  <v-row>
    <v-col cols="12" sm="6" lg="3">
      <v-card>
        <v-img :src="Img1" alt="Card image cap" height="260" />
        <v-card-title> Web Developer </v-card-title>
        <v-card-text>
          <p>
            At missed advice my it no sister. Miss told ham dull knew see she
            spot near can. Spirit her entire her called.
          </p>
        </v-card-text>
        <v-card-actions class="d-flex justify-end">
          <v-btn variant="elevated" color="primary"> Submit </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <v-card>
        <v-img :src="Img2" alt="Card image cap" height="260" />
        <v-card-title> How apps is changing the IT world </v-card-title>
        <v-card-text>
          <p>
            Whether article spirits new her covered hastily sitting her. Money
            witty books nor son add. Chicken age had evening believe but proceed
            pretend mrs.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn color="secondary">
            Read More <i class="ph-caret-right" />
          </v-btn>
          <v-btn color="success"> Bookmark <i class="ph-bookmark" /> </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <v-card>
        <v-img :src="Img3" alt="Card image cap" height="260" />
        <v-card-text>
          <p>
            Whether article spirits new her covered hastily sitting her. Money
            witty books nor son add. Chicken age had evening believe but proceed
            pretend mrs.
          </p>
        </v-card-text>
        <div class="ps-3">An item</div>
        <v-divider class="my-2" />
        <div class="ps-3">An item</div>
        <v-divider class="my-2" />
        <div class="ps-3">An item</div>
      </v-card>
    </v-col>
    <v-col cols="12" sm="6" lg="3">
      <v-card>
        <v-card-title>
          <div class="text-subtitle-1 font-weight-bold">
            What planning process needs ?
          </div>
          <div class="text-muted font-weight-bold">Development</div>
        </v-card-title>
        <v-img :src="Img4" alt="Card image cap" height="260" />
        <v-card-text>
          <p>
            Objectively pursue diverse catalysts for change for interoperable
            meta-services. Distinctively re-engineer revolutionary
            meta-services.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-btn color="secondary">
            Read More <i class="ph-caret-right" />
          </v-btn>
          <v-btn color="success"> Bookmark <i class="ph-bookmark" /> </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
