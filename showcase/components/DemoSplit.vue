<script setup>
import { ref } from 'vue'
import { TaoSplit } from '@tao/ui'
import ShowcaseSection from './ShowcaseSection.vue'
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
          <p>
            Две панели и полоса между ними. Не Divider и не раскладка на N панелей: три колонки — два вложенных сплита.
            <code>direction</code> как у Flex: <code>row</code> / <code>column</code>.
            Родитель задаёт высоту; скролл — внутри панели, не на самом сплите.
          </p>
    
          <h3>row, 50/50, скролл внутри</h3>
          <p class="split-note">start: {{ splitPercent }}%</p>
          <div class="split-demo">
            <TaoSplit v-model="splitPercent" :min="20" :min-end="20">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <strong>Start</strong>
                  <p v-for="n in 12" :key="n">
                    Длинный текст в панели: скролл на внутренней обёртке, сплит сам не растёт. Строка {{ n }}.
                  </p>
                </div>
              </template>
              <template #end>
                <div class="split-pane-box">
                  <strong>End</strong>
                  <p>Потяни полосу. Стрелки, Home/End — когда полоса в фокусе.</p>
                </div>
              </template>
            </TaoSplit>
          </div>
    
          <h3>unit="px" — сайдбар с min/max</h3>
          <p class="split-note">start: {{ splitSidebar }}px · min 160 · max 360 · min-end 200</p>
          <div class="split-demo">
            <TaoSplit v-model="splitSidebar" unit="px" :min="160" :max="360" :min-end="200">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <strong>Сайдбар</strong>
                  <p>Фиксированные пиксели. Вторая панель забирает остаток.</p>
                </div>
              </template>
              <template #end>
                <div class="split-pane-box">
                  <strong>Контент</strong>
                  <p>Сузь окно — сайдбар упрётся в min и min-end.</p>
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
                  <strong>Верх</strong>
                  <p>Вертикальный сплит. Родителю нужна высота, иначе проценты не из чего считать.</p>
                </div>
              </template>
              <template #end>
                <div class="split-pane-box">
                  <strong>Низ</strong>
                </div>
              </template>
            </TaoSplit>
          </div>
    
          <h3>Вложенный row + column</h3>
          <div class="split-demo split-demo--tall">
            <TaoSplit v-model="splitNested" :min="20" :min-end="30">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <strong>Слева</strong>
                  <p>{{ splitNested }}%</p>
                </div>
              </template>
              <template #end>
                <TaoSplit v-model="splitNestedInner" direction="column" :min="20" :min-end="20">
                  <template #start>
                    <div class="split-pane-box">
                      <strong>Справа сверху</strong>
                    </div>
                  </template>
                  <template #end>
                    <div class="split-pane-box split-pane-box--sunken">
                      <strong>Справа снизу</strong>
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
                <div class="split-pane-box split-pane-box--sunken">Фиксировано</div>
              </template>
              <template #end>
                <div class="split-pane-box">Полоса есть, тянуть нельзя</div>
              </template>
            </TaoSplit>
          </div>
    
          <h3>Overflow: таблица и nowrap</h3>
          <p class="split-note">Панель сжимается, контент скроллится внутри. Ручка доезжает до min.</p>
          <div class="split-demo">
            <TaoSplit :model-value="45" :min="15" :min-end="20">
              <template #start>
                <div class="split-pane-box split-pane-box--sunken">
                  <p class="split-nowrap">verylongunbreakabletokenwithoutspacesthatwouldblowflexminwidth</p>
                  <table class="split-table">
                    <thead>
                      <tr>
                        <th>Колонка</th>
                        <th>Ещё колонка</th>
                        <th>И ещё</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="n in 6" :key="n">
                        <td>ячейка-{{ n }}-длинная</td>
                        <td>значение {{ n * 10 }}</td>
                        <td>nowrap-{{ n }}-{{ n }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <template #end>
                <div class="split-pane-box">
                  Сожми левую панель — таблица не раздувает layout.
                </div>
              </template>
            </TaoSplit>
          </div>
    
          <div class="code-block">
            <pre><code>&lt;TaoSplit v-model="side" unit="px" :min="160" :max="480" :min-end="240"&gt;
  &lt;template #start&gt;Навигация&lt;/template&gt;
  &lt;template #end&gt;Основное&lt;/template&gt;
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
