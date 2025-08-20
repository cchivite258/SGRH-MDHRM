<script lang="ts" setup>
import Swal from "sweetalert2";

const showAlert = () => {
  Swal.fire("Any fool can use a computer!");
};

const titleText = () => {
  Swal.fire("The Internet?", "That thing is still around?", "question");
};
const successmsg = () => {
  Swal.fire("Good job!", "You clicked the button!", "success");
};
const saError = () => {
  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: "Something went wrong!",
    footer: '<a href="">Why do I have this issue?</a>',
  });
};
const content = () => {
  Swal.fire({
    imageUrl: "https://placeholder.pics/svg/300x1500",
    imageHeight: 1500,
    imageAlt: "A tall image",
  });
};
const confirm = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire("Deleted!", "Your file has been deleted.", "success");
    }
  });
};
const cancel = () => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "success",
      cancelButton: "btn btn-danger",
    },
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  });

  Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "No, cancel!",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      swalWithBootstrapButtons.fire(
        "Deleted!",
        "Your file has been deleted.",
        "success"
      );
    } else if (
      /* Read more about handling dismissals below */
      result.dismiss === Swal.DismissReason.cancel
    ) {
      swalWithBootstrapButtons.fire(
        "Cancelled",
        "Your imaginary file is safe :)",
        "error"
      );
    }
  });
};
const imageHeader = () => {
  Swal.fire({
    title: "Sweet!",
    text: "Modal with a custom image.",
    imageUrl: require("@/assets/images/logo-dark.png"),
    imageHeight: 20,
    confirmButtonColor: "#556ee6",
  });
};
const timer = () => {
  let timerInterval: string | number | NodeJS.Timeout | undefined;
  Swal.fire({
    title: "Auto close alert!",
    html: "I will close in <b></b> milliseconds.",
    timer: 2000,
    timerProgressBar: true,
    didOpen: () => {
      Swal.showLoading();
      const b: any = Swal.getHtmlContainer()?.querySelector("b");
      if (b) {
        timerInterval = setInterval(() => {
          b.textContent = Swal.getTimerLeft();
        }, 100);
      }
    },
    willClose: () => {
      clearInterval(timerInterval);
    },
  }).then((result) => {
    /* Read more about handling dismissals below */
    if (result.dismiss === Swal.DismissReason.timer) {
      console.log("I was closed by the timer");
    }
  });
};
const custom = () => {
  Swal.fire({
    title: "<strong>HTML <u>example</u></strong>",
    icon: "info",
    html:
      "You can use <b>bold text</b>, " +
      '<a href="//sweetalert2.github.io">links</a> ' +
      "and other HTML tags",
    showCloseButton: true,
    showCancelButton: true,
    focusConfirm: false,
    confirmButtonText: '<i class="ph-thumbs-up"></i> Great!',
    confirmButtonAriaLabel: "Thumbs up, great!",
    cancelButtonText: '<i class="ph-thumbs-down"></i>',
    cancelButtonAriaLabel: "Thumbs down",
  });
};
const threeButton = () => {
  Swal.fire({
    title: "Do you want to save the changes?",
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: "Save",
    denyButtonText: `Don't save`,
  }).then((result) => {
    /* Read more about isConfirmed, isDenied below */
    if (result.isConfirmed) {
      Swal.fire("Saved!", "", "success");
    } else if (result.isDenied) {
      Swal.fire("Changes are not saved", "", "info");
    }
  });
};
const position = () => {
  Swal.fire({
    position: "top-end",
    icon: "success",
    title: "Your work has been saved",
    showConfirmButton: false,
    timer: 1500,
  });
};

const customBackground = () => {
  Swal.fire({
    title: "Custom width, padding, background.",
    width: 600,
    padding: 100,
    confirmButtonColor: "#556ee6",
    background:
      "#fff url(//subtlepatterns2015.subtlepatterns.netdna-cdn.com/patterns/geometry.png)",
  });
};
const ajax = () => {
  Swal.fire({
    title: "Submit email to run ajax request",
    input: "email",
    showCancelButton: true,
    confirmButtonText: "Submit",
    showLoaderOnConfirm: true,
    confirmButtonColor: "#556ee6",
    cancelButtonColor: "#f46a6a",
    preConfirm: (email) => {
      return new Promise(function (resolve, reject) {
        setTimeout(() => {
          if (email === "taken@example.com") {
            Promise.reject(new Error("This email is already taken."));
          } else {
            resolve("Done!");
          }
        }, 2000);
      });
    },
    allowOutsideClick: false,
  }).then((email) => {
    Swal.fire({
      title: "Ajax request finished!",
      html: "Submitted email: " + email,
    });
  });
};
</script>
<template>
  <v-row class="align-center">
    <v-col lg="12">
      <v-card>
        <v-card-title class="mb-0">Examples</v-card-title>

        <v-card-text>
          <p class="text-muted mb-4">
            Here are the various types of beautiful, responsive, customizable,
            and accessible sweet alerts.
          </p>

          <div class="table-responsive">
            <v-row justify="space-between">
              <v-col cols="6" class="font-weight-bold">Sweet Alert Type</v-col>
              <v-col cols="6" class="text-center font-weight-bold"
                >Sweet Alert Examples</v-col
              >
            </v-row>
            <v-row class="align-center">
              <v-col>A Basic Message</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="showAlert"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>A Title with a Text Under</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="titleText"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>A success message!</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="successmsg"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col
                >A modal with a title, an error icon, a text, and a
                footer</v-col
              >
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="saError"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>A modal window with a long content inside</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="content"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>
                A warning message, with a function attached to the
                "Confirm"-button...
              </v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="confirm"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>
                By passing a parameter, you can execute something else for
                "Cancel".
              </v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="cancel"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>A message with custom Image Header</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="imageHeader"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>A message with auto close timer</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="timer"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>Custom HTML description and buttons</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="custom"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>A dialog with three buttons</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="threeButton"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>A custom positioned dialog</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="position"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>A message with custom width, padding and background</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="customBackground"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
            <v-divider class="my-2" />

            <v-row class="align-center">
              <v-col>Ajax request example</v-col>
              <v-col class="text-center">
                <v-btn
                  color="primary"
                  density="comfortable"
                  class="px-3"
                  @click="ajax"
                  >Click me</v-btn
                >
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
