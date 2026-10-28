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
import TaoScrubber from './components/TaoScrubber.vue';
import TaoTooltip from './components/TaoTooltip.vue';
import TaoPopover from './components/TaoPopover.vue';
import TaoSpoiler from './components/TaoSpoiler.vue';
import TaoSpoilerGroup from './components/TaoSpoilerGroup.vue';
import TaoCopy from './components/TaoCopy.vue';
import TaoContainer from './components/TaoContainer.vue';
import TaoFlex from './components/TaoFlex.vue';
import TaoSpace from './components/TaoSpace.vue';
import TaoGrid from './components/TaoGrid.vue';
import TaoGridItem from './components/TaoGridItem.vue';
import TaoSplit from './components/TaoSplit.vue';
import TaoIcon from './components/TaoIcon.vue';
import TaoLoader from './components/TaoLoader.vue';
import TaoImage from './components/TaoImage.vue';
import TaoCheckbox from './components/TaoCheckbox.vue';
import TaoTag from './components/TaoTag.vue';
import TaoDivider from './components/TaoDivider.vue';
import TaoFieldset from './components/TaoFieldset.vue';
import TaoAnimatedBorder from './components/TaoAnimatedBorder.vue';
import TaoTextarea from './components/TaoTextarea.vue';
import TaoScrollTop from './components/TaoScrollTop.vue';
import TaoProgress from './components/TaoProgress.vue';
import TaoSlider from './components/TaoSlider.vue';
import TaoRangeSlider from './components/TaoRangeSlider.vue';
import TaoFileDrop from './components/TaoFileDrop.vue';
import TaoDropdownMenu from './components/TaoDropdownMenu.vue';
import TaoContextMenu from './components/TaoContextMenu.vue';
import TaoMenu from './components/TaoMenu.vue';
import TaoMenubar from './components/TaoMenubar.vue';
import TaoNav from './components/TaoNav.vue';
import TaoTree from './components/TaoTree.vue';
import TaoChecklist from './components/TaoChecklist.vue';
import TaoTimeline from './components/TaoTimeline.vue';
import TaoPinCode from './components/TaoPinCode.vue';
import TaoLink from './components/TaoLink.vue';
import TaoFormField from './components/TaoFormField.vue';
import TaoSelect from './components/TaoSelect.vue';
import TaoColorInput from './components/TaoColorInput.vue';
import TaoColorPicker from './components/TaoColorPicker.vue';
import TaoCombobox from './components/TaoCombobox.vue';
import TaoCalendar from './components/TaoCalendar.vue';
import TaoDate from './components/TaoDate.vue';
import TaoDateRange from './components/TaoDateRange.vue';
import TaoSwitch from './components/TaoSwitch.vue';
import TaoRadio from './components/TaoRadio.vue';
import TaoRadioGroup from './components/TaoRadioGroup.vue';
import TaoSegmented from './components/TaoSegmented.vue';
import TaoSegmentedOption from './components/TaoSegmentedOption.vue';
import TaoAlert from './components/TaoAlert.vue';
import TaoTable from './components/TaoTable.vue';
import TaoPagination from './components/TaoPagination.vue';
import TaoEmpty from './components/TaoEmpty.vue';
import TaoList from './components/TaoList.vue';
import TaoListItem from './components/TaoListItem.vue';
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
import { createTaoLocale, localeKey, setTaoLocale, type TaoLocale, type TaoLocaleOverrides } from './locale';

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
    TaoScrubber,
    TaoTooltip,
    TaoPopover,
    TaoSpoiler,
    TaoSpoilerGroup,
    TaoCopy,
    TaoContainer,
    TaoFlex,
    TaoSpace,
    TaoGrid,
    TaoGridItem,
    TaoSplit,
    TaoIcon,
    TaoLoader,
    TaoImage,
    TaoCheckbox,
    TaoTag,
    TaoDivider,
    TaoFieldset,
    TaoAnimatedBorder,
    TaoTextarea,
    TaoScrollTop,
    TaoProgress,
    TaoSlider,
    TaoRangeSlider,
    TaoFileDrop,
    TaoDropdownMenu,
    TaoMenu,
    TaoMenubar,
    TaoNav,
    TaoTree,
    TaoChecklist,
    TaoTimeline,
    TaoContextMenu,
    TaoPinCode,
    TaoLink,
    TaoFormField,
    TaoSelect,
    TaoColorInput,
    TaoColorPicker,
    TaoCombobox,
    TaoCalendar,
    TaoDate,
    TaoDateRange,
    TaoSwitch,
    TaoRadio,
    TaoRadioGroup,
    TaoSegmented,
    TaoSegmentedOption,
    TaoAlert,
    TaoTable,
    TaoPagination,
    TaoEmpty,
    TaoList,
    TaoListItem,
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

