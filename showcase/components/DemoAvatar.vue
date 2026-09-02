<script setup>
import { TaoAvatar } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoAvatar' })
</script>

<template>
  <ShowcaseSection id="avatar" :tables="propTables['avatar']">
    <h2>TaoAvatar</h2>
          <p>Фото или инициалы. Точка статуса и счётчик — по желанию, можно вместе.</p>
    
          <div class="button-row" style="align-items: center;">
            <TaoAvatar name="Анна Козлова" size="small" />
            <TaoAvatar name="Анна Козлова" />
            <TaoAvatar name="Борис" size="large" />
            <TaoAvatar :src="imageSrc" name="Демо" size="large" />
            <TaoAvatar src="https://invalid.example/missing.png" name="Анна Козлова" />
          </div>
    
          <h3>Индикатор</h3>
          <div class="button-row" style="align-items: center;">
            <TaoAvatar name="Анна Козлова" dot />
            <TaoAvatar name="Борис" size="large" dot="danger" />
            <TaoAvatar name="Кира" size="large" dot="warning" />
            <TaoAvatar name="Олег" dot="neutral" />
            <TaoAvatar name="Анна Козлова" :count="3" />
            <TaoAvatar name="Борис" size="large" :count="128" />
            <TaoAvatar :src="imageSrc" name="Демо" size="large" dot :count="2" />
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoAvatar name="Анна Козлова" /&gt;
&lt;TaoAvatar name="Анна" dot /&gt;
&lt;TaoAvatar name="Борис" :count="3" /&gt;
&lt;TaoAvatar :src="url" name="Анна" size="large" dot :count="2" /&gt;

&lt;TaoAvatar
  name="Ann"
  fallback-label="Avatar"
  notifications-label="{count} notifications"
  :dot-labels="{ success: 'online', danger: 'busy', warning: 'away', info: 'status', neutral: 'offline' }"
/&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
