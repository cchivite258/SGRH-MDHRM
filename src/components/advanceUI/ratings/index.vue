<script lang="ts" setup></script>
<template>
  <v-row>
    <v-col cols="12" lg="3">
      <Card title="Default Rating">
        <v-card-text>
          <v-rating :model-value="3" active-color="warning" />
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="3">
      <Card title="Density">
        <v-card-text>
          <div>
            <div>For <code>density="comfortable"</code></div>
            <v-rating
              density="comfortable"
              :model-value="3"
              active-color="warning"
            />
          </div>
          <div>
            <div>For <code>density="compact"</code></div>
            <v-rating
              density="compact"
              :model-value="3"
              active-color="warning"
            />
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="3">
      <Card title="Clearable">
        <v-card-text>
          <div>
            <div>Add prop <code>clearable</code></div>
            <v-rating
              density="comfortable"
              clearable
              :model-value="3"
              active-color="warning"
            />
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="3">
      <Card title="Readonly">
        <v-card-text>
          <div>
            <div>Add prop <code>readonly</code></div>
            <v-rating
              density="comfortable"
              readonly
              :model-value="3"
              active-color="warning"
            />
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="3">
      <Card title="Labels">
        <v-card-text>
          <div>
            <v-rating
              density="comfortable"
              readonly
              :model-value="3"
              active-color="warning"
              :item-labels="['sad', '', '', '', 'happy']"
              item-label-position="top"
            />
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="3">
      <Card title="Half increments">
        <v-card-text>
          <div>Add prop <code>half-increments </code></div>
          <div>
            <v-rating
              density="comfortable"
              :model-value="3.5"
              active-color="warning"
              half-increments
              hover
            />
          </div>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