export interface TaoUIOptions {
    /**
     * Language of built-in texts: `localeRu` (or any other), or a few keys on top of English (the default).
     * Язык встроенных текстов: `localeRu` (или любая другая) или несколько ключей поверх английской (по умолчанию).
     */
    locale?: TaoLocale | TaoLocaleOverrides;
}

export const TaoUI: Plugin<[TaoUIOptions?]> = {
    install(app, options: TaoUIOptions = {}) {
        if (options.locale) {
            if (typeof window === 'undefined') {
                // on the server the process is shared by every request: the language belongs to this app only
                app.provide(localeKey, createTaoLocale(options.locale));
            } else {
                setTaoLocale(options.locale);
            }
        }
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
    TaoScrubber,
    TaoTooltip,
    TaoPopover,
    TaoSpoiler,
    TaoSpoilerGroup,
    TaoCopy,
    TaoContainer,
    TaoFlex,
    TaoSpace,
    TaoGrid,
    TaoGridItem,
    TaoSplit,
    TaoIcon,
    TaoLoader,
    TaoImage,
    TaoCheckbox,
    TaoTag,
    TaoDivider,
    TaoFieldset,
    TaoAnimatedBorder,
    TaoTextarea,
    TaoScrollTop,
    TaoProgress,
    TaoSlider,
    TaoRangeSlider,
    TaoFileDrop,
    TaoDropdownMenu,
    TaoMenu,
    TaoMenubar,
    TaoNav,
    TaoTree,
    TaoChecklist,
    TaoTimeline,
    TaoContextMenu,
    TaoPinCode,
    TaoLink,
    TaoFormField,
    TaoSelect,
    TaoColorInput,
    TaoColorPicker,
    TaoCombobox,
    TaoCalendar,
    TaoDate,
    TaoDateRange,
    TaoSwitch,
    TaoRadio,
    TaoRadioGroup,
    TaoSegmented,
    TaoSegmentedOption,
    TaoAlert,
    TaoTable,
    TaoPagination,
    TaoEmpty,
    TaoList,
    TaoListItem,
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

export {
    parseTaoDate,
    parseTaoDateRange,
    formatTaoDateIso,
    todayTaoDate,
    formatTaoDateLabel,
    formatTaoDateRangeLabel,
} from './date';
export { localeRu, localeEn, setTaoLocale, taoLocale, provideTaoLocale } from './locale';
export type { TaoLocale, TaoLocaleOverrides } from './locale';
export type { TaoSize } from './size';
export type { TaoTone, TaoToneName } from './tone';
export { toneClass } from './tone';
export type { TaoDensity, TaoResolvedDensity } from './density';
export { apcaContrast, applyTaoPalette, contrastRatio, paletteCss as taoPaletteCss } from './palette';
export { taoPalettes } from './palettes';
export type { TaoPaletteDef, TaoPaletteMode, TaoStatusName } from './palette';
export { registerTaoIcons, taoIconNames } from './icons';
export type { TaoIconDef } from './icons';
export type { TaoSurface } from './surface';
export type { TaoLength } from './length';
export type { TaoJustify } from './layout';
export type { TaoSelectOption } from './select';
export type { TaoPlacement } from './floating';
export type { TaoTabItem } from './tabs';
export type { TaoDateCell, TaoDateParts, TaoDateRangeValue } from './date';
export type { TaoRadioValue } from './radio';
export type { TaoSpoilerName } from './spoiler';
export type { TaoFormFieldContext } from './formField';
export type { TaoTableAlign, TaoTableColumn, TaoTableSort } from './table';
export type { TaoPaginationItem } from './pagination';
export type { TaoBreadcrumbItem } from './breadcrumb';
export type {
    TaoMenuActionItem,
    TaoMenuCheckboxItem,
    TaoMenuCloseReason,
    TaoMenuItem,
    TaoMenuLabelItem,
    TaoMenuRadioItem,
    TaoMenuSeparatorItem,
} from './menu';
export { menuReturnsFocus } from './menu';
export type { TaoNavItem, TaoNavLayout } from './nav';
export type { TaoTreeCheckState, TaoTreeNode, TaoTreeSelection } from './tree';
export type { TaoChecklistItem } from './checklist';
export type { TaoStripe, TaoStripeTone } from './stripe';
export type { TaoGridSize, TaoGridSpan, TaoResponsive } from './grid';
export type { TaoTimelineAlign, TaoTimelineItem, TaoTimelineState } from './timeline';
export type { TaoQuantityChangeSource } from './quantity';
export type { TaoStageItem, TaoStageStatus } from './stage';
export type { TaoSplitDirection, TaoSplitUnit } from './split';
export type { TaoSliderMark, TaoSliderValue } from './slider';
export { colorModel, type ColorModelOptions } from './colorModel';
export { hslToRgb, hsvaToRgba, rgbToHsl, type ColorMode, linearToSrgb, normalizeHex, parseColor, rgbaToHsva, srgbToLinear, toHex, type Hsva, type Rgba } from './color';

export default TaoUI;
