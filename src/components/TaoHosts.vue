<script lang="ts" setup>
import TaoConfirmHost from './TaoConfirmHost.vue';
import TaoToastViewport from './TaoToastViewport.vue';

// The places where `toast()` and `confirm()` draw, once, in the root of the app (TaoShell has them inside). They stand in the tree of the
// app, so they read the locale the app provides, and a second `<TaoHosts />` (or a hand-written viewport next to it) draws nothing.
// Места, где рисуют `toast()` и `confirm()`: один раз, в корне приложения (в TaoShell они уже есть). Они стоят в дереве приложения и
// читают выданную им локаль; второй `<TaoHosts />` (или написанный руками viewport рядом) ничего не рисует.
defineOptions({ name: 'TaoHosts' });
</script>

<template>
    <TaoToastViewport />
    <TaoConfirmHost />
</template>
