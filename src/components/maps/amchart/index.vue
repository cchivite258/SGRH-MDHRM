<script type="ts" setup>
import Basic from "@/components/maps/amchart/Basic.vue"
import Mapline from "@/components/maps/amchart/Mapline.vue"
import Pacific from "@/components/maps/amchart/Pacific.vue"
</script>

<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Basic map">
        <v-card-text>
          <Basic />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Line With Point">
        <v-card-text>
          <Mapline />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Pacific Map">
        <v-card-text>
          <Pacific />
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
