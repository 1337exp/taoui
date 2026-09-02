<script setup>
defineOptions({ name: 'PropsTable' })

const props = defineProps({
  title: { type: String, default: '' },
  kind: { type: String, default: 'props' },
  rows: { type: Array, default: () => [] },
  slots: { type: String, default: '' },
})

const isApi = () => props.kind === 'api'
</script>

<template>
  <div class="props-table">
    <h3 v-if="title" class="props-table__title">{{ title }}</h3>
    <p class="props-table__kicker">{{ isApi() ? 'Методы' : 'Пропсы' }}</p>
    <div class="props-table__wrap">
      <table>
        <thead>
          <tr v-if="isApi()">
            <th>Метод</th>
            <th>Сигнатура</th>
            <th>Что ожидается</th>
          </tr>
          <tr v-else>
            <th>Имя</th>
            <th>Тип</th>
            <th>По умолчанию</th>
            <th>Что ожидается</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.name">
            <td><code>{{ row.name }}</code></td>
            <td><code>{{ row.type }}</code></td>
            <td v-if="!isApi()"><code v-if="row.default">{{ row.default }}</code><span v-else class="props-table__empty">—</span></td>
            <td>{{ row.note }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="slots" class="props-table__slots"><span>Слоты.</span> {{ slots }}</p>
  </div>
</template>

<style scoped>
.props-table {
  margin-top: 28px;
}

.props-table__title {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: var(--tao-color-text);
}

.props-table__kicker {
  margin: 0 0 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--tao-color-text-muted);
}

.props-table__wrap {
  overflow-x: auto;
  border: 1px solid var(--tao-color-border);
  border-radius: var(--tao-radius-panel);
  background: var(--tao-color-surface);
}

.props-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.props-table th,
.props-table td {
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
  border-bottom: 1px solid var(--tao-color-border);
}

.props-table thead th {
  background: var(--tao-color-surface-sunken);
  color: var(--tao-color-text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  white-space: nowrap;
}

.props-table tbody tr:last-child th,
.props-table tbody tr:last-child td {
  border-bottom: 0;
}

.props-table tbody tr:hover td {
  background: var(--tao-color-surface-sunken);
}

.props-table td:first-child code {
  color: var(--tao-color-accent);
  font-weight: 600;
}

.props-table code {
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 12px;
  color: var(--tao-color-text);
  word-break: break-word;
}

.props-table td:last-child {
  color: var(--tao-color-text);
  line-height: 1.45;
  min-width: 180px;
}

.props-table__empty {
  color: var(--tao-color-text-muted);
}

.props-table__slots {
  margin: 10px 0 0;
  color: var(--tao-color-text-muted);
  font-size: 13px;
  line-height: 1.45;
}

.props-table__slots span {
  font-weight: 600;
  color: var(--tao-color-text);
}
</style>
