<script setup>
import { ref } from 'vue'
import { TaoImage } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoImage' })

const imageSrc = ref('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTIwIiB2aWV3Qm94PSIwIDAgMTYwIDEyMCI+CiAgPHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxMjAiIGZpbGw9IiNlNWU1ZTUiLz4KICA8cmVjdCB4PSIxIiB5PSIxIiB3aWR0aD0iMTU4IiBoZWlnaHQ9IjExOCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYmZiZmJmIiBzdHJva2Utd2lkdGg9IjIiLz4KICA8dGV4dCB4PSI4MCIgeT0iNjUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2NjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5kZW1vIGltYWdlPC90ZXh0Pgo8L3N2Zz4K')
</script>

<template>
  <ShowcaseSection id="image" :tables="propTables['image']">
    <h2>TaoImage</h2>
          <p>
            Обёртка над <code>&lt;img&gt;</code>: fade-in и плейсхолдер. По умолчанию грузится сразу.
            <code>lazy</code> — браузер сам отложит загрузку, пока картинка не рядом с экраном.
          </p>
    
          <div style="width: 160px; height: 120px;">
            <TaoImage :src="imageSrc" />
          </div>
          <div style="width: 160px; height: 120px; margin-top: 12px;">
            <TaoImage src="https://invalid.example/missing.png" placeholder-text="No image available" />
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoImage :src="imageUrl" /&gt;
&lt;TaoImage :src="imageUrl" lazy /&gt;
&lt;TaoImage placeholder-text="No image available" /&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>
