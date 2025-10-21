<script lang="ts" setup>
import { ref, computed } from "vue";
import { Avatar1 } from "@/assets/images/users/utils";
import appConfigs from "@/app/appConfigurations";
import { useRouter } from "vue-router";
import LocalStorage from "@/app/localStorage";
import { LS_KEY_USER } from "@/app/const";

const router = useRouter();
const userLocalStorage = new LocalStorage(LS_KEY_USER);

const formData = ref({
  password: { value: "", isValid: false },
});
const errorMsg = ref("");
const isSubmitted = ref(false);

const isValidFormData = computed(() => {
  return formData.value.password.isValid;
});
const onUnlock = () => {
  errorMsg.value = "";
  isSubmitted.value = true;
  if (!isValidFormData.value) {
    return;
  }

  const auth = appConfigs.auth;
  if (auth === "fakebackend") {
    if (
      formData.value.password.value === userLocalStorage.getItems().password 
    ) {
      router.push({ path: "/" });
    } else {
      errorMsg.value = "Invalid Password!";
    }
  }
};
</script>
<template>
  <div class="h-100 d-flex align-center justify-center">
    <div class="w-100">
      <v-card-title class="text-center">
        <h5 class="text-h6 font-weight-bold mt-10">{{$t('t-lock-screen')}}</h5>
        <div class="text-muted mt-1 font-weight-regular">
          {{$t('t-enter-your-password-to-unlock-the-scren')}}
        </div>
      </v-card-title>
      <v-card-text class="mt-5">
        <v-row justify="center" class="align-center">
          <v-col cols="12" lg="8">
            <v-alert
              v-if="errorMsg"
              class="mb-3"
              color="danger"
              variant="tonal"
              density="compact"
            >
              {{ errorMsg }}
            </v-alert>
            <div class="text-center">
              <v-avatar size="110" class="border pa-1">
                <v-img :src="Avatar1" class="rounded-circle" />
              </v-avatar>

              <div class="text-subtitle-1 mt-3 mb-5 font-weight-bold">
                Hi ! Richard Marshall
              </div>
            </div>

            <div class="font-weight-medium mb-1">
              {{$t('t-password')}} <i class="ph-asterisk ph-xs text-danger" />
            </div>
            <TextField
              v-model="formData.password"
              isRequired
              :showError="isSubmitted"
              :isSubmitted="isSubmitted"
              hide-details
              placeholder="Enter Password or pin"
            />

            <v-btn color="primary" block class="mt-4" @click="onUnlock">
              {{$t('t-unlock')}}
            </v-btn>

            <div class="text-center mt-5 d-flex align-center justify-center">
              Not you? return
              <v-btn
                to="/auth/signin"
                variant="text"
                color="primary"
                class="font-weight-bold text-decoration-underline pa-0"
              >
                Signin
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </div>
  </div>
</template>
