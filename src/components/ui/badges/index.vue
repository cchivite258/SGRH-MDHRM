<script lang="ts" setup>
import { colors } from "@/components/ui/utils";
</script>
<template>
  <v-row>
    <v-col cols="12" lg="6">
      <Card title="Default Badges" class="h-100">
        <v-card-text>
          <div class="text-muted mb-4">
            <div>
              For default badge wrap it with {{"<v-badge></v-badge>"}}
              component, as per below:
            </div>
            <div class="text-danger mt-1">
              {{ `<v-badge> Icon or text here</v-badge>` }}
            </div>
          </div>
          <div class="d-flex">
            <div
              v-for="(item, index) in colors"
              :key="'default-alert-' + index"
              class="me-5"
            >
              <v-badge :color="item.value">
                <i class="bx bxl-vuejs bx-md"></i>
              </v-badge>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Dot Badges" class="h-100">
        <v-card-text>
          <div class="text-muted mb-5">
            <div>For making badge small you can use <b>dot</b> prop.</div>
            <div class="text-danger mt-1">
              {{ `<v-badge dot> Icon or text here</v-badge>` }}
            </div>
          </div>

          <div class="d-flex">
            <div
              v-for="(item, index) in colors"
              :key="'default-alert-' + index"
              class="me-5"
            >
              <v-badge :color="item.value" dot>
                <i class="bx bxl-vuejs bx-md"></i>
              </v-badge>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Floating Badges" class="h-100">
        <v-card-text>
          <div class="text-muted mt-4 mb-4">
            <div>
              To Elevates the badge above the slotted content,
              <b>floating</b> prop is available.
            </div>
            <div class="text-danger mt-1">
              {{ `<v-badge floating> Icon or text here</v-badge>` }}
            </div>
          </div>

          <div class="d-flex">
            <div
              v-for="(item, index) in colors"
              :key="'default-alert-' + index"
              class="me-5"
            >
              <v-badge :color="item.value" floating dot>
                <i class="bx bxl-vuejs bx-md"></i>
              </v-badge>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Inline Badges" class="h-100">
        <v-card-text>
          <div class="text-muted mb-4">
            <div>
              To Moves the badge to be inline with the wrapping element,
              <b>floating</b> prop is available.
            </div>
            <div class="text-danger mt-1">
              {{ `<v-badge inline> Icon or text here</v-badge>` }}
            </div>
          </div>
          <div class="d-flex">
            <div
              v-for="(item, index) in colors"
              :key="'default-alert-' + index"
              class="me-5"
            >
              <v-badge :color="item.value" inline>
                <i class="bx bxl-vuejs bx-md"></i>
              </v-badge>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>

    <v-col cols="12" lg="6">
      <Card title="Badge as Content" class="h-100">
        <v-card-text>
          <div class="text-muted mb-4">
            <div>
              To Moves the badge to be inline with the wrapping element,
              <b>floating</b> prop is available.
            </div>
            <div class="text-danger mt-1">
              {{ `<v-badge content="Content here"> Icon or text here</v-badge>`
              }}
            </div>
          </div>
          <div class="d-flex">
            <div
              v-for="(item, index) in colors"
              :key="'default-alert-' + index"
              class="me-2"
            >
              <v-badge :color="item.value" inline content="Vuetify badge" />
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12" lg="6">
      <Card title="Badges as Icon Content" class="h-100">
        <v-card-text>
          <div class="text-muted mb-4">
            <div>
              To Moves the badge to be inline with the wrapping element,
              <b>floating</b> prop is available.
            </div>
            <div class="text-danger mt-1">
              {{ `<v-badge content="Content here"> Icon or text here</v-badge>`
              }}
            </div>
          </div>
          <div class="d-flex">
            <div
              v-for="(item, index) in colors"
              :key="'default-alert-' + index"
              class="me-4"
            >
              <v-badge :color="item.value" content="2">
                <i class="bx bxl-vuejs bx-md"></i>
              </v-badge>
            </div>
          </div>
        </v-card-text>
      </Card>
    </v-col>
    <v-col cols="12">
      <Card title="Badges Positions">
        <v-card-text>
          <v-row>
            <v-col cols="12" lg="6">
              <div class="text-muted mb-2">
                <div class="text-danger mt-1">
                  {{ `<v-badge location="top left"> Icon or text here</v-badge>`
                  }}
                </div>
              </div>
              <div class="d-flex">
                <div
                  v-for="(item, index) in colors"
                  :key="'default-alert-' + index"
                  class="me-4"
                >
                  <v-badge :color="item.value" content="2" location="top left">
                    <i class="bx bxl-vuejs bx-md"></i>
                  </v-badge>
                </div>
              </div>
            </v-col>
            <v-col cols="12" lg="6">
              <div class="text-muted mb-2">
                <div class="text-danger mt-1">
                  {{ `<v-badge location="bottom left">Icon or text here</v-badge
                  >` }}
                </div>
              </div>
              <div class="d-flex">
                <div
                  v-for="(item, index) in colors"
                  :key="'default-alert-' + index"
                  class="me-4"
                >
                  <v-badge
                    :color="item.value"
                    content="2"
                    location="bottom left"
                  >
                    <i class="bx bxl-vuejs bx-md"></i>
                  </v-badge>
                </div>
              </div>
            </v-col>
            <v-col cols="12" lg="6">
              <div class="text-muted mb-2">
                <div class="text-danger mt-1">
                  {{ `<v-badge location="bottom right"
                    >Icon or text here</v-badge
                  >` }}
                </div>
              </div>
              <div class="d-flex">
                <div
                  v-for="(item, index) in colors"
                  :key="'default-alert-' + index"
                  class="me-4"
                >
                  <v-badge
                    :color="item.value"
                    content="2"
                    location="bottom right"
                  >
                    <i class="bx bxl-vuejs bx-md"></i>
                  </v-badge>
                </div>
              </div>
            </v-col>
            <v-col cols="12" lg="6">
              <div class="text-muted mb-2">
                <div class="text-danger mt-1">
                  {{ `<v-badge location="top right">Icon or text here</v-badge>`
                  }}
                </div>
              </div>
              <div class="d-flex">
                <div
                  v-for="(item, index) in colors"
                  :key="'default-alert-' + index"
                  class="me-4"
                >
                  <v-badge :color="item.value" content="2" location="top right">
                    <i class="bx bxl-vuejs bx-md"></i>
                  </v-badge>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </Card>
    </v-col>
  </v-row>
</template>
