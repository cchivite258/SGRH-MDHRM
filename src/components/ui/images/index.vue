<script lang="ts" setup>
import {
  Avatar1,
  Avatar2,
  Avatar3,
  Avatar4,
  Avatar5,
  Avatar10,
} from "@/assets/images/users/utils";
import { Img3, Img4 } from "@/assets/images/small/utils";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Image Rounded & Circle">
        <v-card-text>
          <div class="text-muted">
            In <code> v-avatar </code> component add <code>image</code> prop
            with the image src. To add border radius to avatar add
            <code> rounded </code> prop.
          </div>
          <v-row class="mt-4 align-center">
            <v-col lg="6">
              <div class="mb-1">With <code>rounded</code> prop.</div>
              <v-avatar size="150" rounded :image="Img4" />
            </v-col>
            <v-col lg="6">
              <div class="mb-1">Without <code>rounded</code> prop.</div>

              <v-avatar size="150" :image="Avatar4" />
            </v-col>
          </v-row>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Image Border">
        <v-card-text>
          <div class="text-muted">
            Add <code>border pa-1</code> class to the
            <code> v-avatar </code> component.
          </div>
          <v-row class="mt-4 align-center">
            <v-col lg="6">
              <v-avatar rounded size="160" class="border pa-1" :image="Img3" />
            </v-col>
            <v-col lg="6">
              <v-avatar size="160" class="pa-1 border">
                <v-img :src="Avatar3" class="ma-1" style="border-radius: 50%" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
  <Card title="Image Sizes" class="mt-4">
    <v-card-text>
      It is having prop name called <code> size</code>. Sets the height and
      width of the component. Default unit is px. Can also use the following
      predefined sizes: <b>x-small</b>, <b>small</b>, <b>default</b>,
      <b>large</b>, and <b> x-large</b>.
      <div class="d-flex mt-8 flex-wrap">
        <span class="me-8">
          <div class="text-muted mb-1">
            for <code>rounded size="x-small"</code>
          </div>
          <v-avatar rounded class="me-3" size="x-small" :image="Avatar2" />
        </span>
        <span class="me-8">
          <div class="text-muted mb-1">
            for <code>rounded size="small"</code>
          </div>
          <v-avatar rounded class="me-3" size="small" :image="Avatar10" />
        </span>
        <span class="me-8">
          <div class="text-muted mb-1">
            for <code>rounded size="default"</code>
          </div>
          <v-avatar rounded class="me-3" size="default" :image="Avatar3" />
        </span>
        <span class="me-8">
          <div class="text-muted mb-1">
            for <code>rounded size="large"</code>
          </div>
          <v-avatar rounded class="me-3" size="large" :image="Avatar4" />
        </span>
        <span class="me-8">
          <div class="text-muted mb-1">
            for <code>rounded size="x-large"</code>
          </div>
          <v-avatar rounded class="me-3" size="x-large" :image="Avatar5" />
        </span>
      </div>

      <div class="mt-5 d-flex flex-wrap">
        <span class="me-8">
          <div class="text-muted mb-1">for <code>size="x-small"</code></div>
          <v-avatar class="me-3" size="x-small" :image="Avatar2" />
        </span>
        <span class="me-8">
          <div class="text-muted mb-1">for <code>size="small"</code></div>
          <v-avatar class="me-3" size="small" :image="Avatar10" />
        </span>
        <span class="me-8">
          <div class="text-muted mb-1">for <code>size="default"</code></div>
          <v-avatar class="me-3" size="default" :image="Avatar3" />
        </span>
        <span class="me-8">
          <div class="text-muted mb-1">for <code>size="large"</code></div>
          <v-avatar class="me-3" size="large" :image="Avatar4" />
        </span>
        <span class="me-8">
          <div class="text-muted mb-1">for <code>size="x-large"</code></div>
          <v-avatar class="me-3" size="x-large" :image="Avatar5" />
        </span>
      </div>
    </v-card-text>
  </Card>

  <Card title="Avatar with content and color" class="mt-4">
    <v-card-text>
      <div class="d-flex align-center">
        <span class="me-8">
          <v-avatar class="me-3" size="x-small" variant="tonal" color="primary">
            xs
          </v-avatar>
        </span>
        <span class="me-8">
          <v-avatar class="me-3" size="small" variant="tonal" color="secondary">
            sm
          </v-avatar>
        </span>

        <span class="me-8">
          <v-avatar class="me-3" size="large" variant="tonal" color="info">
            lg
          </v-avatar>
        </span>
        <span class="me-8">
          <v-avatar class="me-3" size="x-large" variant="tonal" color="danger">
            xl
          </v-avatar>
        </span>
      </div>
    </v-card-text>
  </Card>

  <Card title="Avatar Group" class="mt-4">
    <v-card-text>
      <v-row>
        <v-col cols="12" lg="6">
          <div class="text-muted mb-4">
            Add <code>avatar-group-item</code> class for the group of avatar.
          </div>
          <div class="position-relative">
            <v-avatar size="60" class="avatar-group-item">
              <v-img :src="Avatar1" />
            </v-avatar>
            <v-avatar size="60" class="avatar-group-item">
              <v-img :src="Avatar2" />
            </v-avatar>
            <v-avatar size="60" class="avatar-group-item">
              <v-img :src="Avatar3" />
            </v-avatar>
            <v-avatar size="60" class="avatar-group-item">
              <v-img :src="Avatar4" />
            </v-avatar>
          </div>
        </v-col>

        <v-col cols="12" lg="6">
          <div class="text-muted mb-4">
            Wrap the <code>v-avatar</code> by v-tooltip and bine the props.
          </div>
          <div class="position-relative">
            <v-tooltip location="top" text="Avatar 1">
              <template v-slot:activator="{ props }">
                <v-avatar v-bind="props" size="60" class="avatar-group-item">
                  <v-img :src="Avatar1" />
                </v-avatar>
              </template>
            </v-tooltip>
            <v-tooltip location="top" text="Avatar 2">
              <template v-slot:activator="{ props }">
                <v-avatar v-bind="props" size="60" class="avatar-group-item">
                  <v-img :src="Avatar2" />
                </v-avatar>
              </template>
            </v-tooltip>
            <v-tooltip location="top" text="Avatar 3">
              <template v-slot:activator="{ props }">
                <v-avatar v-bind="props" size="60" class="avatar-group-item">
                  <v-img :src="Avatar3" />
                </v-avatar>
              </template>
            </v-tooltip>
            <v-tooltip location="top" text="Avatar 4">
              <template v-slot:activator="{ props }">
                <v-avatar v-bind="props" size="60" class="avatar-group-item">
                  <v-img :src="Avatar4" />
                </v-avatar>
              </template>
            </v-tooltip>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </Card>
</template>
