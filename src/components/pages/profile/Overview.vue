<script lang="ts" setup>
import { qualifications } from "@/components/pages/profile/utils";
import { DIR } from "@/app/const";
import { useLayoutStore } from "@/store/app";
import { computed } from "vue";
const state = useLayoutStore();

const isRtl = computed(() => {
  return state.dir === DIR.RTL;
});
const languages = ["English", "French", "German", "Arabic", "Italian"];
const skills = [
  "Photoshop",
  "Illustrator",
  "HTML",
  "CSS",
  "Javascript",
  "php",
  "Python",
];
</script>
<template>
  <Card title="Media" title-class="py-4">
    <v-card-text>
      <v-row :no-gutters="$vuetify.display.lgAndUp">
        <v-col cols="12" lg="3" class="pe-4">
          <v-img
            cover
            src="@/assets/images/small/img-2.jpg"
            alt=""
            class="h-100 rounded"
          />
        </v-col>
        <v-col cols="12" lg="4" class="pe-4">
          <v-row :no-gutters="$vuetify.display.lgAndUp">
            <v-col lg="12" class="pb-2">
              <v-img
                src="@/assets/images/learning/img-01.jpg"
                alt=""
                class="h-100 rounded"
              />
            </v-col>
            <v-col cols="12" lg="6" class="pt-lg-2 pe-lg-2">
              <v-img
                src="@/assets/images/small/img-4.jpg"
                alt=""
                class="rounded"
              />
            </v-col>
            <v-col cols="12" lg="6" class="pt-2 ps-2">
              <v-img
                src="@/assets/images/real-estate/img-03.jpg"
                alt=""
                class="rounded"
              />
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="12" lg="3" class="pe-4">
          <v-img
            src="@/assets/images/real-estate/overview-03.jpg"
            alt=""
            cover
            class="h-100 rounded"
          />
        </v-col>
        <v-col lg="2">
          <v-row class="h-100" :no-gutters="$vuetify.display.lgAndUp">
            <v-col cols="12" lg="12" class="pb-md-2">
              <v-img
                src="@/assets/images/small/img-10.jpg"
                alt=""
                cover
                class="h-100 rounded"
              />
            </v-col>
            <v-col cols="12" lg="12" class="pt-md-2">
              <v-img
                src="@/assets/images/small/img-7.jpg"
                alt=""
                cover
                class="h-100 rounded"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card-text>

    <Card title="About Us" elevation="0">
      <v-card-text>
        <p class="text-muted mb-2">
          A <b>Web Developer</b> creates and designs different websites for
          clients. They are responsible for their aesthetic as well as their
          function. Professionals in this field may also need to be able to
          ensure sites are compatible with multiple types of media. Web
          Developers need to have a firm understanding of programming and
          graphical design. Having a strong resume that emphasizes these
          attributes makes it significantly easier to get hired as a Web
          Developer.
        </p>
        <p class="text-muted mb-0">
          As a web designer, my objective is to make a positive impact on
          clients, co-workers, and the Internet using my skills and experience
          to design compelling and attractive websites. Solving code problems.
          Editing & Design with designing team in the company to build perfect
          web designs.
        </p>
      </v-card-text>
    </Card>
    <v-row>
      <v-col cols="12" lg="6">
        <Card elevation="0" title="Languages">
          <v-card-text>
            <div class="d-flex">
              <v-chip
                color="primary"
                label
                density="compact"
                class="me-2"
                v-for="item in languages"
                :key="'language-' + item"
              >
                <span class="status-chip">
                  {{ item }}
                </span>
              </v-chip>
            </div>
          </v-card-text>
        </Card>
      </v-col>
      <v-col cols="12" lg="6">
        <Card title="Skills & Knowledge">
          <v-card-text>
            <div class="d-flex">
              <v-chip
                color="secondary"
                label
                density="compact"
                class="me-2 font-weight-medium"
                v-for="item in skills"
                :key="'skill-' + item"
              >
                <span class="status-chip">
                  {{ item }}
                </span>
              </v-chip>
            </div>
          </v-card-text>
        </Card>
      </v-col>
    </v-row>
    <Card title="Education Qualification">
      <v-card-text>
        <v-timeline
          truncate-line="both"
          :side="isRtl ? 'start' : 'end'"
        >
          <v-timeline-item
            v-for="(item, i) in qualifications"
            :key="'qualification-' + i"
            dot-color="primary"
            size="small"
          >
            <div class="font-weight-bold text-subtitle-2">{{ item.title }}</div>
            <div>
              <span class="me-3">
                <i class="ph-calendar-blank" /> {{ item.date }}</span
              >
              <span>
                <i class="bx bx-buildings"></i> {{ item.university }}
              </span>
            </div>
            <div class="text-muted mt-2">{{ item.description }}</div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </Card>
  </Card>
</template>
