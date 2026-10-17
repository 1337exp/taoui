<script setup>
import { ref } from 'vue'
import { TaoSplit } from '@1337exp/taoui'
import ShowcaseSection from './ShowcaseSection.vue'
import { tr } from '../i18n.js'
import Tr from './Tr.vue'
import { propTables } from '../propTables.js'

defineOptions({ name: 'DemoSplit' })

const splitPercent = ref(50)
const splitSidebar = ref(220)
const splitColumn = ref(40)
const splitNested = ref(34)
const splitNestedInner = ref(55)
</script>

<template>
  <ShowcaseSection id="split" :tables="propTables['split']">
    <h2>TaoSplit</h2>
          <Tr>
            <template #en>
              <p>
                Two panes and a bar between them. Not a Divider and not an N-pane layout: three columns are two nested splits.
                <code>direction</code> as in Flex: <code>row</code> / <code>column</code>.
                The parent sets the height; scrolling is inside a pane, not on the split itself.
              </p>
            </template>
            <template #ru>
              <p>
                Две панели и полоса между ними. Не Divider и не раскладка на N панелей: три колонки — два вложенных сплита.
                <code>direction</code> как у Flex: <code>row</code> / <code>column</code>.
                Родитель задаёт высоту; скролл — внутри панели, не на самом сплите.
              </p>
            </template>
          </Tr>
    
          <h3>row, 50/50, {{ tr('scrolling inside', 'скролл внутри') }}</h3>
          <p class="split-note">start: {{ splitPercent }}%</p>
          <div class="split-demo">
            <TaoSplit v-model="splitPercent" :min="20" :min-end="20">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <strong>Start</strong>
                  <p v-for="n in 12" :key="n">
                    {{ tr('Long text in a pane: scrolling happens on the inner wrapper, the split itself does not grow. Line', 'Длинный текст в панели: скролл на внутренней обёртке, сплит сам не растёт. Строка') }} {{ n }}.
                  </p>
                </div>
              </template>
              <template #end>
                <div class="split-pane-box">
                  <strong>End</strong>
                  <p>{{ tr('Drag the bar. Arrows, Home/End — when the bar is focused.', 'Потяни полосу. Стрелки, Home/End — когда полоса в фокусе.') }}</p>
                </div>
              </template>
            </TaoSplit>
          </div>
    
          <h3>unit="px" — {{ tr('a sidebar with min/max', 'сайдбар с min/max') }}</h3>
          <p class="split-note">start: {{ splitSidebar }}px · min 160 · max 360 · min-end 200</p>
          <div class="split-demo">
            <TaoSplit v-model="splitSidebar" unit="px" :min="160" :max="360" :min-end="200">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <strong>{{ tr('Sidebar', 'Сайдбар') }}</strong>
                  <p>{{ tr('Fixed pixels. The second pane takes the rest.', 'Фиксированные пиксели. Вторая панель забирает остаток.') }}</p>
                </div>
              </template>
              <template #end>
                <div class="split-pane-box">
                  <strong>{{ tr('Content', 'Контент') }}</strong>
                  <p>{{ tr('Narrow the window — the sidebar runs into min and min-end.', 'Сузь окно — сайдбар упрётся в min и min-end.') }}</p>
                </div>
              </template>
            </TaoSplit>
          </div>
    
          <h3>column</h3>
          <p class="split-note">start: {{ splitColumn }}%</p>
          <div class="split-demo">
            <TaoSplit v-model="splitColumn" direction="column" :min="20" :min-end="20">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <strong>{{ tr('Top', 'Верх') }}</strong>
                  <p>{{ tr('A vertical split. The parent needs a height, otherwise there is nothing to take the percentages of.', 'Вертикальный сплит. Родителю нужна высота, иначе проценты не из чего считать.') }}</p>
                </div>
              </template>
              <template #end>
                <div class="split-pane-box">
                  <strong>{{ tr('Bottom', 'Низ') }}</strong>
                </div>
              </template>
            </TaoSplit>
          </div>
    
          <h3>{{ tr('Nested row + column', 'Вложенный row + column') }}</h3>
          <div class="split-demo split-demo--tall">
            <TaoSplit v-model="splitNested" :min="20" :min-end="30">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <strong>{{ tr('Left', 'Слева') }}</strong>
                  <p>{{ splitNested }}%</p>
                </div>
              </template>
              <template #end>
                <TaoSplit v-model="splitNestedInner" direction="column" :min="20" :min-end="20">
                  <template #start>
                    <div class="split-pane-box">
                      <strong>{{ tr('Top right', 'Справа сверху') }}</strong>
                    </div>
                  </template>
                  <template #end>
                    <div class="split-pane-box split-pane-box--sunken">
                      <strong>{{ tr('Bottom right', 'Справа снизу') }}</strong>
                    </div>
                  </template>
                </TaoSplit>
              </template>
            </TaoSplit>
          </div>
    
          <h3>resizable="false"</h3>
          <div class="split-demo split-demo--short">
            <TaoSplit :model-value="40" :resizable="false">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">{{ tr('Fixed', 'Фиксировано') }}</div>
              </template>
              <template #end>
                <div class="split-pane-box">{{ tr('There is a bar, but it cannot be dragged', 'Полоса есть, тянуть нельзя') }}</div>
              </template>
            </TaoSplit>
          </div>
    
          <h3>Overflow: {{ tr('a table and nowrap', 'таблица и nowrap') }}</h3>
          <p class="split-note">{{ tr('The pane shrinks, the content scrolls inside. The handle goes down to min.', 'Панель сжимается, контент скроллится внутри. Ручка доезжает до min.') }}</p>
          <div class="split-demo">
            <TaoSplit :model-value="45" :min="15" :min-end="20">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <p class="split-nowrap">verylongunbreakabletokenwithoutspacesthatwouldblowflexminwidth</p>
                  <table class="split-table">
                    <thead>
                      <tr>
                        <th>{{ tr('Column', 'Колонка') }}</th>
                        <th>{{ tr('Another column', 'Ещё колонка') }}</th>
                        <th>{{ tr('And another', 'И ещё') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="n in 6" :key="n">
                        <td>{{ tr('cell', 'ячейка') }}-{{ n }}-{{ tr('long', 'длинная') }}</td>
                        <td>{{ tr('value', 'значение') }} {{ n * 10 }}</td>
                        <td>nowrap-{{ n }}-{{ n }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <template #end>
                <div class="split-pane-box">
                  {{ tr('Squeeze the left pane — the table does not blow up the layout.', 'Сожми левую панель — таблица не раздувает layout.') }}
                </div>
              </template>
            </TaoSplit>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoSplit v-model="side" unit="px" :min="160" :max="480" :min-end="240"&gt;
  &lt;template #start&gt;{{ tr('Navigation', 'Навигация') }}&lt;/template&gt;
  &lt;template #end&gt;{{ tr('Main', 'Основное') }}&lt;/template&gt;
&lt;/TaoSplit&gt;</code></pre>
          </div>
  </ShowcaseSection>
</template>

<style scoped>
.split-demo {
  height: 280px;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  overflow: hidden;
}

.split-demo--tall {
  height: 360px;
}

.split-demo--short {
  height: 160px;
}

.split-note {
  margin: 0 0 8px;
  color: var(--tao-color-text-muted);
  font-size: 13px;
}

.split-pane-box {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  padding: 12px;
  overflow: auto;
}

.split-pane-box--sunken {
  background: var(--tao-color-surface-sunken);
}

.split-nowrap {
  margin: 0 0 12px;
  white-space: nowrap;
}

.split-table {
  border-collapse: collapse;
  white-space: nowrap;
}

.split-table th,
.split-table td {
  padding: 4px 10px;
  border-bottom: 1px solid var(--tao-color-border);
  text-align: left;
}
</style>
