<script lang="ts" setup>
import { colors } from "@/components/ui/utils";
</script>
<template>
  <div class="text-muted">
    In its simplest form, <code>v-progress-linear</code> displays a horizontal
    progress bar. Use the <code><b>value</b></code> prop to control the progress
    and The <code>v-progress-circular</code> component is used to convey data
    circularly to users. It also can be put into an indeterminate state to
    portray loading.
  </div>

  <v-row class="mt-4">
    <v-col cols="12" lg="6">
      <Card title="Progress linear" class="h-100">
        <v-card-text>
          <div v-for="color in colors" :key="color.value" class="my-5">
            <v-progress-linear
              model-value="20"
              :color="color.value"
            ></v-progress-linear>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Progress circular" class="h-100">
        <v-card-text class="mt-4">
          <div class="d-flex align-center">
            <div v-for="color in colors" :key="color.value" class="mx-5">
              <v-progress-circular
                model-value="20"
                :color="color.value"
              ></v-progress-circular>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Progress linear indeterminate" class="h-100">
        <v-card-text>
          <div>Add <code>indeterminate</code> prop.</div>
          <div v-for="color in colors" :key="color.value" class="my-5">
            <v-progress-linear
              model-value="20"
              :color="color.value"
              indeterminate
            ></v-progress-linear>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Progress circular indeterminate" class="h-100">
        <v-card-text>
          <div>Add <code>indeterminate</code> prop.</div>
          <div class="d-flex mt-4">
            <div v-for="color in colors" :key="color.value" class="mx-5">
              <v-progress-circular
                model-value="20"
                :color="color.value"
                indeterminate
              ></v-progress-circular>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Progress linear reversed" class="h-100">
        <v-card-text>
          <div>Add <code>reverse</code> prop.</div>

          <div v-for="color in colors" :key="color.value" class="my-5">
            <v-progress-linear
              model-value="20"
              reverse
              indeterminate
              :color="color.value"
            ></v-progress-linear>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Progress Circular sizes and width" class="h-100">
        <v-card-text>
          <div>
            Add <code>size</code> prop to manage size of loader. Add
            <code>width</code> prop to manage width of loader.
          </div>

          <div class="d-flex mt-4">
            <div v-for="color in colors" :key="color.value" class="mx-5">
              <v-progress-circular
                model-value="20"
                :color="color.value"
                :size="50"
              ></v-progress-circular>
            </div>
          </div>

          <div class="d-flex mt-5">
            <div v-for="color in colors" :key="color.value" class="mx-5">
              <v-progress-circular
                model-value="20"
                :color="color.value"
                :size="20"
              ></v-progress-circular>
            </div>
          </div>
          <div class="d-flex mt-5">
            <div v-for="color in colors" :key="color.value" class="mx-5">
              <v-progress-circular
                model-value="20"
                :color="color.value"
                :size="40"
                :width="10"
              ></v-progress-circular>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Progress linear stream" class="h-100">
        <v-card-text>
          <div>Add <code>stream</code> prop.</div>

          <div v-for="color in colors" :key="color.value" class="my-5">
            <v-progress-linear
              model-value="20"
              buffer-value="0"
              stream
              :color="color.value"
            ></v-progress-linear>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Progress linear striped" class="h-100">
        <v-card-text>
          <div>Add <code>striped</code> prop.</div>

          <div v-for="color in colors" :key="color.value" class="my-5">
            <v-progress-linear
              model-value="20"
              height="10"
              striped
              :color="color.value"
            ></v-progress-linear>
          </div>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
