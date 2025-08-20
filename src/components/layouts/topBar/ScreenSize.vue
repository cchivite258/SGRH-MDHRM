<script lang="ts">
export default {
  methods: {
    initFullScreen() {
      // document.body.classList.toggle("fullscreen-enable")
      const element = document.querySelector(".fullscreen-icon");
      if (element) {
        if (element.classList.contains("ph-arrows-out")) {
          element.classList.remove("ph-arrows-out");
          element.classList.add("ph-corners-in");
        } else {
          element.classList.add("ph-arrows-out");
          element.classList.remove("ph-corners-in");
        }
      }
      if (
        !document.fullscreenElement 
        // &&
        // /* alternative standard method */
        // !document.mozFullScreenElement &&
        // !document.webkitFullscreenElement
      ) {
        // current working methods
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } 
        // else if (document.documentElement.mozRequestFullScreen) {
        //   document.documentElement.mozRequestFullScreen();
        // } else if (document.documentElement.webkitRequestFullscreen) {
        //   document.documentElement.webkitRequestFullscreen(
        //     Element.ALLOW_KEYBOARD_INPUT
        //   );
        // }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } 
        // else if (document.mozCancelFullScreen) {
        //   document.mozCancelFullScreen();
        // } else if (document.webkitCancelFullScreen) {
        //   document.webkitCancelFullScreen();
        // }
      }
    },
  },
};
</script>
<template>
  <div class="ms-1 header-item d-none d-sm-flex">
    <v-btn data-toggle="fullscreen" icon @click="initFullScreen" class="btn-ghost-dark">
      <i class="ph ph-arrows-out ph-2x fullscreen-icon"></i>
    </v-btn>
  </div>
</template>
