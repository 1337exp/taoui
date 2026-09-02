import type { Plugin } from 'vue';
import TaoButton from './components/TaoButton.vue';
import TaoBlock from './components/TaoBlock.vue';
import TaoInput from './components/TaoInput.vue';
import TaoInputGroup from './components/TaoInputGroup.vue';
import TaoInputNumber from './components/TaoInputNumber.vue';
import TaoQuantity from './components/TaoQuantity.vue';
import TaoCard from './components/TaoCard.vue';
import TaoModal from './components/TaoModal.vue';
import TaoTabs from './components/TaoTabs.vue';
import TaoTooltip from './components/TaoTooltip.vue';
import TaoSpoiler from './components/TaoSpoiler.vue';
import TaoSpoilerGroup from './components/TaoSpoilerGroup.vue';
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
import TaoFormField from './components/TaoFormField.vue';
import TaoSelect from './components/TaoSelect.vue';
import TaoCombobox from './components/TaoCombobox.vue';
import TaoDate from './components/TaoDate.vue';
import TaoSwitch from './components/TaoSwitch.vue';
import TaoRadio from './components/TaoRadio.vue';
import TaoRadioGroup from './components/TaoRadioGroup.vue';
import TaoAlert from './components/TaoAlert.vue';
import TaoTable from './components/TaoTable.vue';
import TaoPagination from './components/TaoPagination.vue';
import TaoEmpty from './components/TaoEmpty.vue';
import TaoSkeleton from './components/TaoSkeleton.vue';
import TaoDrawer from './components/TaoDrawer.vue';
import TaoAvatar from './components/TaoAvatar.vue';
import TaoBreadcrumb from './components/TaoBreadcrumb.vue';
import TaoCounter from './components/TaoCounter.vue';
import TaoCarousel from './components/TaoCarousel.vue';
import TaoStages from './components/TaoStages.vue';
import TaoToastViewport from './components/TaoToastViewport.vue';
import TaoConfirmHost from './components/TaoConfirmHost.vue';
import { toast } from './toast';
import { confirm } from './confirm';

// Импорт нужен только для того, чтобы Vite подхватил CSS в сборку
// styles.css. Сам JS-бандл эти стили в рантайме НЕ применяет —
// подключи '@1337exp/taoui/styles.css' самостоятельно (см. README), чтобы
// иметь явный контроль над темизацией.
import './styles/index.css';

const components = [
    TaoButton,
    TaoBlock,
    TaoInput,
    TaoInputGroup,
    TaoInputNumber,
    TaoQuantity,
    TaoCard,
    TaoModal,
    TaoTabs,
    TaoTooltip,
    TaoSpoiler,
    TaoSpoilerGroup,
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
    TaoFormField,
    TaoSelect,
    TaoCombobox,
    TaoDate,
    TaoSwitch,
    TaoRadio,
    TaoRadioGroup,
    TaoAlert,
    TaoTable,
    TaoPagination,
    TaoEmpty,
    TaoSkeleton,
    TaoDrawer,
    TaoAvatar,
    TaoBreadcrumb,
    TaoCounter,
    TaoCarousel,
    TaoStages,
    TaoToastViewport,
    TaoConfirmHost,
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
    TaoInputGroup,
    TaoInputNumber,
    TaoQuantity,
    TaoCard,
    TaoModal,
    TaoTabs,
    TaoTooltip,
    TaoSpoiler,
    TaoSpoilerGroup,
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
    TaoFormField,
    TaoSelect,
    TaoCombobox,
    TaoDate,
    TaoSwitch,
    TaoRadio,
    TaoRadioGroup,
    TaoAlert,
    TaoTable,
    TaoPagination,
    TaoEmpty,
    TaoSkeleton,
    TaoDrawer,
    TaoAvatar,
    TaoBreadcrumb,
    TaoCounter,
    TaoCarousel,
    TaoStages,
    TaoToastViewport,
    TaoConfirmHost,
    toast,
    confirm,
};

export type {
    TaoToastAction,
    TaoToastApi,
    TaoToastBuilder,
    TaoToastDefaults,
    TaoToastDisplayMode,
    TaoToastPosition,
    TaoToastRecord,
    TaoToastShortcutOptions,
    TaoToastType,
} from './toast';

export type {
    TaoConfirmApi,
    TaoConfirmBuilder,
    TaoConfirmDefaults,
    TaoConfirmRecord,
    TaoConfirmShortcutOptions,
} from './confirm';

export { parseTaoDate, formatTaoDateIso, todayTaoDate, formatTaoDateLabel } from './date';
export type { TaoSelectOption } from './select';
export type { TaoDateCell, TaoDateParts } from './date';
export type { TaoRadioValue } from './radio';
export type { TaoSpoilerName } from './spoiler';
export type { TaoFormFieldContext } from './formField';
export type { TaoTableAlign, TaoTableColumn, TaoTableSort } from './table';
export type { TaoPaginationItem } from './pagination';
export type { TaoBreadcrumbItem } from './breadcrumb';
export type { TaoDropdownAction } from './dropdown';
export type { TaoQuantityChangeSource } from './quantity';
export type { TaoStageItem, TaoStageStatus } from './stage';

export default TaoUI;
