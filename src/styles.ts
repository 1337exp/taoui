// The entry the build uses to produce the core stylesheet (`@1337exp/taoui/styles.css`: tokens, themes, contexts, typography, base).
// Nothing imports it at run time. Components bring their own CSS: importing a component takes its CSS with it.
// Вход, по которому сборка делает ядро стилей (`@1337exp/taoui/styles.css`: токены, темы, контексты, типографика, base).
// В рантайме его никто не импортирует. Свой CSS компоненты приносят сами: импорт компонента тянет за собой его CSS.
import './styles/index.css';
