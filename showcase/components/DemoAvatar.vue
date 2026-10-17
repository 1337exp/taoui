<script setup>
import { TaoAvatar } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoAvatar' })
</script>

<template>
  <ShowcaseSection id="avatar" :tables="propTables['avatar']">
    <h2>TaoAvatar</h2>
          <p>{{ tr('A photo or initials. A status dot and a counter are optional, and can be combined.', 'Фото или инициалы. Точка статуса и счётчик — по желанию, можно вместе.') }}</p>

          <div class="button-row" style="align-items: center;">
            <TaoAvatar :name="tr('Anna Kozlova', 'Анна Козлова')" size="small" />
            <TaoAvatar :name="tr('Anna Kozlova', 'Анна Козлова')" />
            <TaoAvatar :name="tr('Boris', 'Борис')" size="large" />
            <TaoAvatar :src="imageSrc" :name="tr('Demo', 'Демо')" size="large" />
            <TaoAvatar src="https://invalid.example/missing.png" :name="tr('Anna Kozlova', 'Анна Козлова')" />
          </div>

          <h3>{{ tr('Indicator', 'Индикатор') }}</h3>
          <div class="button-row" style="align-items: center;">
            <TaoAvatar :name="tr('Anna Kozlova', 'Анна Козлова')" dot />
            <TaoAvatar :name="tr('Boris', 'Борис')" size="large" dot="danger" />
            <TaoAvatar :name="tr('Kira', 'Кира')" size="large" dot="warning" />
            <TaoAvatar :name="tr('Oleg', 'Олег')" dot="neutral" />
            <TaoAvatar :name="tr('Anna Kozlova', 'Анна Козлова')" :count="3" />
            <TaoAvatar :name="tr('Boris', 'Борис')" size="large" :count="128" />
            <TaoAvatar :src="imageSrc" :name="tr('Demo', 'Демо')" size="large" dot :count="2" />
          </div>

          <div class="code-block">
            <pre><code>&lt;TaoAvatar name="{{ tr('Anna Kozlova', 'Анна Козлова') }}" /&gt;
&lt;TaoAvatar name="{{ tr('Anna', 'Анна') }}" dot /&gt;
&lt;TaoAvatar name="{{ tr('Boris', 'Борис') }}" :count="3" /&gt;
&lt;TaoAvatar :src="url" name="{{ tr('Anna', 'Анна') }}" size="large" dot :count="2" /&gt;

&lt;TaoAvatar
  name="Ann"
  fallback-label="Avatar"
  notifications-label="{count} notifications"
  :dot-labels="{ success: 'online', danger: 'busy', warning: 'away', info: 'status', neutral: 'offline' }"
/&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
