import type { Plugin } from 'vue';
import TaoButton from './components/TaoButton.vue';
import TaoBlock from './components/TaoBlock.vue';
import TaoInput from './components/TaoInput.vue';
import TaoCard from './components/TaoCard.vue';
import TaoModal from './components/TaoModal.vue';
import TaoTabs from './components/TaoTabs.vue';
import TaoTooltip from './components/TaoTooltip.vue';
import TaoSpoiler from './components/TaoSpoiler.vue';
import TaoCopy from './components/TaoCopy.vue';
import TaoContainer from './components/TaoContainer.vue';
import TaoFlex from './components/TaoFlex.vue';
import TaoSpace from './components/TaoSpace.vue';
import TaoIcon from './components/TaoIcon.vue';
import TaoLoader from './components/TaoLoader.vue';
import TaoImage from './components/TaoImage.vue';
import TaoCheckbox from './components/TaoCheckbox.vue';
import TaoTag from './components/TaoTag.vue';
import TaoDivider from './components/TaoDivider.vue';
import TaoAnimatedBorder from './components/TaoAnimatedBorder.vue';
import TaoTextarea from './components/TaoTextarea.vue';
import TaoScrollTop from './components/TaoScrollTop.vue';
import TaoProgress from './components/TaoProgress.vue';
import TaoSlider from './components/TaoSlider.vue';
import TaoFileDrop from './components/TaoFileDrop.vue';
import TaoDropdownMenu from './components/TaoDropdownMenu.vue';
import TaoPinCode from './components/TaoPinCode.vue';
import TaoLink from './components/TaoLink.vue';

// Импорт нужен только для того, чтобы Vite подхватил CSS в сборку
// styles.css. Сам JS-бандл эти стили в рантайме НЕ применяет —
// подключи '@tao/ui/styles.css' самостоятельно (см. README), чтобы
// иметь явный контроль над темизацией.
import './styles/index.css';

const components = [
    TaoButton,
    TaoBlock,
    TaoInput,
    TaoCard,
    TaoModal,
    TaoTabs,
    TaoTooltip,
    TaoSpoiler,
    TaoCopy,
    TaoContainer,
    TaoFlex,
    TaoSpace,
    TaoIcon,
    TaoLoader,
    TaoImage,
    TaoCheckbox,
    TaoTag,
    TaoDivider,
    TaoAnimatedBorder,
    TaoTextarea,
    TaoScrollTop,
    TaoProgress,
    TaoSlider,
    TaoFileDrop,
    TaoDropdownMenu,
    TaoPinCode,
    TaoLink,
];

export const TaoUI: Plugin = {
    install(app) {
        components.forEach(component => {
            app.component(component.name!, component);
        });
    },
};

export {
    TaoButton,
    TaoBlock,
    TaoInput,
    TaoCard,
    TaoModal,
    TaoTabs,
    TaoTooltip,
    TaoSpoiler,
    TaoCopy,
    TaoContainer,
    TaoFlex,
    TaoSpace,
    TaoIcon,
    TaoLoader,
    TaoImage,
    TaoCheckbox,
    TaoTag,
    TaoDivider,
    TaoAnimatedBorder,
    TaoTextarea,
    TaoScrollTop,
    TaoProgress,
    TaoSlider,
    TaoFileDrop,
    TaoDropdownMenu,
    TaoPinCode,
    TaoLink,
};

export default TaoUI;
