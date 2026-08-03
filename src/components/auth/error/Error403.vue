<script lang="ts" setup>
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const goBack = () => {
  const redirect = route.query.redirect;
  if (typeof redirect === "string" && redirect.startsWith("/") && redirect !== route.fullPath) {
    router.push("/");
    return;
  }

  router.back();
};
</script>

<template>
  <div class="h-100 d-flex align-center justify-center unauthorized-page">
    <v-card class="unauthorized-page__card" elevation="0">
      <v-card-text class="text-center">
        <v-avatar size="72" color="danger" variant="tonal" class="mb-5">
          <i class="ph-lock-key" style="font-size: 34px" />
        </v-avatar>

        <h1 class="unauthorized-page__title">403</h1>
        <h2 class="unauthorized-page__subtitle">Acesso não autorizado</h2>
        <p class="unauthorized-page__text">
          A tua sessão está activa, mas não possui a permissão necessária para consultar este recurso.
        </p>

        <div class="d-flex justify-center ga-2 flex-wrap mt-5">
          <v-btn color="secondary" variant="outlined" @click="goBack">
            <i class="ph-arrow-left me-2" />
            Voltar
          </v-btn>
          <v-btn color="secondary" to="/">
            <i class="ph-house me-2" />
            Início
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.unauthorized-page {
  min-height: calc(100vh - 220px);
}

.unauthorized-page__card {
  background: transparent;
  max-width: 520px;
}

.unauthorized-page__title {
  color: #0f172a;
  font-size: 4rem;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
  margin: 0 0 8px;
}

.unauthorized-page__subtitle {
  color: #172033;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0;
  margin: 0;
}

.unauthorized-page__text {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 12px auto 0;
  max-width: 420px;
}
</style>
