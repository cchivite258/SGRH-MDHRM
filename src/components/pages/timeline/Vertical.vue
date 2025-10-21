<script lang="ts" setup>
import { DIR } from "@/app/const";
import { Img3, Img5, Img7, Img9 } from "@/assets/images/small/utils";
import { useLayoutStore } from "@/store/app";
import { computed } from "vue";
const state = useLayoutStore();

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});
const uploads = [Img3, Img5, Img7, Img9];
</script>
<template>
  <Card title="Vertical Timeline">
    <v-card-text>
      <v-timeline truncate-line="both" :side="isRtl ? 'start' : 'end'">
        <v-timeline-item dot-color="primary" size="small">
          <div>
            <div class="font-weight-bold text-subtitle-2">
              Purchase by James Price
            </div>
            <div>09:24 PM</div>
            <div class="mt-2">Product noise evolve smartwatch</div>
          </div>
        </v-timeline-item>
        <v-timeline-item dot-color="primary" size="small">
          <div>
            <div class="font-weight-bold text-subtitle-2">
              New ticket received
              <v-chip
                color="info"
                density="compact"
                variant="elevated"
                elevation="0"
                label
              >
                New
              </v-chip>
            </div>
            <div>4 days ago</div>
            <div class="mt-2 text-muted">
              User <b>Erica245</b> submitted a ticket
            </div>
          </div>
        </v-timeline-item>
        <v-timeline-item dot-color="primary" size="small">
          <div>
            <div class="font-weight-bold text-subtitle-2">
              Adding a new event with attachments
            </div>
            <div>30 days ago</div>
            <div class="mt-2 dashed-border w-100">
              <div class="d-flex">
                <div class="d-flex pa-3">
                  <i class="ph-file-image text-danger ph-lg me-3 mt-1" />
                  <div>
                    <div class="font-weight-bold text-subtitle-2">
                      UI/UX design
                    </div>
                    <div>685 kb</div>
                  </div>
                </div>
                <div class="d-flex pa-3">
                  <i class="ph-file-pdf text-info ph-lg me-3 mt-1" />
                  <div>
                    <div class="font-weight-bold text-subtitle-2">
                      Steex Invoice
                    </div>
                    <div>342 kb</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-timeline-item>

        <v-timeline-item dot-color="primary" size="small">
          <div>
            <div class="font-weight-bold text-subtitle-2">
              Templates layout upload
            </div>
            <div>1 week ago</div>
            <div class="mt-1 text-muted">
              Powerful, clean & modern responsive bootstrap 5 admin template.
              The maximum file size for uploads in this demo :
            </div>
            <div class="dashed-border d-flex pa-3 mt-3">
              <v-img
                v-for="(upload, i) in uploads"
                :key="'img-' + i"
                :src="upload"
                class="me-2"
                max-width="70px"
                max-height="90px"
                cover
              />
            </div>
          </div>
        </v-timeline-item>
        <v-timeline-item dot-color="primary" size="small">
          <div>
            <div class="font-weight-bold text-subtitle-2">04:24 PM</div>
            <div class="mt-1 text-muted">
              he only time I don't feel sleepy cause it's work out time. I mean
              walking time. 😹
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </Card>
</template>
