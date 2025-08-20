<script lang="ts" setup>
import { socialMedias, employeeCard } from "@/components/ui/cards/utils";
</script>
<template>
  <div class="font-weight-bold text-subtitle-1 text-decoration-underline my-6">
    Using Grid Markup
  </div>
  <v-row>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">
            Hi, Erica Kernan
          </span>
          <v-btn icon="ph-x" density="comfortable" variant="plain" />
        </v-card-title>
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            How to get creative in your work ?
          </div>
          <p class="text-muted">
            A business consulting agency is involved in the planning,
            implementation, and education of businesses. Miss told ham dull knew
            see she spot near can. Spirit her entire her called.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-space-between">
          <span class="text-muted"> 1 day Ago </span>
          <v-btn color="success"
            >Read More <i class="ph-caret-right ms-1" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">
            Invoice#45155468
          </span>
          <v-btn icon="ph-x" density="comfortable" variant="plain" />
        </v-card-title>
        <v-card-text>
          <div class="text-subtitle-1 font-weight-bold">
            What planning process needs ?
          </div>
          <p class="text-muted">
            Intrinsically incubate intuitive opportunities and real-time
            potentialities for change for interoperable meta-services itself or
            distract the viewer's attention from the layout.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-space-between">
          <span class="text-muted"> 5 days left </span>
          <v-btn color="success"
            >Payment Now <i class="ph-caret-right ms-1" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <span class="text-subtitle-1 font-weight-bold">
            Creative Agency Quote
          </span>
          <v-btn icon="ph-x" density="comfortable" variant="plain" />
        </v-card-title>
        <v-card-text class="pb-0">
          <p class="text-muted">
            There are many variations of passages of Lorem Ipsum available.
          </p>
          <v-alert border variant="text" class="mt-4">
            "A business consulting agency is involved in the planning,
            implementation, and education of businesses."
          </v-alert>
        </v-card-text>
        <v-card-actions class="d-flex justify-end mt-0">
          <span class="text-muted">- Creative Agency</span
          ><i class="ms-2 text-primary font-weight-bold"> Alice melior </i>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-title>
          <span class="text-subtitle-1 font-weight-bold">
            <i class="bx bxs-user text-muted bx-xs me-1" /> Natasha Carey
          </span>
        </v-card-title>
        <v-card-text class="pb-0">
          <p class="text-muted">
            Too much or too little spacing, as in the example below, can make
            things unpleasant for the reader. The goal is to make your text as
            comfortable to read as possible.
          </p>
          <p class="text-muted mt-2">
            This response is important for our ability to learn from mistakes,
            but it alsogives rise to self-criticism.
          </p>
        </v-card-text>
        <v-divider class="mt-3" />
        <v-card-actions class="d-flex justify-center">
          View All Notification (2) <i class="ph-caret-right ms-1" />
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <div>
            <div class="text-subtitle-1 font-weight-bold">
              Give your text a good structure
            </div>
            <div class="text-muted">Fantastic Design</div>
          </div>
          <span> Overview </span>
        </v-card-title>
        <v-card-text>
          <p class="text-muted">
            Contrary to popular belief, you don’t have to work endless nights
            and hours to create a
            <span class="text-decoration-underline text-primary"
              ><b>Fantastic Design</b></span
            >
            by using complicated 3D elements. Flat design is your friend.
            Remember that. And the great thing about flat design is that it has
            become more and more popular over the years.
          </p>
          <p class="text-muted mt-2">
            In some designs, you might adjust your tracking to create a certain
            artistic effect.
          </p>
        </v-card-text>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <div>
            <div class="text-subtitle-1 font-weight-bold d-flex align-center">
              <i class="ph-gift ph-lg me-2" /> You've made it!
            </div>
            <div class="text-muted">Fantastic Design</div>
          </div>
          <span> Overview </span>
        </v-card-title>
        <v-card-text>
          <p class="text-muted">
            After gathering lots of different opinions and graphic design
            basics, I came up with a list of 30 graphic design tips that you can
            start implementing. Each design is a new, unique piece of art
            birthed into this world.
          </p>
          <p class="text-muted mt-2">
            Art party locavore wolf cliche high life echo park Austin.
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-end">
          <v-btn color="success"> <i class="ph-x me-1" /> Close </v-btn>
          <v-btn color="primary" variant="elevated" density="compact">
            Read More
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col
      cols="12"
      lg="4"
      v-for="(item, index) in employeeCard"
      :key="'employeeCard-' + index"
    >
      <v-card>
        <v-card-title class="d-flex justify-space-between">
          <div>
            <div class="text-subtitle-1 font-weight-bold">Employee Card</div>
            <div class="text-muted">Fantastic Design</div>
          </div>
          <v-btn icon="ph-x" variant="plain" />
        </v-card-title>
        <v-card-text class="text-center">
          <v-avatar :image="item.src" size="70" />
          <div class="text-subtitle-1 font-weight-bold mt-5 mb-1">
            {{ item.name }}
          </div>
          <div class="text-muted">{{ item.post }}</div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="d-flex justify-center">
          <i
            v-for="(icon, i) in socialMedias"
            :key="'socialMedias'"
            :class="icon.icon + ' ph-lg mx-1 text-' + icon.color"
          ></i>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>
